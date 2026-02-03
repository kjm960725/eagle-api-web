/**
 * EagleApi Enum 타입 정의
 * C# enum을 const assertion으로 변환
 */

// ============================================================
// 객실 관련 Enum
// ============================================================

/** 객실 상태 요약 */
export const RoomStateSummary = {
  /** 공실 */
  EMPTY: 'EMPTY',
  /** 점검중 */
  INSPECTING: 'INSPECTING',
  /** 청소중 */
  CLEANING: 'CLEANING',
  /** 점검 대기 */
  INSPECT_ORDER: 'INSPECT_ORDER',
  /** 청소 대기 */
  CLEAN_ORDER: 'CLEAN_ORDER',
  /** 외출 */
  OUTING: 'OUTING',
  /** 사용중 */
  USING: 'USING',
} as const;
export type RoomStateSummary = (typeof RoomStateSummary)[keyof typeof RoomStateSummary];

/** 객실 키 상태 */
export const RoomKey = {
  /** 키 없음 */
  EMPTY: 'EMPTY',
  /** 게스트 키 */
  GUEST: 'GUEST',
  /** 청소 키 */
  CLEAN: 'CLEAN',
  /** 점검 키 */
  INSPECT: 'INSPECT',
} as const;
export type RoomKey = (typeof RoomKey)[keyof typeof RoomKey];

/** 객실 이용 유형 */
export const RoomStayType = {
  /** 대실 */
  HOURS: 'HOURS',
  /** 숙박 */
  DAYS: 'DAYS',
  /** 장기 투숙 */
  LONG_DAYS: 'LONG_DAYS',
} as const;
export type RoomStayType = (typeof RoomStayType)[keyof typeof RoomStayType];

/** 문 상태 */
export const Door = {
  /** 열림 */
  OPEN: 'OPEN',
  /** 닫힘 */
  CLOSE: 'CLOSE',
} as const;
export type Door = (typeof Door)[keyof typeof Door];

/** 에어컨 전원 규칙 */
export const AirconPowerRule = {
  /** 항상 켜짐 */
  ALWAYS_ON: 'ALWAYS_ON',
  /** 항상 꺼짐 */
  ALWAYS_OFF: 'ALWAYS_OFF',
  /** 키 삽입 시만 켜짐 */
  ON_KEY_INSERTED: 'ON_KEY_INSERTED',
} as const;
export type AirconPowerRule = (typeof AirconPowerRule)[keyof typeof AirconPowerRule];

/** 비상 호출 */
export const EmeCall = {
  /** 호출 */
  CALL: 'CALL',
  /** 취소 */
  CANCEL: 'CANCEL',
} as const;
export type EmeCall = (typeof EmeCall)[keyof typeof EmeCall];

/** 차량 호출 */
export const CarCall = {
  /** 호출 */
  CALL: 'CALL',
  /** 취소 */
  CANCEL: 'CANCEL',
  /** 대기 완료 */
  STANDBY: 'STANDBY',
} as const;
export type CarCall = (typeof CarCall)[keyof typeof CarCall];

// ============================================================
// 예약 관련 Enum
// ============================================================

/** 예약 방문 유형 */
export const RoomReserveVisitType = {
  /** 도보 */
  ON_FOOT: 'ON_FOOT',
  /** 차량 */
  ON_CAR: 'ON_CAR',
} as const;
export type RoomReserveVisitType = (typeof RoomReserveVisitType)[keyof typeof RoomReserveVisitType];

/** 예약 상태 */
export const RoomReserveState = {
  /** 생성됨 */
  GENERATED: 'GENERATED',
  /** 취소됨 */
  CANCELED: 'CANCELED',
  /** 사용중 */
  USING: 'USING',
  /** 사용 완료 */
  USED: 'USED',
} as const;
export type RoomReserveState = (typeof RoomReserveState)[keyof typeof RoomReserveState];

// ============================================================
// 디바이스 관련 Enum
// ============================================================

/** 디바이스 유형 */
export const DeviceType = {
  /** 프론트 매니저 */
  FRONT_MANAGER: 'FRONT_MANAGER',
  /** 키오스크 */
  KIOSK: 'KIOSK',
  /** 데몬 (백그라운드 서비스) */
  DEMON: 'DEMON',
} as const;
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];

/** CCU 제조사 */
export const CcuVender = {
  /** 아이크루 */
  ICREW: 'ICREW',
  /** 신도이디에스 */
  SHINDO: 'SHINDO',
  /** 윈정보 */
  WIN: 'WIN',
  /** 369시스템 */
  SYSTEM_369: 'SYSTEM_369',
  /** 더엠알 */
  THE_MR: 'THE_MR',
  /** 케이테크 */
  KTECH: 'KTECH',
  /** 씨리얼 */
  SEEREAL: 'SEEREAL',
} as const;
export type CcuVender = (typeof CcuVender)[keyof typeof CcuVender];

// ============================================================
// 업소 관련 Enum
// ============================================================

/** 업종 */
export const AccomBusinessSector = {
  /** 모텔 */
  MOTEL: 'MOTEL',
  /** 호텔 */
  HOTEL: 'HOTEL',
  /** 펜션 */
  COTTAGE: 'COTTAGE',
  /** 기타 */
  OTHER: 'OTHER',
} as const;
export type AccomBusinessSector = (typeof AccomBusinessSector)[keyof typeof AccomBusinessSector];

// ============================================================
// 인증 관련 Enum
// ============================================================

/** 인증 유형 */
export const AuthType = {
  /** 사용자 인증 */
  USER: 'USER',
  /** 디바이스 인증 */
  DEVICE: 'DEVICE',
  /** 앱 인증 */
  APP: 'APP',
} as const;
export type AuthType = (typeof AuthType)[keyof typeof AuthType];

// ============================================================
// OTA 관련 Enum
// ============================================================

/** OTA 제공자 */
export const OtaProvider = {
  /** 프론트 */
  FRONT: 'FRONT',
  /** 떠나요 */
  DDNAYO: 'DDNAYO',
  /** 아고다 */
  AGODA: 'AGODA',
  /** 익스피디아 */
  EXPEDIA: 'EXPEDIA',
  /** 온다 */
  ONDA: 'ONDA',
  /** 여기어때 */
  GOOD_CHOICE: 'GOOD_CHOICE',
  /** 여기어때 호텔 */
  GOOD_CHOICE_HOTEL: 'GOOD_CHOICE_HOTEL',
  /** 야놀자 */
  YANOLJA: 'YANOLJA',
  /** 야놀자 호텔 */
  YANOLJA_HOTEL: 'YANOLJA_HOTEL',
  /** 네이버 */
  NAVER: 'NAVER',
  /** 에어비앤비 */
  AIR_BNB: 'AIR_BNB',
  /** 꿀스테이 */
  KULL_STAY: 'KULL_STAY',
  /** 부킹홀딩스 */
  BOOKING_HOLDINGS: 'BOOKING_HOLDINGS',
  /** 기타 */
  OTHER: 'OTHER',
} as const;
export type OtaProvider = (typeof OtaProvider)[keyof typeof OtaProvider];

// ============================================================
// 키오스크 관련 Enum
// ============================================================

/** 키오스크 유형 */
export const KioskType = {
  /** 카드덱 확장 가능 */
  PRO: 'PRO',
  /** 카드덱 내장 */
  AIR: 'AIR',
  /** 미니 키오스크 */
  OTA: 'OTA',
} as const;
export type KioskType = (typeof KioskType)[keyof typeof KioskType];

/** 키오스크 판매 상태 */
export const KioskSaleState = {
  /** 판매 대기 */
  SELLABLE: 'SELLABLE',
  /** 객실 선택중 */
  SELECTING_ROOM: 'SELECTING_ROOM',
  /** 예약번호 입력중 */
  TYPING_RESERVE_NO: 'TYPING_RESERVE_NO',
  /** 성인 인증중 */
  ADULT_AUTH: 'ADULT_AUTH',
  /** 현금 결제중 */
  PAYMENT_IN_CASH: 'PAYMENT_IN_CASH',
  /** 신용카드 결제중 */
  PAYMENT_IN_CREDIT_CARD: 'PAYMENT_IN_CREDIT_CARD',
  /** 결제 완료 */
  PAYMENT_COMPLETE: 'PAYMENT_COMPLETE',
  /** 빈 객실 없음 */
  NO_VACANT_ROOMS: 'NO_VACANT_ROOMS',
  /** 장치 오류 */
  DEVICE_ERROR: 'DEVICE_ERROR',
  /** 설정에 의한 중단 */
  INTERRUPTED_BY_SETTINGS: 'INTERRUPTED_BY_SETTINGS',
  /** 관리자 모드 */
  ADMIN: 'ADMIN',
} as const;
export type KioskSaleState = (typeof KioskSaleState)[keyof typeof KioskSaleState];

// ============================================================
// 알림 관련 Enum
// ============================================================

/** 알림 액션 유형 */
export const NotifyActionType = {
  /** 링크 이동 */
  HREF: 'HREF',
  /** OTA 설정으로 이동 */
  GO_TO_OTA_SETTINGS: 'GO_TO_OTA_SETTINGS',
} as const;
export type NotifyActionType = (typeof NotifyActionType)[keyof typeof NotifyActionType];
