import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { OtaProvider } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 스크래핑 로그 스텝 스키마
 */
export const ScrapingLogStepSchema = z.object({
  /** 스텝 유형 */
  step: z.enum(['AUTH', 'FIND_PLACE', 'GET_RESERVE_LIST']).optional(),
  /** 스텝 메시지 */
  step_message: z.string().optional(),
  /** 성공 여부 */
  success: z.boolean().optional(),
  /** 에러 메시지 */
  error_message: z.string().optional(),
});

/**
 * 스크래핑 히스토리 스키마
 */
export const ScrapingHistorySchema = z.object({
  /** 예약 연동 이력 시간 */
  time: z.number().optional(),
  /** 에러 */
  error: z.string().nullable().optional(),
  /** 로그 */
  log: z.array(ScrapingLogStepSchema).optional(),
});

/**
 * 우선 순위 객실 유형 매핑 스키마
 */
export const PriorityRoomTypeMapSchema = z.object({
  /** 예약 플랫폼에 등록된 유형 명 */
  name: z.string().default(''),
  /** 객실 배정 우선순위 객실 유형 ID 목록 */
  priority_room_type_id: z.array(z.string()).default([]),
});

/**
 * 객실 유형 매핑 스키마
 */
export const RoomTypeMapSchema = z.object({
  /** 객실 유형 ID */
  room_type_id: z.string().default(''),
  /** 예약 플랫폼에 등록된 객실 유형 명 */
  name: z.string().default(''),
});

/**
 * 예약 에이전트 설정 모델 스키마
 * 
 * OTA 연동 설정 정보를 관리합니다.
 */
export const ReserveAgentConfigModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 예약 연동 플랫폼 유형 */
  type: z.nativeEnum(OtaProvider).optional(),

  /** 예약정보 크롤링 여부 */
  use_get_room_reserve: z.boolean().default(true),

  /** 예약 플랫폼에 등록된 업소 명 */
  place_name: z.string().default(''),

  /** 스크래핑 히스토리 */
  scraping_history: ScrapingHistorySchema.optional(),

  /** 특가상품등, 객실 랜덤 배정 상품들의 객실 배정 우선 순위 설정 */
  priority_room_type_map: z.array(PriorityRoomTypeMapSchema).default([]),

  /** 예약 플랫폼에 등록된 객실 유형 명 매핑 */
  room_type_map: z.array(RoomTypeMapSchema).default([]),

  /** 예약 플랫폼 로그인 ID */
  user_id: z.string().default(''),

  /** 예약 플랫폼 로그인 패스워드 */
  password: z.string().default(''),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 예약 에이전트 설정 모델 타입 */
export type ReserveAgentConfigModel = z.output<typeof ReserveAgentConfigModelSchema>;

/**
 * ReserveAgentConfig 컬렉션명
 */
export const RESERVE_AGENT_CONFIG_COLLECTION_NAME = CollectionName.RESERVE_AGENT_CONFIG;
