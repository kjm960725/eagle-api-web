import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { KioskType, KioskSaleState } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

// ============================================================
// TTS 관련 스키마
// ============================================================

/**
 * 언어별 TTS 메시지 스키마 (공통)
 */
export const TtsLanguageMessagesSchema = z.object({
  /** 첫 페이지에서 동작 감지 센서가 감지될때 */
  greetings: z.string().nullable().optional(),
  /** 대실 버튼 클릭시 */
  times_stay: z.string().nullable().optional(),
  /** 숙박 버튼 클릭시 */
  days_stay: z.string().nullable().optional(),
  /** 예약 버튼 클릭시 */
  reserve: z.string().nullable().optional(),
  /** 객실 선택 페이지 진입시 */
  push_room_select_page: z.string().nullable().optional(),
  /** 객실 선택시 */
  selected_room: z.string().nullable().optional(),
  /** 결제 방법 선택 페이지 진입시 */
  payment_select_page: z.string().nullable().optional(),
  /** 현금 결제 시작시 */
  cash_payment_start: z.string().nullable().optional(),
  /** 거스름돈 방출시 */
  cash_dispense_start: z.string().nullable().optional(),
  /** 거스름돈 방출 실패시 */
  cash_dispense_failed: z.string().nullable().optional(),
  /** 현금 결제 완료후 */
  cash_payment_success: z.string().nullable().optional(),
  /** 신용카드 결제 시작시 */
  card_payment_start: z.string().nullable().optional(),
  /** 신용카드 결제 진행시 */
  card_payment_progress: z.string().nullable().optional(),
  /** 결제후 신용카드 제거시 */
  card_payment_remove_card: z.string().nullable().optional(),
  /** 카드 결제 완료후 */
  card_payment_success: z.string().nullable().optional(),
  /** 카드 결제 실패시 */
  card_payment_failed: z.string().nullable().optional(),
  /** 객실 카드 방출시 */
  dispensed_room_card: z.string().nullable().optional(),
  /** 예약 재확인 요청 */
  confirm_again_reserve: z.string().nullable().optional(),
  /** 중복 예약 */
  duplicate_reserve: z.string().nullable().optional(),
  /** 예약 만료 */
  timeout_reserve: z.string().nullable().optional(),
});

/**
 * TTS 설정 스키마
 */
export const TtsConfigSchema = z.object({
  /** 음성 성별 */
  gender: z.enum(['FEMALE', 'MALE']).default('FEMALE'),
  /** 음성 톤 (-20 ~ 20) */
  pitch: z.number().min(-20).max(20).default(0),
  /** 소리 크기 (-96 ~ 16) */
  volume: z.number().min(-96).max(16).default(0),
  /** 속도 (0.25 ~ 4) */
  rate: z.number().min(0.25).max(4).default(1),
  /** 한국어 메시지 */
  kr: TtsLanguageMessagesSchema.optional(),
  /** 영어 메시지 */
  en: TtsLanguageMessagesSchema.optional(),
  /** 일본어 메시지 */
  ja: TtsLanguageMessagesSchema.optional(),
  /** 중국어 메시지 */
  zh: TtsLanguageMessagesSchema.optional(),
});

// ============================================================
// 하드웨어 관련 스키마
// ============================================================

/** 하드웨어 에러 유형 */
export const HardwareErrorType = z.enum([
  'NO_ERROR',
  'COMMUNICATION_ERROR',
  'HARWARE_ERROR',
  'DISPENSE_FAILED',
  'LACK_OF_CASH',
  'NO_PAPER',
  'NO_CLOSE_HEADER',
  'BARCODE_ERROR',
  'THEFT_DETECT',
  'OTHER',
]);

/**
 * 게스트 콜 버튼 스키마
 */
export const GuestCallBtnSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(false),
  /** Distributor의 Relay 위치 */
  relay_index: z.number().optional(),
});

/**
 * 지폐 인식기 스키마
 */
export const CashAcceptorSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(true),
  /** 에러 상태 */
  error: HardwareErrorType.default('NO_ERROR'),
  /** 현금 결제중 */
  cash_accepting: z.boolean().optional(),
  /** 투입한 금액 누계 */
  accepted_cash: z.boolean().optional(),
  /** 마지막 현금 결제 시간 */
  last_payment_time: z.number().optional(),
});

/**
 * 지폐 방출기 슬롯 스키마
 */
export const CashDispensorSlotSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(true),
  /** 에러 상태 */
  error: HardwareErrorType.default('NO_ERROR'),
  /** 거스름돈 단위 (1000, 5000, 10000) */
  cash_unit: z.number().optional(),
});

/**
 * 지폐 방출기 스키마
 */
export const CashDispensorSchema = z.object({
  /** 왼쪽 슬롯 */
  left: CashDispensorSlotSchema.optional(),
  /** 오른쪽 슬롯 */
  right: CashDispensorSlotSchema.optional(),
  /** 현금 방출중 */
  cash_dispensing: z.boolean().optional(),
  /** 마지막 지폐 방출 시간 */
  last_cash_dispense_time: z.number().optional(),
  /** 마지막 방출 실패 금액 */
  last_failed_amount: z.number().optional(),
  /** 마지막 방출 완료 금액 */
  last_success_amount: z.number().optional(),
  /** 원격 지폐 방출 요청 금액 */
  request_dispense: z.number().optional(),
});

/**
 * 영수증 프린터 인쇄 요청 스키마
 */
export const ReceiptPrintRequestSchema = z.object({
  /** 영수증 상단 */
  header: z.string().optional(),
  /** 영수증 본문 */
  content: z.string().optional(),
  /** 영수증 하단 */
  footer: z.string().optional(),
});

/** 영수증 출력 조건 */
export const ReceiptPrintCondition = z.enum(['ALWAYS', 'WHEN_PRINT_BUTTON_CLICKED']);

/**
 * 영수증 프린터 스키마
 */
export const ReceiptPrinterSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(true),
  /** 영수증 하단 사용자 지정 문구 */
  print_custom_text: z.string().optional(),
  /** 영수증 출력 조건 */
  print_condition: ReceiptPrintCondition.optional(),
  /** 에러 상태 */
  error: HardwareErrorType.default('NO_ERROR'),
  /** 원격 영수증 프린트 요청 */
  request_print: ReceiptPrintRequestSchema.nullable().optional(),
  /** 마지막 프린트 시간 */
  last_printed_time: z.number().optional(),
});

/**
 * 분배기 스키마
 */
export const DistributorSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(false),
  /** 에러 상태 */
  error: HardwareErrorType.default('NO_ERROR'),
});

/**
 * 카드 리더기 스키마
 */
export const CreditCardReaderSchema = z.object({
  /** 사용 여부 */
  use: z.boolean().default(true),
  /** 에러 상태 */
  error: HardwareErrorType.default('NO_ERROR'),
  /** 카드 결제중 */
  paymenting: z.boolean().optional(),
  /** 결제 금액 */
  paymented_amount: z.boolean().optional(),
  /** 마지막 카드 결제 시간 */
  last_payment_time: z.number().optional(),
});

/**
 * 카드덱 슬롯 스키마
 */
export const CardDeckSlotSchema = z.object({
  /** 그룹 ID */
  gid: z.number().optional(),
  /** 디바이스 ID */
  did: z.number().optional(),
  /** 투입된 카드의 바코드 (0=카드없음) */
  barcode: z.number().optional(),
  /** 투입된 카드의 객실명 또는 미확인 카드 */
  display_name: z.string().optional(),
  /** 원격 카드 방출 요청 */
  request_dispense: z.boolean().optional(),
  /** 마지막 카드 방출 시간 */
  last_dispensed_time: z.number().optional(),
  /** 에러 상태 */
  error: HardwareErrorType.default('NO_ERROR'),
});

// ============================================================
// 키오스크 모델 스키마
// ============================================================

/**
 * 키오스크 모델 스키마
 */
export const KioskModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 업소 이름 (readOnly) */
  accom_name: z.string().default(''),

  /** 디바이스 ID */
  device_id: z.string().default(''),

  /** 판매 상태 */
  sale_state: z.nativeEnum(KioskSaleState).default(KioskSaleState.SELLABLE),

  /** 키오스크 모델 유형 */
  type: z.nativeEnum(KioskType).default(KioskType.PRO),

  /** 키오스크에서 차량번호 입력 옵션 사용 여부 */
  use_car_no_input_from_kiosk: z.boolean().default(false),

  /** 키오스크 관리자 비밀번호 */
  admin_password: z.string().default('123456'),

  /** 유휴 상태 후 첫 페이지 복귀 시간 (초, 0=미사용) */
  go_home_page_after_sec_when_idle: z.number().default(60),

  /** 결제 완료 후 첫 페이지 복귀 시간 (초) */
  go_home_page_after_sec_when_complate_payment: z.number().default(10),

  /** 관리자 페이지에서 일정 시간 조작 없을시 자동 복귀 */
  use_auto_pop_admin_page: z.boolean().default(true),

  /** 첫 페이지에서 동작 감지시 카드데크 LED 점멸 */
  use_card_deck_led_intro: z.boolean().default(false),

  /** TTS 설정 */
  tts: TtsConfigSchema.optional(),

  /** 객실 카드 도난 감지시 경보 사용 여부 */
  use_card_theft_detection_alarm: z.boolean().default(false),

  /** 성인인증 사용 여부 */
  use_adult_auth: z.boolean().default(false),

  /** 성인인증할 최대 동행자 수 */
  maximum_companion_adult_auth: z.number().default(2),

  /** 키오스크 판매 중단 설정 */
  sale_stop: z.boolean().default(false),

  /** 중요 이벤트 발생시 문자 수신 휴대폰 번호 목록 */
  important_event_sms_receive_phones: z.array(z.string()).default([]),

  /** 게스트 콜 버튼 옵션 */
  guest_call_btn: GuestCallBtnSchema.optional(),

  /** 지폐 인식기 상태/설정 */
  cash_acceptor: CashAcceptorSchema.optional(),

  /** 지폐 방출기 상태/설정 */
  cash_dispensor: CashDispensorSchema.optional(),

  /** 영수증 프린터 상태/설정 */
  receipt_printer: ReceiptPrinterSchema.optional(),

  /** 분배기 상태/설정 */
  distributor: DistributorSchema.optional(),

  /** 문 상태 (true=닫힘, false=열림) */
  door: z.boolean().default(true),

  /** 카드 리더기 상태 */
  credit_card_reader: CreditCardReaderSchema.optional(),

  /** 동작 감지 센서로 감지된 마지막 시간 */
  motion_detected_time: z.number().default(0),

  /** 카드덱 상태 */
  card_deck: z.array(CardDeckSlotSchema).default([]),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 키오스크 모델 타입 */
export type KioskModel = z.output<typeof KioskModelSchema>;

/**
 * Kiosk 컬렉션명
 */
export const KIOSK_COLLECTION_NAME = CollectionName.KIOSK;

// ============================================================
// 키오스크 로그 모델 스키마
// ============================================================

/** 키오스크 로그 유형 */
export const KioskLogType = z.enum(['UI', 'API', 'DEVICE', 'SYSTEM', 'OTHER']);

/**
 * 키오스크 로그 모델 스키마
 */
export const KioskLogModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 키오스크 ID */
  kiosk_id: z.string().default(''),

  /** 로그 유형 */
  type: KioskLogType.default('OTHER'),

  /** 에러 단계 (0=문제없음, 1~3=심각도) */
  warning_level: z.number().min(0).max(3).default(0),

  /** 로그 메시지 */
  message: z.string().default(''),

  /** 등록 시간 (readOnly) */
  registed_time: z.number().default(0),
});

/** 키오스크 로그 모델 타입 */
export type KioskLogModel = z.output<typeof KioskLogModelSchema>;

/**
 * KioskLog 컬렉션명
 */
export const KIOSK_LOG_COLLECTION_NAME = CollectionName.KIOSK_LOG;
