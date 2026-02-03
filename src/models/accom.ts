import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { AccomBusinessSector, CcuVender } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 업소 모델 스키마
 */
export const AccomModelSchema = BaseModelSchema.extend({
  /** 앱 ID */
  app_id: z.string().default(''),

  /** 업소명 */
  name: z.string().default(''),

  /** 표시명 */
  display_name: z.string().default(''),

  /** 업종 */
  business_sector: z.nativeEnum(AccomBusinessSector).default(AccomBusinessSector.MOTEL),

  /** 주소 */
  address: z.string().default(''),

  /** 전화번호 */
  phone: z.string().default(''),

  /** CCU 제조사 */
  ccu_vender: z.nativeEnum(CcuVender).optional(),

  /** 타임존 */
  timezone: z.string().default('Asia/Seoul'),

  /** 일일 마감 시간 (시) */
  daily_closing_hour: z.number().default(6),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 업소 모델 타입 */
export type AccomModel = z.output<typeof AccomModelSchema>;

/**
 * Accom 컬렉션명
 */
export const ACCOM_COLLECTION_NAME = CollectionName.ACCOM;
