import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

/**
 * 앱 모델 스키마
 */
export const AppModelSchema = BaseModelSchema.extend({
  /** 앱 이름 */
  name: z.string().default(''),

  /** 앱 설명 */
  description: z.string().default(''),

  /** 버전 */
  version: z.string().default(''),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 앱 모델 타입 */
export type AppModel = z.output<typeof AppModelSchema>;

/**
 * App 컬렉션명
 */
export const APP_COLLECTION_NAME = CollectionName.APP;
