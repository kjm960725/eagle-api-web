import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import {
  RoomStateSummary,
  RoomKey,
  RoomStayType,
  AirconPowerRule,
  EmeCall,
  CarCall,
} from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 객실 조명 스키마
 */
export const RoomLightSchema = z.object({
  /** 표시명 */
  display_name: z.string().default(''),
  /** 켜짐 여부 */
  on: z.boolean().default(false),
});

/** 객실 조명 타입 */
export type RoomLight = z.output<typeof RoomLightSchema>;

/**
 * 객실 모델 스키마
 */
export const RoomModelSchema = BaseModelSchema.extend({
  /** 객실 번호 */
  no: z.number().default(0),

  /** 업소 ID */
  accom_id: z.string().default(''),

  /** 객실 유형 ID */
  room_type_id: z.string().nullable().optional(),

  /** 현재 판매 ID */
  room_sale_id: z.string().nullable().optional(),

  /** 이전 판매 ID */
  previous_room_sale_id: z.string().nullable().optional(),

  /** 이동 대상 객실 ID */
  moved_to_room_id: z.string().nullable().optional(),

  /** 이동 원본 객실 ID */
  moved_from_room_id: z.string().nullable().optional(),

  /** 이용 유형 */
  stay_type: z.nativeEnum(RoomStayType).nullable().optional(),

  /** 상태 요약 */
  state_summary: z.nativeEnum(RoomStateSummary).default(RoomStateSummary.EMPTY),

  /** 예약 ID */
  room_reserve_id: z.string().nullable().optional(),

  /** 도난 감지 사용 */
  use_thief_detect: z.boolean().default(false),

  /** 키리스 사용 */
  use_keyless: z.boolean().default(false),

  /** 상태 초기화 요청 */
  request_state_clear: z.boolean().default(false),

  /** 점검 대기 */
  inspect_order: z.boolean().default(false),

  /** CCU 그룹 ID */
  gid: z.number().default(0),

  /** CCU 로컬 ID */
  lid: z.number().default(0),

  /** 층 */
  floor: z.number().default(0),

  /** 표시명 */
  display_name: z.string().default(''),

  /** 마지막 점검 대기 시작 시간 */
  last_inspect_order_start_time: z.number().default(0),

  /** 마지막 청소 대기 시작 시간 */
  last_clean_order_start_time: z.number().default(0),

  /** 마지막 점검 대기 종료 시간 */
  last_inspect_order_end_time: z.number().default(0),

  /** 마지막 청소 대기 종료 시간 */
  last_clean_order_end_time: z.number().default(0),

  /** 마지막 입실 시간 */
  last_check_in_time: z.number().default(0),

  /** 마지막 퇴실 시간 */
  last_check_out_time: z.number().default(0),

  /** 마지막 키 변경 시간 */
  last_key_changed_time: z.number().default(0),

  /** 카드 바코드 */
  card_barcode: z.number().default(0),

  /** 메모 */
  memo: z.string().default(''),

  /** 외출 여부 */
  outing: z.boolean().default(false),

  /** 청소 요청 */
  clean_order: z.boolean().default(false),

  /** 방해금지 */
  dnd: z.boolean().default(false),

  /** 메이크업룸 요청 */
  request_make_up_room: z.boolean().default(false),

  /** 연결 상태 */
  connection: z.boolean().default(false),

  /** 키오스크 대실 판매 중지 */
  kiosk_hours_sale_stop: z.boolean().default(false),

  /** 키오스크 숙박 판매 중지 */
  kiosk_days_sale_stop: z.boolean().default(false),

  /** 키오스크 예약 판매 중지 */
  kiosk_reserve_sale_stop: z.boolean().default(false),

  /** 청소 대기 시 온도 */
  on_clean_order_temp: z.number().default(0),

  /** 외출 시 온도 */
  on_outing_temp: z.number().default(0),

  /** 공실 시 온도 */
  on_empty_temp: z.number().default(0),

  /** 사용 시 온도 */
  on_using_temp: z.number().default(0),

  /** 청소 시 온도 */
  on_cleaning_temp: z.number().default(0),

  /** 키 상태 */
  key: z.nativeEnum(RoomKey).default(RoomKey.EMPTY),

  /** 이전 키 상태 */
  previous_key: z.nativeEnum(RoomKey).default(RoomKey.EMPTY),

  /** 현재 온도 */
  temp: z.number().default(0),

  /** 설정 온도 */
  set_temp: z.number().default(0),

  /** 최대 온도 */
  maximum_temp: z.number().default(0),

  /** 최소 온도 */
  minimum_temp: z.number().default(0),

  /** 에어컨 전원 규칙 */
  aircon_power_rule: z.nativeEnum(AirconPowerRule).default(AirconPowerRule.ON_KEY_INSERTED),

  /** 요청 온도 */
  request_temp: z.number().nullable().optional(),

  /** 에어컨 전원 */
  aircon_power: z.boolean().default(false),

  /** 문 상태 (true: 닫힘, false: 열림) */
  door: z.boolean().default(false),

  /** 도난 감지 */
  theft_detect: z.boolean().default(false),

  /** 화재 감지 */
  fire_detect: z.boolean().default(false),

  /** 비상 호출 */
  eme_call: z.nativeEnum(EmeCall).nullable().optional(),

  /** 차량 호출 */
  car_call: z.nativeEnum(CarCall).nullable().optional(),

  /** 조명 목록 */
  lights: z.array(RoomLightSchema).default([]),

  /** 메인 전원 */
  main_power: z.boolean().default(false),

  /** 전원 차단 요청 */
  power_down_request: z.boolean().default(false),
});

/** 객실 모델 타입 (Zod output) */
export type RoomModel = z.output<typeof RoomModelSchema>;

/**
 * Room 컬렉션명
 */
export const ROOM_COLLECTION_NAME = CollectionName.ROOM;

/**
 * 객실 상태 로그 스키마
 */
export const RoomStateLogModelSchema = BaseModelSchema.extend({
  /** 업소 ID */
  accom_id: z.string().default(''),
  /** 객실 ID */
  room_id: z.string().default(''),
  /** 키 */
  key: z.string().default(''),
  /** 값 */
  value: z.unknown(),
  /** 생성 시간 */
  created_at: z.number().default(0),
});

/** 객실 상태 로그 모델 타입 */
export type RoomStateLogModel = z.output<typeof RoomStateLogModelSchema>;
