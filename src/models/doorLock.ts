import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import {
  DoorLockVender,
  DoorLockQrVersion,
  DoorLockOtpVersion,
  DoorLockRfVersion,
} from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 도어락 모델 스키마
 */
export const DoorLockModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 도어락 OTP 생성 키 (readOnly) */
  secret: z.string().optional(),

  /** 하드웨어 ID (readOnly) */
  hardware_id: z.number().optional(),

  /** 생성된 QR OTP 링크 (readOnly) */
  qr_otp_url: z.string().nullable().optional(),

  /** 객실 ID */
  room_id: z.string().nullable().optional(),

  /** 도어락 제조사 */
  vender: z.nativeEnum(DoorLockVender).default(DoorLockVender.ICREW),

  /** 마스터 비밀번호 */
  master_password: z.string().default(''),

  /** 도어락 이벤트 부저음 볼륨 크기 */
  volume: z.number().default(0),

  /** OTP 프로토콜 버전 */
  otp_protocol_version: z.nativeEnum(DoorLockOtpVersion).default(DoorLockOtpVersion.UNUSE),

  /** QR 프로토콜 버전 */
  qr_protocol_version: z.nativeEnum(DoorLockQrVersion).default(DoorLockQrVersion.UNUSE),

  /** RF 프로토콜 버전 */
  rf_protocol_version: z.nativeEnum(DoorLockRfVersion).default(DoorLockRfVersion.UNUSE),

  /** 도어락 일련번호 */
  serial_number: z.string().default(''),

  /** 도어락 MAC 주소 */
  mac_address: z.string().default(''),

  /** 배터리 잔량 (%) */
  battery: z.number().default(0),

  /** 마지막 연결 시간 */
  last_connected_time: z.number().default(0),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 도어락 모델 타입 */
export type DoorLockModel = z.output<typeof DoorLockModelSchema>;

/**
 * DoorLock 컬렉션명
 */
export const DOOR_LOCK_COLLECTION_NAME = CollectionName.DOOR_LOCK;

/**
 * 도어락 OTP 응답 스키마
 */
export const DoorLockOtpResponseSchema = z.object({
  success: z.boolean().default(true),
  error_message: z.string().optional(),
  room_display_name: z.string().optional(),
  accom_display_name: z.string().optional(),
  door_lock_vender: z.nativeEnum(DoorLockVender).optional(),
  door_lock_qr_version: z.nativeEnum(DoorLockQrVersion).optional(),
  door_lock_otp_version: z.nativeEnum(DoorLockOtpVersion).optional(),
  check_in_time: z.number().optional(),
  check_out_sched_time: z.number().optional(),
  otp: z.string().optional(),
  otp_expire_time: z.number().optional(),
  qr_otp_v1: z.string().optional(),
  qr_otp_v1_expire_time: z.number().optional(),
  qr_otp_v2: z.string().optional(),
  qr_otp_v2_expire_time: z.number().optional(),
});

/** 도어락 OTP 응답 타입 */
export type DoorLockOtpResponse = z.output<typeof DoorLockOtpResponseSchema>;
