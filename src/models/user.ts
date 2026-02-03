import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

/** 관리자 권한 레벨 */
export const AdminAccessLevel = z.enum(['R', 'RU', 'CRU', 'CRUD']).nullable().optional();

/**
 * 관리자 기능 접근 권한 스키마
 */
export const AccessibilityAdminSchema = z.object({
  /** 어드민 앱에서의 notify 접근권한 */
  notify_mgt: AdminAccessLevel,
  /** 어드민 앱에서의 app 접근권한 */
  app_mgt: AdminAccessLevel,
  /** Eagle 클라이언트의 모든 업소 관련 기능의 모든 권한 및 어드민 앱에서의 accom 접근권한 */
  accom_mgt: AdminAccessLevel,
  /** 어드민 앱에서의 device 접근권한 */
  device_mgt: AdminAccessLevel,
  /** 어드민 앱에서의 user 접근권한 */
  user_mgt: AdminAccessLevel,
});

/** 관리자 기능 접근 권한 타입 */
export type AccessibilityAdmin = z.output<typeof AccessibilityAdminSchema>;

/**
 * 사용자 모델 스키마
 */
export const UserModelSchema = BaseModelSchema.extend({
  /** 객체 생성 순서 (readOnly) */
  no: z.number().optional(),

  /** 관리자 기능 접근 권한 (서버 관리자만 수정 가능, readOnly) */
  accessibility_admin: AccessibilityAdminSchema.nullable().optional(),

  /** 어드민용 유저 메모 */
  admin_memo: z.string().default(''),

  /** 프론트 매니저에서 유저가 접근 가능한 업소들 (최대 100개) */
  accessible_accom_ids: z.array(z.string()).default([]),

  /** 사용자 계정 아이디 */
  user_id: z.string().default(''),

  /** 암호화된 사용자 비밀번호 */
  password: z.string().optional(),

  /** 사용자 휴대폰 번호 (- 제외) */
  phone: z.string().default(''),

  /** 휴대폰 인증 여부 */
  phone_cert: z.boolean().default(false),

  /** 사용자 이메일 주소 */
  email: z.string().default(''),

  /** 이메일 인증 여부 */
  email_cert: z.boolean().default(false),

  /** 일간 매출 보고서 수신 여부 (이메일 인증시에만 유효) */
  receive_email_daily_sales_report: z.boolean().default(false),

  /** 키오스크 판매 알림 메일 수신 여부 (이메일 인증시에만 유효) */
  receive_email_kiosk_sales_notify: z.boolean().default(false),

  /** 키오스크 판매 알림 카카오톡 or 문자 수신 여부 (휴대폰 인증시에만 유효) */
  use_sms_kiosk_sales_notify: z.boolean().default(false),

  /** 마지막으로 인증받은 클라이언트의 app id (readOnly) */
  last_auth_app_id: z.string().optional(),

  /** 마지막으로 인증받은 토큰 (중복접속 확인용, readOnly) */
  last_auth_token: z.string().optional(),

  /** 마지막으로 소켓이 연결된 시간 (readOnly) */
  last_socket_connected_time: z.number().default(0),

  /** 사용자가 이벤트 소켓에 연결되어있는지 여부 (readOnly) */
  socket_connection: z.boolean().default(false),

  /** 소켓 세션 ID (백엔드 참조용, readOnly) */
  socket_session_uuid: z.string().nullable().optional(),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 사용자 모델 타입 */
export type UserModel = z.output<typeof UserModelSchema>;

/**
 * User 컬렉션명
 */
export const USER_COLLECTION_NAME = CollectionName.USER;
