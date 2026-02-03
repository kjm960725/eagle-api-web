import EventEmitter from 'eventemitter3';
import WebSocket from 'isomorphic-ws';
import type { EagleApiClient } from '../EagleApiClient.js';
import type { Logger } from '../types/config.js';
import { ApiError, Errors } from '../types/errors.js';
import type { SnapshotFlagValue } from '../types/constants.js';

// ============================================================
// 타입 정의
// ============================================================

/**
 * 문서 변경 유형
 */
export type DocumentChangeType = 'add' | 'update' | 'remove';

/**
 * 문서 변경 정보
 */
export interface DocumentChange<T = unknown> {
  /** 문서 ID */
  id: string;
  /** 컬렉션명 */
  collectionName: string;
  /** 변경 유형 */
  changeType: DocumentChangeType;
  /** 현재 데이터 */
  data: T | null;
  /** 이전 데이터 */
  previousData: T | null;
  /** 변경된 필드 목록 (update 시) */
  changedFields: string[];
  /** 업데이트 시간 */
  updateTime: number;
}

/**
 * 특정 프로퍼티가 변경되었는지 확인
 * C#의 IsPropertyChanged와 동일
 */
export function isPropertyChanged<T extends Record<string, unknown>>(
  change: DocumentChange<T>,
  propertyName: keyof T
): boolean {
  return change.changedFields.includes(propertyName as string);
}

/**
 * 변경된 프로퍼티의 이전/현재 값 가져오기
 */
export function getPropertyChange<T extends Record<string, unknown>, K extends keyof T>(
  change: DocumentChange<T>,
  propertyName: K
): { previous: T[K] | undefined; current: T[K] | undefined; changed: boolean } {
  const previous = change.previousData?.[propertyName];
  const current = change.data?.[propertyName];
  const changed = change.changedFields.includes(propertyName as string);
  
  return { previous, current, changed };
}

/**
 * 리스너 상태
 */
export interface ListenerState {
  /** 리스닝 중 여부 */
  isListening: boolean;
  /** 소켓 연결 여부 */
  isConnected: boolean;
  /** 에러 여부 */
  isError: boolean;
  /** 에러 메시지 */
  errorMessage: string;
  /** 재연결 시도 횟수 */
  reconnectAttempts: number;
}

/**
 * 스냅샷 이벤트 인자
 */
export interface SnapshotEventArgs {
  /** 초기화 완료 여부 */
  isInitialized: boolean;
  /** 원본 JSON 응답 */
  rawJson: Record<string, unknown>;
  /** 변경된 문서들 */
  changes: DocumentChange[];
}

/**
 * 이벤트 리스너 이벤트 타입
 */
export interface EventListenerEvents {
  /** 상태 변경 */
  stateChanged: (state: ListenerState) => void;
  /** 스냅샷 수신 */
  snapshot: (args: SnapshotEventArgs) => void;
  /** 문서 변경 (개별 문서별) */
  documentChanged: (change: DocumentChange) => void;
}

/**
 * Listen 옵션
 */
export interface ListenOptions {
  /** 업소 ID */
  accomId: string;
  /** 스냅샷 플래그 목록 */
  snapshots: (SnapshotFlagValue | string)[];
  /** 자신의 변경 이벤트 무시 여부 */
  ignoreOwnChanges?: boolean;
  /** 
   * Ping-Pong 헬스체크 활성화 여부 (기본값: false)
   * 주의: 서버가 PING 명령을 지원해야 함
   */
  enablePingPong?: boolean;
}

// ============================================================
// 내부 상수
// ============================================================

/** 재연결 기본 대기 시간 (ms) */
const RECONNECT_BASE_DELAY = 3000;
/** 재연결 최대 대기 시간 (ms) */
const RECONNECT_MAX_DELAY = 30000;
/** Ping 간격 (ms) */
const PING_INTERVAL = 30000;
/** Pong 타임아웃 (ms) */
const PONG_TIMEOUT = 15000;
/** 토큰 갱신 기준 시간 (ms) - 55분 */
const TOKEN_REFRESH_THRESHOLD = 55 * 60 * 1000;
/** 메시지 수신 타임아웃 (ms) - 2분 동안 메시지 없으면 재연결 */
const MESSAGE_RECEIVE_TIMEOUT = 2 * 60 * 1000;

// ============================================================
// 메인 클래스
// ============================================================

/**
 * WebSocket 기반 실시간 이벤트 리스너 클라이언트
 *
 * 주요 기능:
 * - 자동 재연결 (서버 1시간 타임아웃 대응)
 * - Ping-Pong 헬스체크
 * - 필드별 변경 감지 + 중복 이벤트 차단
 * - 토큰 자동 갱신
 */
export class EventListenerClient extends EventEmitter<EventListenerEvents> {
  private readonly apiClient: EagleApiClient;
  private readonly logger: Logger;

  private socket: WebSocket | null = null;
  private listenOptions: ListenOptions | null = null;
  private cancelRequested = false;

  // 상태 관리
  private _state: ListenerState = {
    isListening: false,
    isConnected: false,
    isError: false,
    errorMessage: '',
    reconnectAttempts: 0,
  };

  // Ping-Pong 관리
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private pongTimer: ReturnType<typeof setTimeout> | null = null;
  
  // 메시지 수신 타임아웃 관리
  private lastMessageTime = 0;
  private messageTimeoutTimer: ReturnType<typeof setInterval> | null = null;

  // 스냅샷 초기화 추적
  private snapshotReceivedCount = 0;
  private expectedSnapshotCount = 0;

  // 중복 이벤트 방지를 위한 캐시 (collectionName:id -> updateTime)
  private documentCache = new Map<string, { data: unknown; updateTime: number }>();

  constructor(apiClient: EagleApiClient, logger?: Logger) {
    super();
    this.apiClient = apiClient;
    this.logger = logger ?? {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * 현재 리스너 상태
   */
  get state(): ListenerState {
    return { ...this._state };
  }

  /**
   * 연결 여부
   */
  get isConnected(): boolean {
    return this._state.isConnected;
  }

  /**
   * 이벤트 수신 시작
   */
  listen(options: ListenOptions): void {
    if (this._state.isListening) {
      this.logger.warn('이미 리스닝 중입니다. 먼저 stop()을 호출하세요.');
      return;
    }

    this.listenOptions = options;
    this.cancelRequested = false;
    this.snapshotReceivedCount = 0;
    this.expectedSnapshotCount = options.snapshots.length;
    this.documentCache.clear();

    this.startListening();
  }

  /**
   * 이벤트 수신 중지
   */
  async stop(timeoutMs = 5000): Promise<boolean> {
    if (!this._state.isListening) {
      return true;
    }

    this.cancelRequested = true;
    this.stopPingPong();

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        this.forceClose();
        resolve(false);
      }, timeoutMs);

      const checkStopped = () => {
        if (!this._state.isListening) {
          clearTimeout(timeout);
          resolve(true);
        } else {
          setTimeout(checkStopped, 100);
        }
      };

      this.closeSocket();
      checkStopped();
    });
  }

  /**
   * 초기 스냅샷 수신 완료 대기
   */
  async waitForInitialized(timeoutMs = 30000): Promise<boolean> {
    if (!this._state.isListening) {
      throw new Error('listen()을 먼저 호출해야 합니다.');
    }

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        this.off('snapshot', onSnapshot);
        resolve(false);
      }, timeoutMs);

      const onSnapshot = (args: SnapshotEventArgs) => {
        if (args.isInitialized) {
          clearTimeout(timeout);
          this.off('snapshot', onSnapshot);
          resolve(true);
        }
      };

      // 이미 초기화 완료된 경우
      if (this.snapshotReceivedCount >= this.expectedSnapshotCount) {
        clearTimeout(timeout);
        resolve(true);
        return;
      }

      this.on('snapshot', onSnapshot);
    });
  }

  /**
   * 리소스 정리
   */
  dispose(): void {
    this.cancelRequested = true;
    this.stopPingPong();
    this.forceClose();
    this.removeAllListeners();
    this.documentCache.clear();
  }

  // ============================================================
  // Private - 연결 관리
  // ============================================================

  private async startListening(): Promise<void> {
    this.updateState({ isListening: true, reconnectAttempts: 0 });

    while (!this.cancelRequested) {
      try {
        await this.connect();
        await this.messageLoop();
      } catch (error) {
        if (this.cancelRequested) break;

        const isExplicitError = error instanceof ApiError &&
          (error.code === 'PROTOCOL_ERROR' || error.code === 'AUTH_FAILED');

        if (isExplicitError) {
          this.updateState({
            isListening: false,
            isConnected: false,
            isError: true,
            errorMessage: error.message,
          });
          break;
        }

        // 재연결 시도
        this.updateState({
          isConnected: false,
          reconnectAttempts: this._state.reconnectAttempts + 1,
        });

        const delay = this.calculateReconnectDelay();
        this.logger.info(`${delay}ms 후 재연결 시도... (시도 ${this._state.reconnectAttempts})`);

        await this.sleep(delay);
      } finally {
        this.closeSocket();
      }
    }

    this.updateState({ isListening: false, isConnected: false });
  }

  private async connect(): Promise<void> {
    if (!this.listenOptions) {
      throw Errors.protocolError('listenOptions가 설정되지 않았습니다');
    }

    // 토큰 갱신 필요 여부 확인
    await this.refreshTokenIfNeeded();

    const url = this.apiClient.eventListenerUrl;
    if (!url) {
      throw Errors.authFailed('eventListenerUrl이 없습니다. 먼저 인증하세요.');
    }

    this.logger.info(`WebSocket 연결 중: ${url}`);

    this.socket = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${this.apiClient.apiKey}`,
        'User-Agent': 'EagleApi/TypeScript',
      },
    });

    await this.waitForOpen();

    this.updateState({ isConnected: true, reconnectAttempts: 0 });
    this.logger.info('WebSocket 연결 완료');

    // JOIN 명령 전송
    await this.sendJoin();

    // 메시지 수신 타임아웃 체크 시작
    this.startMessageTimeoutCheck();

    // Ping-Pong 시작 (옵션 활성화 시)
    if (this.listenOptions.enablePingPong) {
      this.startPingPong();
    }
  }

  private waitForOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket is null'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(Errors.timeout(10000));
      }, 10000);

      this.socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.socket.onerror = (event: WebSocket.ErrorEvent) => {
        clearTimeout(timeout);
        reject(Errors.websocketError(`연결 실패: ${event.message ?? 'unknown'}`));
      };
    });
  }

  private async sendJoin(): Promise<void> {
    if (!this.socket || !this.listenOptions) return;

    const joinData = {
      command: 'JOIN',
      data: {
        accom_id: this.listenOptions.accomId,
        snapshot: this.listenOptions.snapshots,
        disable_event_changed_by_yourself: this.listenOptions.ignoreOwnChanges ?? false,
      },
    };

    // 서버가 준비되도록 약간 대기
    await this.sleep(500);

    this.socket.send(JSON.stringify(joinData));
    this.logger.debug('JOIN 명령 전송', joinData.data);
  }

  private async messageLoop(): Promise<void> {
    if (!this.socket) return;

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        resolve();
        return;
      }

      this.socket.onmessage = async (event: WebSocket.MessageEvent) => {
        try {
          const message = JSON.parse(event.data.toString());
          await this.handleMessage(message);
        } catch (error) {
          this.logger.error('메시지 처리 오류', { error });
        }
      };

      this.socket.onclose = (event: WebSocket.CloseEvent) => {
        this.logger.info(`WebSocket 연결 종료: code=${event.code}, reason=${event.reason}`);
        this.stopPingPong();
        resolve();
      };

      this.socket.onerror = (event: WebSocket.ErrorEvent) => {
        this.logger.error(`WebSocket 오류: ${event.message ?? 'unknown'}`);
        reject(Errors.websocketError(event.message ?? 'WebSocket error'));
      };
    });
  }

  // ============================================================
  // Private - 메시지 처리
  // ============================================================

  private async handleMessage(message: Record<string, unknown>): Promise<void> {
    // 메시지 수신 시간 업데이트 (연결 상태 감지용)
    this.lastMessageTime = Date.now();
    
    const type = message['type'] as string;

    switch (type) {
      case 'SNAPSHOT':
        await this.handleSnapshot(message);
        break;

      case 'PONG':
        this.handlePong();
        break;

      case 'ERROR':
        this.handleError(message);
        break;

      default:
        this.logger.debug(`알 수 없는 메시지 타입: ${type}`);
    }
  }

  private async handleSnapshot(message: Record<string, unknown>): Promise<void> {
    const queueCount = (message['queue_count'] as number) ?? 0;
    const data = message['data'] as Record<string, unknown> | undefined;

    // 백프레셔 제어: 다음 메시지 요청
    if (queueCount > 0) {
      this.sendAccept();
    }

    if (!data) return;

    // 변경 감지 및 중복 제거
    const changes = this.detectChanges(data);

    // 스냅샷 카운트 증가
    this.snapshotReceivedCount++;
    const isInitialized = this.snapshotReceivedCount >= this.expectedSnapshotCount;

    // 스냅샷 이벤트 발행
    const eventArgs: SnapshotEventArgs = {
      isInitialized,
      rawJson: data,
      changes,
    };

    this.emit('snapshot', eventArgs);

    // 개별 문서 변경 이벤트 발행
    for (const change of changes) {
      this.emit('documentChanged', change);
    }
  }

  private handlePong(): void {
    this.clearPongTimeout();
    this.logger.debug('PONG 수신');
  }

  private handleError(message: Record<string, unknown>): void {
    const errorCode = (message['error_code'] as string) ?? 'UNKNOWN';
    const errorMessage = (message['error_message'] as string) ?? '';

    this.logger.error(`서버 에러: ${errorCode} - ${errorMessage}`);

    throw new ApiError({
      code: errorCode === 'AUTH_FAILED' ? 'AUTH_FAILED' : 'PROTOCOL_ERROR',
      message: errorMessage || `서버 에러: ${errorCode}`,
    });
  }

  // ============================================================
  // Private - 변경 감지 및 중복 제거
  // ============================================================

  private detectChanges(data: Record<string, unknown>): DocumentChange[] {
    const changes: DocumentChange[] = [];

    for (const [collectionName, collection] of Object.entries(data)) {
      if (!collection || typeof collection !== 'object') continue;

      for (const [docId, docData] of Object.entries(collection as Record<string, unknown>)) {
        const cacheKey = `${collectionName}:${docId}`;
        const cached = this.documentCache.get(cacheKey);
        const newUpdateTime = this.extractUpdateTime(docData);

        // 삭제된 문서
        if (docData === null) {
          if (cached) {
            changes.push({
              id: docId,
              collectionName,
              changeType: 'remove',
              data: null,
              previousData: cached.data,
              changedFields: [],
              updateTime: newUpdateTime,
            });
            this.documentCache.delete(cacheKey);
          }
          continue;
        }

        // 중복 이벤트 체크 (update_time 비교)
        if (cached && newUpdateTime > 0 && cached.updateTime > 0) {
          if (newUpdateTime <= cached.updateTime) {
            // 오래된 이벤트 무시
            this.logger.debug(`중복 이벤트 무시: ${cacheKey} (${newUpdateTime} <= ${cached.updateTime})`);
            continue;
          }
        }

        // 새 문서 or 업데이트
        const changeType: DocumentChangeType = cached ? 'update' : 'add';
        
        // 변경된 필드 감지: 이전 캐시 데이터와 새 데이터를 비교
        const changedFields = cached
          ? this.getChangedFields(cached.data as Record<string, unknown>, docData as Record<string, unknown>)
          : [];

        // 변경이 없으면 스킵 (update인데 변경된 필드가 없는 경우)
        if (changeType === 'update' && changedFields.length === 0) {
          // updateTime만 다른 경우 캐시만 업데이트
          this.documentCache.set(cacheKey, { data: docData, updateTime: newUpdateTime });
          continue;
        }

        changes.push({
          id: docId,
          collectionName,
          changeType,
          data: docData,
          previousData: cached?.data ?? null,
          changedFields,
          updateTime: newUpdateTime,
        });

        // 캐시 업데이트
        this.documentCache.set(cacheKey, { data: docData, updateTime: newUpdateTime });
      }
    }

    return changes;
  }

  private extractUpdateTime(data: unknown): number {
    if (!data || typeof data !== 'object') return 0;
    const updateTime = (data as Record<string, unknown>)['update_time'];
    return typeof updateTime === 'number' ? updateTime : 0;
  }

  /**
   * 이전 데이터와 새 데이터를 비교해서 변경된 필드 목록 반환
   * 
   * 서버는 변경 시 전체 도큐먼트를 보내지만, 어떤 필드가 변경되었는지는
   * 알려주지 않으므로 클라이언트에서 직접 비교하여 changedFields를 추출
   */
  private getChangedFields(
    previous: Record<string, unknown>,
    current: Record<string, unknown>
  ): string[] {
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

    for (const key of allKeys) {
      const prevValue = previous[key];
      const currValue = current[key];

      if (!this.deepEqual(prevValue, currValue)) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, i) => this.deepEqual(val, b[i]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const aKeys = Object.keys(aObj);
      const bKeys = Object.keys(bObj);

      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) => this.deepEqual(aObj[key], bObj[key]));
    }

    return false;
  }

  // ============================================================
  // Private - 메시지 수신 타임아웃 체크
  // ============================================================

  private startMessageTimeoutCheck(): void {
    this.stopMessageTimeoutCheck();
    this.lastMessageTime = Date.now();

    // 30초마다 마지막 메시지 수신 시간 체크
    this.messageTimeoutTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastMessageTime;
      
      if (elapsed >= MESSAGE_RECEIVE_TIMEOUT) {
        this.logger.warn(`${MESSAGE_RECEIVE_TIMEOUT / 1000}초 동안 메시지 없음 - 재연결 시도`);
        this.closeSocket();
      }
    }, 30000);
  }

  private stopMessageTimeoutCheck(): void {
    if (this.messageTimeoutTimer) {
      clearInterval(this.messageTimeoutTimer);
      this.messageTimeoutTimer = null;
    }
  }

  // ============================================================
  // Private - Ping-Pong
  // ============================================================

  private startPingPong(): void {
    this.stopPingPong();

    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, PING_INTERVAL);
  }

  private stopPingPong(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.clearPongTimeout();
    this.stopMessageTimeoutCheck();
  }

  private sendPing(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    this.socket.send(JSON.stringify({ command: 'PING' }));
    this.logger.debug('PING 전송');

    // Pong 타임아웃 설정
    this.pongTimer = setTimeout(() => {
      this.logger.warn('PONG 타임아웃 - 재연결 시도');
      this.closeSocket();
    }, PONG_TIMEOUT);
  }

  private clearPongTimeout(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private sendAccept(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ command: 'ACCEPT' }));
  }

  // ============================================================
  // Private - 토큰 관리
  // ============================================================

  private async refreshTokenIfNeeded(): Promise<void> {
    const lastAuthTime = this.apiClient._restClient.lastAuthTime;
    if (!lastAuthTime) return;

    const elapsed = Date.now() - lastAuthTime.getTime();

    if (elapsed >= TOKEN_REFRESH_THRESHOLD) {
      this.logger.info('토큰 갱신 중...');
      await this.apiClient.refreshToken();
      this.logger.info('토큰 갱신 완료');
    }
  }

  // ============================================================
  // Private - 유틸리티
  // ============================================================

  private updateState(partial: Partial<ListenerState>): void {
    this._state = { ...this._state, ...partial };

    try {
      this.emit('stateChanged', this.state);
    } catch (error) {
      this.logger.error('stateChanged 이벤트 핸들러 오류', { error });
    }
  }

  private calculateReconnectDelay(): number {
    const attempts = this._state.reconnectAttempts;
    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, attempts),
      RECONNECT_MAX_DELAY
    );
    // 약간의 랜덤 지터 추가
    return delay + Math.random() * 1000;
  }

  private closeSocket(): void {
    if (this.socket) {
      try {
        if (this.socket.readyState === WebSocket.OPEN ||
            this.socket.readyState === WebSocket.CONNECTING) {
          this.socket.close(1000, 'Normal closure');
        }
      } catch (error) {
        this.logger.debug('소켓 종료 중 오류', { error });
      }
      this.socket = null;
    }
  }

  private forceClose(): void {
    this.stopPingPong();
    if (this.socket) {
      try {
        this.socket.terminate?.();
      } catch {
        // ignore
      }
      this.socket = null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
