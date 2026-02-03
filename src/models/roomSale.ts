import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { RoomStayType, ChannelType, OtaProvider } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 조식 항목 스키마
 */
export const BreakfastItemSchema = z.object({
  /** 조식 ID */
  breakfast_id: z.string().default(''),
  /** 가격 */
  price: z.number().default(0),
});

/**
 * SMS 로그 스키마
 */
export const SmsLogSchema = z.object({
  /** SMS 유형 */
  type: z.enum(['QR_OTP_V1']).optional(),
  /** 플랫폼 */
  platform: z.enum(['SOLAPI']).optional(),
  /** SMS ID (SOLAPI의 경우 groupId) */
  sms_id: z.string().optional(),
  /** 등록 시간 */
  registered_time: z.number().optional(),
});

/**
 * SMS 발송 상세 로그 스키마
 */
export const SmsDetailLogSchema = z.object({
  /** 메시지 */
  msg: z.string().optional(),
  /** 수신자 */
  to: z.string().optional(),
  /** 완료 여부 */
  finished: z.boolean().optional(),
  /** 성공 여부 */
  success: z.boolean().optional(),
});

/**
 * OTP 로그 스키마
 */
export const OtpLogSchema = z.object({
  /** SMS ID */
  sms_id: z.string().optional(),
  /** 등록 시간 */
  registered_time: z.number().optional(),
  /** 수정 시간 */
  updated_time: z.number().optional(),
  /** OTP URL */
  url: z.string().optional(),
  /** SMS 발송 이력 */
  sms_logs: z.array(SmsDetailLogSchema).optional(),
});

/**
 * 알람 스키마
 */
export const AlarmSchema = z.object({
  /** 시 (0-23) */
  hours: z.number().min(0).max(23).optional(),
  /** 분 (0-59) */
  minutes: z.number().min(0).max(59).optional(),
  /** TTS 재생 여부 */
  play_tts: z.boolean().optional(),
});

/**
 * 키오스크 CCTV 스키마
 */
export const KioskCctvSchema = z.object({
  /** URL */
  url: z.string().default(''),
  /** CCTV 이미지 유형 */
  type: z
    .enum([
      'AUTH_BEFORE',
      'AUTH_AFTER',
      'AGREE_TERMS_BEFORE',
      'AGREE_TERMS_AFTER',
      'PAYMENT_COMPLATED',
    ])
    .optional(),
});

/** 신분증 유형 */
export const IdCardType = z.enum(['DRIVER_LICENSE', 'PASSPORT', 'RESIDENT_REGISTRATION']);

/**
 * 신분증 인증 스키마
 */
export const IdCardAuthSchema = z.object({
  /** 신분증 유형 */
  type: IdCardType.optional(),
  /** 생년월일 (yymmdd 형식) */
  birthday: z.string().optional(),
  /** 신분증 이미지 URL (readOnly) */
  url: z.string().optional(),
});

/** 결제 유형 */
export const PaymentType = z.enum(['CARD', 'CASH', 'AGENT', 'MILEAGE', 'ACCOUNT', 'NOT_PAID']);

/**
 * 결제 항목 스키마
 */
export const PaymentItemSchema = z.object({
  /** 결제 시간 */
  payment_date: z.number().optional(),
  /** 결제 주체 */
  channel_type: z.nativeEnum(ChannelType).optional(),
  /** 마일리지 사용 휴대폰 번호 */
  mileage_member_phone: z.string().nullable().optional(),
  /** 사용한 마일리지 포인트 */
  use_mileage_point: z.number().optional(),
  /** 채널 ID */
  channel_id: z.string().nullable().optional(),
  /** 결제 유형 */
  type: PaymentType.optional(),
  /** 계좌 이체 금액 */
  send_account: z.number().optional(),
  /** 계좌 번호 */
  account_no: z.string().optional(),
  /** 받은(투입) 현금 */
  accepted_cash: z.number().optional(),
  /** 반환된 현금 */
  changed_cash: z.number().optional(),
  /** 반환 실패 거스름돈 */
  not_changed_cash: z.number().optional(),
  /** 신용카드 결제 금액 */
  amount_paid_creadit_card: z.number().optional(),
  /** 신용카드 번호 */
  credit_card_no: z.string().optional(),
  /** 신용카드 승인사 */
  credit_card_accepter_name: z.string().optional(),
  /** 신용카드 결제 승인번호 */
  credit_card_approval_no: z.string().optional(),
  /** 타 대행사에서 결제된 금액 */
  amount_paid_agent: z.number().optional(),
  /** OTA 대행사 유형 */
  agent_type: z.nativeEnum(OtaProvider).nullable().optional(),
  /** 비고 */
  note: z.string().optional(),
});

/**
 * RoomSale 모델 스키마
 */
export const RoomSaleModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 객실 ID */
  room_id: z.string().default(''),

  /** 객실 유형 ID (readOnly) */
  room_type_id: z.string().nullable().optional(),

  /** 전원 차단 무시 */
  ignore_power_down: z.boolean().default(false),

  /** 현재 입실중인 매출 여부 */
  activate: z.boolean().default(false),

  /** 예약 입실의 경우 Room Reserve ID 참조 */
  room_reserve_id: z.string().nullable().optional(),

  /** 조식 메뉴 */
  breakfasts: z.array(BreakfastItemSchema).default([]),

  /** 입실 시간 */
  check_in_time: z.number().default(0),

  /** 퇴실 예정시간 */
  check_out_sched_time: z.number().default(0),

  /** 퇴실 완료 시간 */
  check_out_time: z.number().default(0),

  /** 입실 유형 */
  stay_type: z.nativeEnum(RoomStayType).default(RoomStayType.DAYS),

  /** 매출 메모 */
  note: z.string().default(''),

  /** 차량 번호 */
  car_no: z.string().default(''),

  /** 고객 휴대폰 번호 (최대 10개) */
  phones: z.array(z.string()).default([]),

  /** SMS 발송 이력 (readOnly) */
  sms_logs: z.array(SmsLogSchema).default([]),

  /** OTP 문자 발송 이력 (readOnly) */
  otp_log: OtpLogSchema.optional(),

  /** 인원 수 */
  person_count: z.number().default(0),

  /** 알람 설정 */
  alarm: AlarmSchema.nullable().optional(),

  /** 요금 */
  fee: z.number().default(0),

  /** 입실 주체 */
  channel_type: z.nativeEnum(ChannelType).optional(),

  /** 채널 ID (USER=user참조, DEVICE/FRONT=device참조, API=null, KIOSK=kiosk참조) */
  channel_id: z.string().nullable().optional(),

  /** 키오스크 CCTV (readOnly) */
  kiosk_cctv: z.array(KioskCctvSchema).default([]),

  /** 신분증 인증 내역 */
  id_card_auth: z.array(IdCardAuthSchema).default([]),

  /** 결제 내역 */
  payments: z.array(PaymentItemSchema).default([]),
});

/** RoomSale 모델 타입 */
export type RoomSaleModel = z.output<typeof RoomSaleModelSchema>;

/**
 * RoomSale 컬렉션명
 */
export const ROOM_SALE_COLLECTION_NAME = CollectionName.ROOM_SALE;

/**
 * RoomPayment 모델 스키마
 */
export const RoomPaymentModelSchema = BaseModelSchema.extend({
  /** 업소 ID */
  accom_id: z.string().default(''),

  /** 객실 ID */
  room_id: z.string().default(''),

  /** 객실 유형 ID */
  room_type_id: z.string().nullable().optional(),

  /** RoomSale ID */
  room_sale_id: z.string().default(''),

  /** 이용 유형 */
  stay_type: z.nativeEnum(RoomStayType).optional(),

  /** 결제 채널 유형 */
  payment_channel_type: z.nativeEnum(ChannelType).optional(),

  /** 결제 채널 ID */
  payment_channel_id: z.string().default(''),

  /** OTA 에이전트 */
  agent_type: z.nativeEnum(OtaProvider).optional(),

  /** 결제 시간 */
  payment_time: z.number().default(0),

  /** 결제 금액 */
  amount: z.number().default(0),

  /** OTA 선결제 금액 */
  amount_paid_agent: z.number().default(0),

  /** 현금 결제 금액 */
  accepted_cash: z.number().default(0),

  /** 거스름돈 미반환 현금 */
  not_changed_cash: z.number().default(0),

  /** 카드 결제 금액 */
  accepted_credit_card: z.number().default(0),

  /** 메모 */
  note: z.string().default(''),

  /** 차량 번호 */
  car_no: z.string().default(''),

  /** 전화번호 */
  phone: z.string().default(''),
});

/** RoomPayment 모델 타입 */
export type RoomPaymentModel = z.output<typeof RoomPaymentModelSchema>;

/**
 * RoomPayment 컬렉션명
 */
export const ROOM_PAYMENT_COLLECTION_NAME = CollectionName.ROOM_PAYMENT;
