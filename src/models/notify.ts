import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { NotifyActionType } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 알림 액션 스키마
 */
export const NotifyActionSchema = z.object({
  /** 액션 유형 (HREF: 링크 이동, GO_TO_OTA_SETTINGS: OTA 설정으로 이동) */
  type: z.nativeEnum(NotifyActionType).nullable().optional(),
  /** 액션 값 (URL 등) */
  value: z.string().nullable().optional(),
});

/** 알림 액션 타입 */
export type NotifyAction = z.output<typeof NotifyActionSchema>;

/**
 * 알림 모델 스키마
 */
export const NotifyModelSchema = BaseModelSchema.extend({
  /** 사용 여부 */
  use: z.boolean().default(true),

  /** 알림 제목 */
  title: z.string().default(''),

  /** 알림 유형 */
  type: z.string().default('INTERNAL_NOTICE'),

  /** 알림 내용 */
  message: z.string().default(''),

  /** 한 번만 표시 여부 */
  single_shot: z.boolean().default(false),

  /** 이 알림을 읽은 유저 ID 목록 */
  readed_user_ids: z.array(z.string()).default([]),

  /** 이 알림을 읽은 장치 ID 목록 */
  readed_device_ids: z.array(z.string()).default([]),

  /** 업소 ID 목록 (비어있을시 전체 알림) */
  accom_ids: z.array(z.string()).default([]),

  /** 전체 업소 공지 여부 (accom_ids가 0개일 경우 true, readOnly) */
  use_all_accom: z.boolean().default(false),

  /** 알림 액션 */
  action: NotifyActionSchema.optional(),
});

/** 알림 모델 타입 */
export type NotifyModel = z.output<typeof NotifyModelSchema>;

/**
 * Notify 컬렉션명
 */
export const NOTIFY_COLLECTION_NAME = CollectionName.NOTIFY;
