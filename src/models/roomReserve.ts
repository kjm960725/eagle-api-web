import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { RoomStayType, RoomReserveVisitType, RoomReserveState, OtaProvider } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 예약 모델 스키마
 */
export const RoomReserveModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 객실 ID (수동 지정 시 다른 방법으로 판매 불가) */
  room_id: z.string().nullable().optional(),

  /** 예약된 객실 유형 ID */
  room_type_id: z.string().nullable().optional(),

  /** OTA 웹사이트에 등록된 객실 명 */
  ota_room_name: z.string().default(''),

  /** 문자 발송 여부 (readOnly) */
  sended_sms: z.boolean().default(false),

  /** 체크인 예정 시간 */
  check_in_sched: z.number().default(0),

  /** 체크아웃 예정 시간 */
  check_out_sched: z.number().default(0),

  /** 예약자명 */
  name: z.string().default(''),

  /** 예약자 휴대폰 번호 */
  phone: z.string().default(''),

  /** 예약 주체 (OTA 에이전트) */
  agent: z.nativeEnum(OtaProvider).default(OtaProvider.FRONT),

  /** 무인(키오스크)으로 예약 입실 여부 */
  used_unmanned: z.boolean().default(false),

  /** 무인(OTA 예약 연동)으로 예약 생성 여부 */
  generated_unmanned: z.boolean().default(false),

  /** 예약 상태 (GENERATED=정상예약, EXPIRED=만료, CANCELED=취소, USING=사용중, USED=사용완료) */
  state: z.nativeEnum(RoomReserveState).default(RoomReserveState.GENERATED),

  /** 예약 번호 */
  reserve_no: z.string().default(''),

  /** API 내부에서 자동 생성된 예약 번호 (readOnly) */
  internal_reserve_no: z.string().optional(),

  /** 방문 유형 (도보/차량) */
  visit_type: z.nativeEnum(RoomReserveVisitType).default(RoomReserveVisitType.ON_FOOT),

  /** 숙박 유형 */
  stay_type: z.nativeEnum(RoomStayType).default(RoomStayType.DAYS),

  /** 선불 금액 */
  prepaid: z.number().default(0),

  /** 예약 요금 */
  fee: z.number().default(0),

  /** 고객 메모 */
  memo: z.string().default(''),
});

/** 예약 모델 타입 */
export type RoomReserveModel = z.output<typeof RoomReserveModelSchema>;

/**
 * RoomReserve 컬렉션명
 */
export const ROOM_RESERVE_COLLECTION_NAME = CollectionName.ROOM_RESERVE;

/**
 * 예약 검색 결과 에러 타입
 */
export const ReserveQueryError = {
  /** 중복 예약 */
  OVERLAP: 'OVERLAP',
  /** 만료됨 */
  EXPIRE: 'EXPIRE',
  /** 너무 이른 입실 */
  EARLY: 'EARLY',
  /** 찾을 수 없음 */
  NOT_FOUND: 'NOT_FOUND',
} as const;
export type ReserveQueryError = (typeof ReserveQueryError)[keyof typeof ReserveQueryError];
