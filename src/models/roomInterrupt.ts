import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

/**
 * 객실 인터럽트(잠금) 모델 스키마
 * 
 * 객실을 다른 클라이언트에서 액세스할 수 없도록 일시적으로 잠글 때 사용합니다.
 * 중복 매출 방지를 위한 독립성/격리성 보장 목적입니다.
 */
export const RoomInterruptModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 객실 ID (readOnly) */
  room_id: z.string().default(''),

  /** 잠근 클라이언트의 App ID (readOnly) */
  app_id: z.string().nullable().optional(),

  /** 잠근 클라이언트의 User ID (readOnly) */
  user_id: z.string().nullable().optional(),

  /** 잠근 클라이언트의 Device ID (readOnly) */
  device_id: z.string().nullable().optional(),

  /** 인터럽트 삭제 예정 시간 (요청시점으로부터 5분 뒤, readOnly) */
  delete_expire_time: z.number().default(0),
});

/** 객실 인터럽트 모델 타입 */
export type RoomInterruptModel = z.output<typeof RoomInterruptModelSchema>;

/**
 * RoomInterrupt 컬렉션명
 */
export const ROOM_INTERRUPT_COLLECTION_NAME = CollectionName.ROOM_INTERRUPT;
