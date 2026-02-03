import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { AppBender, AuthType } from '../types/enums.js';
import { CollectionName } from '../types/constants.js';

/** API 접근 권한 메서드 */
const ApiMethodsSchema = z.array(z.enum(['GET', 'PUT', 'POST', 'DELETE'])).optional();

/**
 * 접근 가능한 API 스키마
 * App이 접근 가능한 API 유형 정의
 */
export const AccessibleApisSchema = z.object({
  app: ApiMethodsSchema,
  'mileage-member': ApiMethodsSchema,
  notify: ApiMethodsSchema,
  mileage: ApiMethodsSchema,
  'app-search': ApiMethodsSchema,
  'custom-config': ApiMethodsSchema,
  'app-version': ApiMethodsSchema,
  user: ApiMethodsSchema,
  'user-search': ApiMethodsSchema,
  'reserve-agent-config': ApiMethodsSchema,
  device: ApiMethodsSchema,
  'device-search': ApiMethodsSchema,
  accom: ApiMethodsSchema,
  'accom-search': ApiMethodsSchema,
  hsoperation: ApiMethodsSchema,
  subscribe: ApiMethodsSchema,
  room: ApiMethodsSchema,
  'room-type': ApiMethodsSchema,
  'room-sale': ApiMethodsSchema,
  kiosk: ApiMethodsSchema,
  'room-interrupt': ApiMethodsSchema,
  'room-reserve': ApiMethodsSchema,
  'room-state-log': ApiMethodsSchema,
  'door-lock': ApiMethodsSchema,
  sms: ApiMethodsSchema,
  mail: ApiMethodsSchema,
  ai: ApiMethodsSchema,
  'push-notification': ApiMethodsSchema,
});

/** 접근 가능한 API 타입 */
export type AccessibleApis = z.output<typeof AccessibleApisSchema>;

/**
 * Rate Limit 스키마
 */
export const RateLimitSchema = z.object({
  /** 시간 윈도우 (초) */
  windowSec: z.number().optional(),
  /** 최대 요청 수 */
  max: z.number().optional(),
});

/** Rate Limit 타입 */
export type RateLimit = z.output<typeof RateLimitSchema>;

/**
 * 앱 모델 스키마
 */
export const AppModelSchema = BaseModelSchema.extend({
  /** 객체 생성 순서 (readOnly) */
  no: z.number().optional(),

  /** App이 접근 가능한 API 유형 정의 */
  accessible_apis: AccessibleApisSchema.optional(),

  /** App 개발사 */
  bender: z.nativeEnum(AppBender).default(AppBender.ICREW),

  /** App 이름 */
  name: z.string().default(''),

  /** App 설명 */
  desc: z.string().default(''),

  /** App 담당자 메일 */
  contact_email: z.string().default(''),

  /** 온라인 인스톨러 설치 URL */
  online_installer_url: z.string().nullable().optional(),

  /** 가능한 인증 유형 */
  valid_auth_type: z.array(z.nativeEnum(AuthType)).default([]),

  /** 애플리케이션에 대한 API 요청 할당량 */
  rate_limit: RateLimitSchema.nullable().optional(),

  /** 앱 시크릿 (앱 인증용) */
  secret: z.string().optional(),

  /** 버전 */
  version: z.string().default(''),

  /** 접근 가능한 업소 ID 목록 */
  accessible_accom_ids: z.array(z.string()).default([]),

  /** 활성화 여부 */
  is_active: z.boolean().default(true),
});

/** 앱 모델 타입 */
export type AppModel = z.output<typeof AppModelSchema>;

/**
 * App 컬렉션명
 */
export const APP_COLLECTION_NAME = CollectionName.APP;
