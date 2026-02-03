/**
 * API 컬렉션 이름 상수
 * MongoDB 컬렉션명과 매핑
 */
export const CollectionName = {
  NOTIFY: 'notifies',
  APP: 'apps',
  USER: 'users',
  DEVICE: 'devices',
  ACCOM: 'accoms',
  ROOM: 'rooms',
  ROOM_STATE_LOG: 'room_state_logs',
  ROOM_TYPE: 'room_types',
  ROOM_INTERRUPT: 'room_interrupts',
  ROOM_SALE: 'room_sales',
  ROOM_PAYMENT: 'room_payments',
  ROOM_RESERVE: 'room_reserves',
  RESERVE_AGENT_CONFIG: 'reserve_agent_configs',
  DOOR_LOCK: 'door_locks',
  KIOSK: 'kiosks',
  CUSTOM_CONFIG: 'custom_configs',
} as const;

export type CollectionName = (typeof CollectionName)[keyof typeof CollectionName];

/**
 * WebSocket 스냅샷 플래그
 */
export const SnapshotFlag = {
  /** 업소 정보 */
  ACCOM: 'ACCOM',
  /** 자신의 앱 정보 */
  APP: 'APP',
  /** 모든 앱 정보 */
  ALL_APPS: 'ALL_APP',
  /** 모든 사용자 */
  ALL_USERS: 'ALL_USERS',
  /** 모든 디바이스 */
  ALL_DEVICES: 'ALL_DEVICES',
  /** 모든 객실 */
  ALL_ROOMS: 'ALL_ROOMS',
  /** 모든 객실 유형 */
  ALL_ROOM_TYPES: 'ALL_ROOM_TYPES',
  /** 최근 100개 객실 상태 로그 */
  LAST_100_ROOM_STATE_LOGS: 'LAST_100_ROOM_STATE_LOGS',
  /** 생성 및 사용중인 예약 */
  GENERATED_AND_USING_ROOM_RESERVED: 'GENERATED_AND_USING_ROOM_RESERVED',
  /** 모든 객실 중단 */
  ALL_ROOM_INTERRUPTS: 'ALL_ROOM_INTERRUPTS',
  /** 모든 도어락 */
  ALL_DOOR_LOCKS: 'ALL_DOOR_LOCKS',
  /** 모든 예약 에이전트 설정 */
  ALL_RESERVE_AGENT_CONFIGS: 'ALL_RESERVE_AGENT_CONFIGS',
  /** 활성 판매 */
  ACTIVATED_ROOM_SALES: 'ACTIVATED_ROOM_SALES',
  /** 모든 키오스크 */
  ALL_KIOSKS: 'ALL_KIOSKS',
  /** 모든 알림 */
  ALL_NOTIFY: 'ALL_NOTIFY',
  /** 자신의 키오스크 */
  KIOSK: 'KIOSK',
  /** 최근 100개 키오스크 로그 */
  LAST_100_KIOSK_LOGS: 'LAST_100_KIOSK_LOGS',
  /** 오늘의 모든 결제 */
  ALL_TODAY_PAYMENTS: 'ALL_TODAY_PAYMENTS',
} as const;

export type SnapshotFlagValue = (typeof SnapshotFlag)[keyof typeof SnapshotFlag];

/**
 * 동적 스냅샷 플래그 생성 함수
 */
export const SnapshotFlags = {
  /** 특정 디바이스 */
  device: (deviceId: string): string => `DEVICE:${deviceId}`,
  /** 커스텀 설정 */
  customConfig: (key: string): string => `CUSTOM_CONFIG:${key}`,
} as const;
