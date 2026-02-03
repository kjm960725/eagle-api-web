import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { AccomBusinessSector, CcuVender } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

// ============================================================
// 중첩 스키마 정의
// ============================================================

/**
 * 공지 스키마
 */
export const NoticeSchema = z.object({
  /** 메시지 */
  message: z.string().optional(),
  /** 시작 시간 */
  start_time: z.number().optional(),
  /** 종료 시간 */
  end_time: z.number().optional(),
  /** 제목 */
  title: z.string().optional(),
  /** 사용 여부 */
  use: z.boolean().optional(),
});

/**
 * 예약 SMS 설정 스키마
 */
export const ReserveSmsConfigSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(false),
  /** 헤더 메시지 */
  header_message: z.string().optional(),
  /** 발송 시간 (0-23시) */
  time_to_send: z.number().default(9),
  /** 푸터 메시지 (최대 900자) */
  footer_message: z.string().optional(),
});

/**
 * 사전 예약 SMS 설정 스키마
 */
export const InAdvanceReserveSmsConfigSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(false),
  /** 헤더 메시지 */
  header_message: z.string().optional(),
  /** 푸터 메시지 */
  footer_message: z.string().optional(),
});

/**
 * 마일리지 설정 스키마
 */
export const MileageConfigSchema = z.object({
  /** 마일리지 사용 여부 */
  use: z.boolean().default(false),
  /** 현금 적립 포인트 배수 (1% ~ 100%) */
  cash_mileage_rate: z.number().default(5),
  /** 카드 결제시 적립 포인트 배수 */
  card_mileage_rate: z.number().default(5),
  /** 예약시 적립 포인트 */
  ota_mileage_rate: z.number().default(5),
});

/**
 * CCU 정보 스키마
 */
export const CcuInfoSchema = z.object({
  /** CCU 제조사 */
  vender: z.nativeEnum(CcuVender).optional(),
  /** CCU 버전 */
  version: z.enum(['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9']).optional(),
  /** 그룹 ID */
  gid: z.number().optional(),
  /** 연결 상태 */
  connection: z.boolean().optional(),
});

/**
 * 예약 설정 스키마
 */
export const ReserveConfigSchema = z.object({
  /** 입실시간 x분 전에 미리 예약입실 가능 옵션 */
  can_check_in_begin_minutes: z.number().optional(),
});

/**
 * 주소 스키마
 */
export const AddressSchema = z.object({
  /** 세부 주소 */
  detail: z.string().optional(),
  /** 시/도 명 */
  sido_name: z.string().optional(),
  /** 시/군/구 명 */
  sigungu_name: z.string().optional(),
  /** 도로명 */
  road_name: z.string().optional(),
  /** 건물번호 (도로명) */
  building_no: z.string().optional(),
  /** 우편번호 */
  zip_code: z.string().optional(),
});

/**
 * 사용 기한 설정 스키마
 */
export const UsageExpireSchema = z.object({
  /** 업소 사용 제한 기한 (Null일 경우 무제한) */
  time: z.number().nullable().optional(),
  /** 사용 마감 전 팝업 메시지 */
  message: z.string().optional(),
  /** 메시지 표시 시작 일수 */
  show_message_before_days: z.number().default(10),
});

/**
 * 입실 시 체크인 설정 스키마
 */
export const CheckInConfigSchema = z.object({
  /** 대실 시간인 경우 대실 입실 */
  if_hours_stay_sched: z.boolean().optional(),
  /** 숙박 시간인 경우 숙박 입실 */
  if_days_stay_sched: z.boolean().optional(),
});

/**
 * 알림 설정 스키마
 */
export const NotifyConfigSchema = z.object({
  /** 미입실 객실일 경우 알림 */
  if_not_check_in: z.boolean().optional(),
});

/**
 * 전원 차단 설정 스키마
 */
export const PowerDownConfigSchema = z.object({
  /** 공실 후 x분 뒤 전원 차단 (0=즉시, -1 이하=미사용) */
  if_empty_room_after_minutes: z.number().default(-1),
});

/**
 * 객실 키 삽입시 설정 스키마
 */
export const OnGuestKeyInsertedSchema = z.object({
  /** 입실 처리 */
  check_in: CheckInConfigSchema.optional(),
  /** 알림 */
  notify: NotifyConfigSchema.optional(),
  /** 전원 차단 */
  power_down: PowerDownConfigSchema.optional(),
});

/**
 * 퇴실 처리 설정 스키마
 */
export const CheckOutConfigSchema = z.object({
  /** 퇴실 시간 만료시 */
  if_expired_check_out_time: z.boolean().optional(),
  /** 대실일 경우 퇴실 */
  if_stay_type_is_hours: z.boolean().optional(),
  /** 숙박일 경우 퇴실 */
  if_stay_type_is_days: z.boolean().optional(),
  /** 장기 숙박일 경우 퇴실 */
  if_stay_type_is_long_days: z.boolean().optional(),
});

/**
 * 객실키 제거시 설정 스키마
 */
export const OnGuestKeyRemovedSchema = z.object({
  /** 퇴실 처리 */
  check_out: CheckOutConfigSchema.optional(),
});

/** 점검/공실 처리 옵션 */
export const CleanKeyOption = z.enum(['USE', 'USE_IF_CHECK_OUT']).nullable().optional();

/**
 * 청소키 제거시 설정 스키마
 */
export const OnCleanKeyRemovedSchema = z.object({
  /** 점검 대기 */
  inspect_order: CleanKeyOption,
  /** 공실 처리 */
  request_state_clear: z.enum(['USE']).nullable().optional(),
});

/**
 * 퇴실 후 전원 차단 설정 스키마
 */
export const OnCheckOutPowerDownSchema = z.object({
  /** 키 삽입 후 x분 뒤 차단 (0=즉시, -1 이하=미사용) */
  if_guest_key_inserted_after_minutes: z.number().default(0),
});

/**
 * 퇴실시 설정 스키마
 */
export const OnCheckOutSchema = z.object({
  /** 청소요청 */
  clean_order: z.boolean().default(true),
  /** 전원 차단 */
  power_down: OnCheckOutPowerDownSchema.optional(),
});

/**
 * 구독 묶음 상품 설정 스키마
 */
export const UseSubscribePackageSchema = z.object({
  /** 구독 묶음 상품 ID 참조 */
  subscribe_package_id: z.string().optional(),
  /** 구독 만료일 (yyyy-MM-dd) */
  expire_date: z.string().optional(),
  /** 정기 결제 사용 여부 */
  use_periodic_payment: z.boolean().optional(),
  /** 다음 정기 결제 예정일 */
  payment_reserve_date: z.string().nullable().optional(),
  /** 1달 또는 1년 단위의 구독 요금 */
  fee: z.number().optional(),
  /** 구독 등록일 */
  reg_date: z.string().optional(),
});

/** 기본 결제 옵션 */
export const DefaultPaymentType = z.enum([
  'NOT_PAYMENT',
  'CASH_PAYMENT',
  'CARD_PAYMENT',
  'OTA_PAYMENT',
]);

// ============================================================
// 업소 모델 스키마
// ============================================================

/**
 * 업소 모델 스키마
 */
export const AccomModelSchema = BaseModelSchema.extend({
  /** 업소 생성 순서 (readOnly) */
  no: z.number().optional(),

  /** 객실 개수 (readOnly) */
  room_count: z.number().default(0),

  /** 공지 */
  notice: NoticeSchema.optional(),

  /** 도어락 개수 (readOnly) */
  door_lock_count: z.number().default(0),

  /** 키오스크 개수 (readOnly) */
  kiosk_count: z.number().default(0),

  /** 업종 (모텔, 호텔, 펜션 등) */
  business_sector: z.nativeEnum(AccomBusinessSector).default(AccomBusinessSector.MOTEL),

  /** 업소명 */
  name: z.string().default(''),

  /** 사업자 등록번호 */
  business_no: z.string().default(''),

  /** 비상 호출 미사용 */
  unuse_eme_call: z.boolean().default(false),

  /** 차량 호출 미사용 */
  unuse_car_call: z.boolean().default(false),

  /** 현재 보유중인 현금 포인트 */
  point: z.number().default(0),

  /** 예약시 투숙객 문자 알림 서비스 설정 */
  reserve_sms_config: ReserveSmsConfigSchema.optional(),

  /** 사전 예약 SMS 설정 */
  in_advance_reserve_sms_config: InAdvanceReserveSmsConfigSchema.optional(),

  /** 마일리지 적립 설정 */
  mileage_config: MileageConfigSchema.optional(),

  /** 업소에서 사용하는 CCU 정보 */
  ccu_infos: z.array(CcuInfoSchema).default([]),

  /** 예약 설정 */
  reserve_config: ReserveConfigSchema.optional(),

  /** CHB LED에서 사용중과 외출상태 구분 여부 */
  chb_led_flexible_mode: z.boolean().default(false),

  /** 사업장 도로명 주소 */
  address: AddressSchema.optional(),

  /** 업소 전화번호 */
  tel: z.string().default(''),

  /** 사용 기한 설정 */
  usage_expire: UsageExpireSchema.optional(),

  /** Room Sale 데이터베이스 저장 일수 */
  room_sale_save_days: z.number().default(1830),

  /** Room State Log 저장 일수 */
  room_state_log_save_days: z.number().default(90),

  /** 기본 결제 옵션 */
  default_payment_type: DefaultPaymentType.default('NOT_PAYMENT'),

  /** 객실 키 삽입시 설정 */
  on_guest_key_inserted: OnGuestKeyInsertedSchema.optional(),

  /** 객실키 제거시 설정 */
  on_guest_key_removed: OnGuestKeyRemovedSchema.optional(),

  /** 청소키 제거시 설정 */
  on_clean_key_removed: OnCleanKeyRemovedSchema.optional(),

  /** 퇴실시 설정 */
  on_check_out: OnCheckOutSchema.optional(),

  /** 일일 매출 정산 마감 시간 (hh:mm) */
  daily_sale_deadline_time: z.string().default('00:00'),

  /** 퇴실 취소 가능 시간 (분) */
  cancellable_check_out_duration_minutes: z.number().default(60),

  /** 입실 취소 가능 시간 (분) */
  cancellable_check_in_duration_minutes: z.number().default(60),

  /** Roonets PMS 연동 사용 여부 */
  use_roonet_pms: z.boolean().default(false),

  /** 성인인증 OFF상태에서 키오스크로 체크인시 자동으로 ON */
  use_auto_enable_adult_auth: z.boolean().default(false),

  /** 사용중인 구독 묶음 상품 */
  use_subscribe_package: UseSubscribePackageSchema.optional(),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 업소 모델 타입 */
export type AccomModel = z.output<typeof AccomModelSchema>;

/**
 * Accom 컬렉션명
 */
export const ACCOM_COLLECTION_NAME = CollectionName.ACCOM;
