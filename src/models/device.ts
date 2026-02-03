import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { DeviceType } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/**
 * 디바이스 모델 스키마
 */
export const DeviceModelSchema = BaseModelSchema.extend({
  /** 장치 고유 식별 주소 (구분자: ':', 대문자 고정) */
  mac_address: z.string().default(''),

  /** 업소 ID */
  accom_id: z.string().nullable().optional(),

  /** 업소명 (readOnly) */
  accom_name: z.string().default(''),

  /** 앱 ID */
  app_id: z.string().nullable().optional(),

  /** 객체 생성 순서 (readOnly) */
  no: z.number().optional(),

  /** 디바이스 유형 */
  type: z.nativeEnum(DeviceType).optional(),

  /** 장치 현재 버전 */
  version: z.string().default(''),

  /** 모니터에 표시되는 이름 */
  display_name: z.string().default(''),

  /** 마지막으로 인증받은 클라이언트의 app id (readOnly) */
  last_auth_app_id: z.string().optional(),

  /** 마지막으로 인증받은 토큰 (중복접속 확인용, readOnly) */
  last_auth_token: z.string().optional(),

  /** 마지막으로 소켓이 연결된 시간 (readOnly) */
  last_socket_connected_time: z.number().default(0),

  /** 장치가 이벤트 소켓에 연결되어있는지 여부 (readOnly) */
  socket_connection: z.boolean().default(false),

  /** 소켓 세션 ID (백엔드 참조용, readOnly) */
  socket_session_uuid: z.string().nullable().optional(),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 디바이스 모델 타입 */
export type DeviceModel = z.output<typeof DeviceModelSchema>;

/**
 * Device 컬렉션명
 */
export const DEVICE_COLLECTION_NAME = CollectionName.DEVICE;
