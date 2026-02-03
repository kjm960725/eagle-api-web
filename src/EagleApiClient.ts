import { RestApiClient } from './client/RestApiClient.js';
import { EventListenerClient, type ListenOptions } from './client/EventListenerClient.js';
import { Controllers } from './controllers/Controllers.js';
import type { EagleApiConfig } from './types/config.js';
import type { ApiAuthType } from './client/auth.js';

/**
 * EagleApi 메인 클라이언트
 * 
 * iCrew Cloud API와 통신하기 위한 통합 클라이언트입니다.
 * 
 * @example
 * ```typescript
 * // 클라이언트 생성
 * const client = new EagleApiClient({ appId: 'your-app-id' });
 * 
 * // 디바이스로 인증
 * await client.authForDevice('AA:BB:CC:DD:EE:FF');
 * 
 * // 객실 조회
 * const rooms = await client.controller.room.getAllByAccom(accomId);
 * 
 * // 객실 업데이트
 * await client.controller.room.update(accomId, roomId, {
 *   temp: 25,
 *   setTemp: 26,
 * });
 * ```
 */
export class EagleApiClient {
  private readonly restClient: RestApiClient;
  private readonly config: EagleApiConfig;
  
  /** Controllers Facade */
  readonly controller: Controllers;

  constructor(config: EagleApiConfig) {
    this.config = config;
    this.restClient = new RestApiClient(config);
    this.controller = new Controllers(this.restClient);
  }

  // ============================================================
  // Event Listener
  // ============================================================

  /**
   * WebSocket 이벤트 리스너 생성
   * 
   * @example
   * ```typescript
   * const listener = client.createEventListener();
   * 
   * listener.on('documentChanged', (change) => {
   *   console.log(`${change.collectionName}/${change.id} ${change.changeType}`);
   *   console.log('변경된 필드:', change.changedFields);
   * });
   * 
   * listener.listen({
   *   accomId: 'accom-id',
   *   snapshots: [SnapshotFlag.ALL_ROOMS, SnapshotFlag.ACTIVATED_ROOM_SALES],
   * });
   * 
   * await listener.waitForInitialized();
   * ```
   */
  createEventListener(): EventListenerClient {
    return new EventListenerClient(this, this.config.logger);
  }

  /**
   * 간편 이벤트 리스너 시작
   * 
   * @returns 리스너 인스턴스
   */
  async startEventListener(options: ListenOptions): Promise<EventListenerClient> {
    const listener = this.createEventListener();
    listener.listen(options);
    await listener.waitForInitialized();
    return listener;
  }

  // ============================================================
  // Authentication
  // ============================================================

  /**
   * 디바이스로 인증
   * @param macAddress MAC 주소 (예: 'AA:BB:CC:DD:EE:FF')
   */
  async authForDevice(macAddress: string): Promise<void> {
    return this.restClient.authForDevice(macAddress);
  }

  /**
   * 앱으로 인증
   * @param secret 앱 시크릿
   */
  async authForApp(secret: string): Promise<void> {
    return this.restClient.authForApp(secret);
  }

  /**
   * 사용자로 인증
   * @param userId 사용자 ID
   * @param password 비밀번호
   */
  async authForUser(userId: string, password: string): Promise<void> {
    return this.restClient.authForUser(userId, password);
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<void> {
    return this.restClient.refreshToken();
  }

  // ============================================================
  // Getters
  // ============================================================

  /** 앱 ID */
  get appId(): string {
    return this.restClient.appId;
  }

  /** API 기본 URL */
  get baseUrl(): string {
    return this.restClient.baseUrl;
  }

  /** API 키 */
  get apiKey(): string {
    return this.restClient.apiKey;
  }

  /** 인증 유형 */
  get authType(): ApiAuthType {
    return this.restClient.authType;
  }

  /** 인증된 디바이스 */
  get authedDevice() {
    return this.restClient.authedDevice;
  }

  /** 인증된 사용자 */
  get authedUser() {
    return this.restClient.authedUser;
  }

  /** 인증된 앱 */
  get authedApp() {
    return this.restClient.authedApp;
  }

  /** 이벤트 리스너 URL */
  get eventListenerUrl(): string {
    return this.restClient.eventListenerUrl;
  }

  // ============================================================
  // Events
  // ============================================================

  /**
   * 스냅샷 이벤트 리스너 등록
   */
  onSnapshot(
    listener: (args: import('./types/events.js').ClientSnapshotEventArgs) => void
  ): this {
    this.restClient.on('snapshot', listener);
    return this;
  }

  /**
   * 스냅샷 이벤트 리스너 제거
   */
  offSnapshot(
    listener: (args: import('./types/events.js').ClientSnapshotEventArgs) => void
  ): this {
    this.restClient.off('snapshot', listener);
    return this;
  }

  // ============================================================
  // Internal Access (for EventListenerClient)
  // ============================================================

  /**
   * REST API 클라이언트 (내부용)
   * @internal
   */
  get _restClient(): RestApiClient {
    return this.restClient;
  }
}
