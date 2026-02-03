import EventEmitter from 'eventemitter3';
import {
  type EagleApiConfig,
  type Logger,
  resolveConfig,
} from '../types/config.js';
import { ApiError, Errors } from '../types/errors.js';
import type { RestApiClientEvents, ClientSnapshotEventArgs } from '../types/events.js';
import {
  type AuthState,
  type ApiAuthType,
  type DeviceAuthRequest,
  type AppAuthRequest,
  type UserAuthRequest,
  createInitialAuthState,
  getAuthType,
  parseAuthResult,
} from './auth.js';

/**
 * EagleApi REST API 클라이언트
 * 
 * C#의 ERestApiClient에 해당
 */
export class RestApiClient extends EventEmitter<RestApiClientEvents> {
  private readonly config: ReturnType<typeof resolveConfig>;
  private readonly logger: Logger;
  private authState: AuthState;
  private isRefreshingToken = false;

  constructor(config: EagleApiConfig) {
    super();
    this.config = resolveConfig(config);
    this.logger = this.config.logger;
    this.authState = createInitialAuthState();
  }

  // ============================================================
  // Public Getters
  // ============================================================

  /** 앱 ID */
  get appId(): string {
    return this.config.appId;
  }

  /** API 기본 URL */
  get baseUrl(): string {
    return this.config.baseUrl;
  }

  /** API 키 */
  get apiKey(): string {
    return this.authState.apiKey;
  }

  /** API 버전 */
  get apiVersion(): string {
    return this.authState.apiVersion;
  }

  /** 이벤트 리스너 URL */
  get eventListenerUrl(): string {
    return this.authState.eventListenerUrl;
  }

  /** 인증 유형 */
  get authType(): ApiAuthType {
    return getAuthType(this.authState);
  }

  /** 인증된 앱 */
  get authedApp() {
    return this.authState.authedApp;
  }

  /** 인증된 사용자 */
  get authedUser() {
    return this.authState.authedUser;
  }

  /** 인증된 디바이스 */
  get authedDevice() {
    return this.authState.authedDevice;
  }

  /** 마지막 인증 시간 */
  get lastAuthTime() {
    return this.authState.lastAuthTime;
  }

  // ============================================================
  // Authentication
  // ============================================================

  /**
   * 디바이스로 인증
   */
  async authForDevice(macAddress: string): Promise<void> {
    this.logger.info(`디바이스 인증 시작 - MAC: ${macAddress}`);
    
    const request: DeviceAuthRequest = {
      app_id: this.config.appId,
      mac_address: macAddress,
    };

    await this.auth('/v1/token/device', request);
    this.authState.lastAuthRequest = { type: 'device', request };
  }

  /**
   * 앱으로 인증
   */
  async authForApp(secret: string): Promise<void> {
    this.logger.info('앱 인증 시작');
    
    const request: AppAuthRequest = {
      app_id: this.config.appId,
      secret,
    };

    await this.auth('/v1/token/app', request);
    this.authState.lastAuthRequest = { type: 'app', request };
  }

  /**
   * 사용자로 인증
   */
  async authForUser(userId: string, password: string): Promise<void> {
    this.logger.info(`사용자 인증 시작 - ID: ${userId}`);
    
    const request: UserAuthRequest = {
      app_id: this.config.appId,
      user_id: userId,
      password,
    };

    await this.auth('/v1/token/user', request);
    this.authState.lastAuthRequest = { type: 'user', request };
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<void> {
    const { lastAuthRequest } = this.authState;
    
    if (!lastAuthRequest) {
      throw Errors.authFailed('이전 인증 정보가 없어 토큰을 갱신할 수 없습니다');
    }

    this.logger.info('토큰 갱신 시작');

    switch (lastAuthRequest.type) {
      case 'device':
        await this.authForDevice(lastAuthRequest.request.mac_address);
        break;
      case 'app':
        await this.authForApp(lastAuthRequest.request.secret);
        break;
      case 'user':
        await this.authForUser(
          lastAuthRequest.request.user_id,
          lastAuthRequest.request.password
        );
        break;
    }
  }

  // ============================================================
  // HTTP Methods
  // ============================================================

  /**
   * GET 요청
   */
  async get<T = unknown>(path: string): Promise<T> {
    return this.sendForJson<T>('GET', path);
  }

  /**
   * POST 요청
   */
  async post<T = unknown>(path: string, data?: unknown): Promise<T> {
    return this.sendForJson<T>('POST', path, data);
  }

  /**
   * PUT 요청
   */
  async put<T = unknown>(path: string, data?: unknown): Promise<T> {
    return this.sendForJson<T>('PUT', path, data);
  }

  /**
   * DELETE 요청
   */
  async delete<T = unknown>(path: string): Promise<T> {
    return this.sendForJson<T>('DELETE', path);
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * 인증 처리
   */
  private async auth(path: string, body: unknown): Promise<void> {
    const json = await this.sendForJson<unknown>('POST', path, body);
    
    try {
      const result = parseAuthResult(json);
      
      this.authState.apiKey = result.token;
      this.authState.apiVersion = result.apiVersion;
      this.authState.eventListenerUrl = result.eventListenerUrl;
      this.authState.authedApp = result.apps[0] ?? null;
      this.authState.authedUser = result.users[0] ?? null;
      this.authState.authedDevice = result.devices[0] ?? null;
      this.authState.lastAuthTime = new Date();

      if (!this.authState.apiKey) {
        throw Errors.authFailed('API 키를 받지 못했습니다');
      }

      this.logger.info('인증 성공');
    } catch (error) {
      if (ApiError.isApiError(error)) throw error;
      throw Errors.parseError(error instanceof Error ? error : undefined);
    }
  }

  /**
   * JSON 요청 전송
   */
  private async sendForJson<T>(
    method: string,
    path: string,
    data?: unknown,
    isRetry = false
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    
    // 요청 로그
    this.logger.debug(`[REQ] ${method} ${url}`, data ? { body: data } : {});

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': this.getUserAgent(),
    };

    if (this.authState.apiKey) {
      headers['Authorization'] = `Bearer ${this.authState.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };
      
      if (data !== undefined) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      // 401 처리 - 토큰 갱신 후 재시도
      if (response.status === 401 && !isRetry) {
        if (!this.isRefreshingToken) {
          this.isRefreshingToken = true;
          try {
            await this.refreshToken();
          } finally {
            this.isRefreshingToken = false;
          }
        }
        return this.sendForJson<T>(method, path, data, true);
      }

      // 응답 파싱
      const responseText = await response.text();
      let responseJson: unknown;

      try {
        responseJson = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw Errors.parseError();
      }

      // 응답 로그
      this.logger.debug(`[RES] ${method} ${url} -> ${response.status}`, {
        body: responseJson,
      });

      // 에러 응답 처리
      if (!response.ok) {
        const errorMessage = typeof responseJson === 'object' && responseJson !== null
          ? (responseJson as Record<string, unknown>)['message'] as string | undefined
          : undefined;
        throw Errors.httpError(response.status, errorMessage);
      }

      // 스냅샷 이벤트 발행
      this.emitSnapshot(path, method, responseJson as Record<string, unknown>);

      return responseJson as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw Errors.timeout(this.config.timeout);
      }

      if (ApiError.isApiError(error)) {
        throw error;
      }

      throw Errors.networkError(error instanceof Error ? error : undefined);
    }
  }

  /**
   * User-Agent 문자열 생성
   */
  private getUserAgent(): string {
    const appName = this.authState.authedApp?.data?.name ?? 'EagleApi';
    return `${appName}/TypeScript`;
  }

  /**
   * 스냅샷 이벤트 발행
   */
  private emitSnapshot(
    requestPath: string,
    requestMethod: string,
    responseJson: Record<string, unknown>
  ): void {
    const args: ClientSnapshotEventArgs = {
      requestPath,
      requestMethod,
      responseJson,
    };

    try {
      this.emit('snapshot', args);
    } catch (error) {
      this.logger.error('스냅샷 이벤트 핸들러 오류', { error });
    }
  }
}
