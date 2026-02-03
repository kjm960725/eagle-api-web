import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { DeviceType } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 디바이스 모델 스키마
 */
export const DeviceModelSchema = BaseModelSchema.extend({
  /** 업소 ID */
  accom_id: z.string().default(''),

  /** 업소명 (조회용) */
  accom_name: z.string().default(''),

  /** 앱 ID */
  app_id: z.string().default(''),

  /** 표시명 */
  display_name: z.string().default(''),

  /** MAC 주소 */
  mac_address: z.string().default(''),

  /** 디바이스 유형 */
  type: z.nativeEnum(DeviceType).optional(),

  /** 버전 */
  version: z.string().default(''),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),

  /** 마지막 접속 시간 */
  last_connected_time: z.number().default(0),
});

/** 디바이스 모델 타입 */
export type DeviceModel = z.output<typeof DeviceModelSchema>;

/**
 * Device 컬렉션명
 */
export const DEVICE_COLLECTION_NAME = CollectionName.DEVICE;
