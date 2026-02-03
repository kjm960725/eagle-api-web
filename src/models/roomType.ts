import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

// ============================================================
// 요금제 관련 스키마
// ============================================================

/** 요일 enum */
export const DayOfWeek = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

/** 공휴일 정책 */
export const HolidayPolicyType = z.enum(['UNUSE', 'HOLIDAY_ONLY', 'EXCEPT_HOLIDAY']);

/**
 * 공휴일 정책 스키마
 */
export const HolidayPolicySchema = z.object({
  /** 정책 유형 */
  policy: HolidayPolicyType.default('UNUSE'),
  /** 날짜 오프셋 (예: -1 = 공휴일 전날) */
  date_offset: z.number().optional(),
});

/** 시간 정책 유형 */
export const TimeOfUsePolicyType = z.enum(['ELAPSED', 'CHECK_OUT']);

/**
 * 시간 정책 스키마
 */
export const TimeOfUsePolicySchema = z.object({
  /** 정책 유형 (ELAPSED=경과 시간 기준, CHECK_OUT=퇴실 시간 기준) */
  policy: TimeOfUsePolicyType.optional(),
  /** 시간 (hh:mm 형식) */
  time: z.string().optional(),
});

/**
 * 판매 가능 시간대 스키마
 */
export const SellableTimeRangeSchema = z.object({
  /** 시작 시간 (hh:mm) */
  start_at: z.string().optional(),
  /** 종료 시간 (hh:mm) */
  end_before: z.string().optional(),
});

/**
 * 대실 요금제 스키마
 */
export const TimesPricingSchema = z.object({
  /** 요금 옵션명 */
  name: z.string().default('표준'),
  /** 기본 요금제 여부 */
  is_default: z.boolean().default(false),
  /** 프론트 매니저에서의 요금정책 사용 여부 */
  use_front_manager: z.boolean().default(true),
  /** 키오스크에서의 요금정책 사용 여부 */
  use_kiosk: z.boolean().default(true),
  /** 공휴일 정책 */
  holiday_policy: HolidayPolicySchema.optional(),
  /** 이 요금 옵션을 사용할 요일 */
  day_of_week: z.array(DayOfWeek).default([]),
  /** 시간 정책 */
  time_of_use_policy: TimeOfUsePolicySchema.optional(),
  /** 시간 추가 단위 (분) */
  increment_unit_per_time: z.number().optional(),
  /** 시간 추가 요금 */
  increment_price_per_time: z.number().optional(),
  /** 인원당 추가 요금 */
  increment_price_per_person: z.number().optional(),
  /** 기본 가격 */
  basic_price: z.number().optional(),
  /** 판매 가능 시간대 */
  sellable_time_range: z.array(SellableTimeRangeSchema).default([]),
});

/**
 * 숙박 요금제 스키마
 */
export const DaysPricingSchema = z.object({
  /** 요금 옵션명 */
  name: z.string().default('표준'),
  /** 기본 요금제 여부 */
  is_default: z.boolean().default(false),
  /** 프론트 매니저에서의 요금정책 사용 여부 */
  use_front_manager: z.boolean().default(true),
  /** 키오스크에서의 요금정책 사용 여부 */
  use_kiosk: z.boolean().default(true),
  /** 공휴일 정책 */
  holiday_policy: HolidayPolicySchema.optional(),
  /** 이 요금 옵션을 사용할 요일 */
  day_of_week: z.array(DayOfWeek).default([]),
  /** 시간 정책 */
  time_of_use_policy: TimeOfUsePolicySchema.optional(),
  /** 기본 가격 */
  basic_price: z.number().optional(),
  /** 장기 요금제 미적용 여부 */
  unuse_long_days: z.boolean().optional(),
  /** 인원당 추가 요금 */
  increment_price_per_person: z.number().optional(),
  /** 판매 가능 시간대 */
  sellable_time_range: z.array(SellableTimeRangeSchema).default([]),
});

/**
 * 요일별 장기 숙박 요금 스키마
 */
export const LongDaysPricePerDaySchema = z.object({
  /** 인원당 추가 요금 */
  price_per_person: z.number().optional(),
  /** 1박당 추가 요금 */
  price_per_days: z.number().optional(),
});

/**
 * 장기 숙박 요금제 스키마
 */
export const LongDaysPricingSchema = z.object({
  /** 프론트 매니저에서의 장기 요금정책 사용 여부 */
  use_front_manager: z.boolean().default(false),
  /** 키오스크에서의 장기 요금정책 사용 여부 */
  use_kiosk: z.boolean().default(false),
  /** 최대 연박 일수 */
  maximum_additional_days: z.number().default(7),
  /** 월요일~화요일 */
  monday_to_tuesday: LongDaysPricePerDaySchema.optional(),
  /** 화요일~수요일 */
  tuesday_to_wednesday: LongDaysPricePerDaySchema.optional(),
  /** 수요일~목요일 */
  wednesday_to_thursday: LongDaysPricePerDaySchema.optional(),
  /** 목요일~금요일 */
  thursday_to_friday: LongDaysPricePerDaySchema.optional(),
  /** 금요일~토요일 */
  friday_to_saturday: LongDaysPricePerDaySchema.optional(),
  /** 토요일~일요일 */
  saturday_to_sunday: LongDaysPricePerDaySchema.optional(),
  /** 일요일~월요일 */
  sunday_to_monday: LongDaysPricePerDaySchema.optional(),
  /** 평일 & 공휴일 전날 */
  weekday_and_holiday: LongDaysPricePerDaySchema.optional(),
  /** 주말 & 공휴일 전날 */
  weekend_and_holiday: LongDaysPricePerDaySchema.optional(),
});

// ============================================================
// 객실 유형 모델 스키마
// ============================================================

/**
 * 객실 유형 모델 스키마
 */
export const RoomTypeModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 객실 타입명 */
  display_name: z.string().default(''),

  /** 기본 수용 인원 */
  basic_capacity: z.number().default(2),

  /** 기본 숙박 요금 */
  default_days_fee: z.number().default(0),

  /** 기본 대실 요금 */
  default_hours_fee: z.number().default(0),

  /** 최대 수용 인원 */
  maximum_capacity: z.number().default(2),

  /** 일일 평일 대실 마감 시작 시간 (hh:mm) */
  daily_weekday_hours_stay_deadline_start_time: z.string().nullable().default('09:00'),

  /** 일일 평일 대실 마감 시간 (hh:mm) */
  daily_weekday_hours_stay_deadline_time: z.string().nullable().default('21:00'),

  /** 일일 주말 대실 마감 시작 시간 (hh:mm) */
  daily_weekend_hours_stay_deadline_start_time: z.string().nullable().default('09:00'),

  /** 일일 주말 대실 마감 시간 (hh:mm) */
  daily_weekend_hours_stay_deadline_time: z.string().nullable().default('21:00'),

  /** 주중 숙박 퇴실 시간 */
  days_stay_weekday_check_out_time: z.number().default(12),

  /** 주말 숙박 퇴실 시간 */
  days_stay_weekend_check_out_time: z.number().default(12),

  /** 대실 주중 오후 추가 요금 */
  hours_stay_weekday_afternoon_hours_add_fee: z.number().default(0),

  /** 대실 주중 오후 인당 추가 요금 */
  hours_stay_weekday_afternoon_person_add_fee: z.number().default(0),

  /** 대실 주중 오후 이용 시간 */
  hours_stay_weekday_afternoon_use_hours: z.number().default(3),

  /** 대실 주중 오전 추가 요금 */
  hours_stay_weekday_morning_hours_add_fee: z.number().default(0),

  /** 대실 주중 오전 인당 추가 요금 */
  hours_stay_weekday_morning_person_add_fee: z.number().default(0),

  /** 대실 주중 오전 이용 시간 */
  hours_stay_weekday_morning_use_hours: z.number().default(3),

  /** 대실 주말 오후 추가 요금 */
  hours_stay_weekend_afternoon_hours_add_fee: z.number().default(0),

  /** 대실 주말 오후 인당 추가 요금 */
  hours_stay_weekend_afternoon_person_add_fee: z.number().default(0),

  /** 대실 주말 오전 인당 추가 요금 */
  hours_stay_weekend_morning_person_add_fee: z.number().default(0),

  /** 대실 주말 오후 이용 시간 */
  hours_stay_weekend_afternoon_use_hours: z.number().default(3),

  /** 대실 주말 오전 추가 요금 */
  hours_stay_weekend_morning_hours_add_fee: z.number().default(0),

  /** 대실 주말 오전 이용 시간 */
  hours_stay_weekend_morning_use_hours: z.number().default(3),

  /** 대실 요금제 */
  times_pricing: z.array(TimesPricingSchema).default([]),

  /** 숙박 요금제 */
  days_pricing: z.array(DaysPricingSchema).default([]),

  /** 장기 숙박 요금제 */
  long_days_pricing: LongDaysPricingSchema.optional(),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 객실 유형 모델 타입 */
export type RoomTypeModel = z.output<typeof RoomTypeModelSchema>;

/**
 * RoomType 컬렉션명
 */
export const ROOM_TYPE_COLLECTION_NAME = CollectionName.ROOM_TYPE;
