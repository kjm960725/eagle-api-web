import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

/**
 * 조식 모델 스키마
 */
export const BreakfastModelSchema = BaseModelSchema.extend({
  /** 업소 ID */
  accom_id: z.string().default(''),

  /** 조식 메뉴 명 */
  display_name: z.string().default(''),

  /** 설명 */
  description: z.string().default(''),

  /** 가격 */
  price: z.number().default(0),

  /** 조식 이미지 URL */
  image_url: z.string().nullable().optional(),

  /** 제공 시작 시간 (분 단위, 예: 7시 = 420) */
  start_time: z.number().default(0),

  /** 제공 종료 시간 (분 단위) */
  end_time: z.number().default(0),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 조식 모델 타입 */
export type BreakfastModel = z.output<typeof BreakfastModelSchema>;

/**
 * Breakfast 컬렉션명
 */
export const BREAKFAST_COLLECTION_NAME = CollectionName.BREAKFAST;
