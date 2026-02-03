import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

/**
 * 사용자 모델 스키마
 */
export const UserModelSchema = BaseModelSchema.extend({
  /** 업소 ID */
  accom_id: z.string().default(''),

  /** 앱 ID */
  app_id: z.string().default(''),

  /** 사용자 ID (로그인용) */
  user_id: z.string().default(''),

  /** 이름 */
  name: z.string().default(''),

  /** 이메일 */
  email: z.string().default(''),

  /** 전화번호 */
  phone: z.string().default(''),

  /** 역할 */
  role: z.string().default(''),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),

  /** 마지막 로그인 시간 */
  last_login_time: z.number().default(0),
});

/** 사용자 모델 타입 */
export type UserModel = z.output<typeof UserModelSchema>;

/**
 * User 컬렉션명
 */
export const USER_COLLECTION_NAME = CollectionName.USER;
