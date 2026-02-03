import { z } from 'zod';
import { DeviceModelSchema, type DeviceModel } from '../models/device.js';
import { UserModelSchema, type UserModel } from '../models/user.js';
import { AppModelSchema, type AppModel } from '../models/app.js';
import { CollectionName } from '../types/constants.js';

/**
 * 인증 유형
 */
export const ApiAuthType = {
  NOT_AUTHED: 'NOT_AUTHED',
  USER_AUTHED: 'USER_AUTHED',
  APP_AUTHED: 'APP_AUTHED',
  DEVICE_AUTHED: 'DEVICE_AUTHED',
} as const;

export type ApiAuthType = (typeof ApiAuthType)[keyof typeof ApiAuthType];

/**
 * 인증 요청 - 디바이스
 */
export interface DeviceAuthRequest {
  app_id: string;
  mac_address: string;
}

/**
 * 인증 요청 - 앱
 */
export interface AppAuthRequest {
  app_id: string;
  secret: string;
}

/**
 * 인증 요청 - 사용자
 */
export interface UserAuthRequest {
  app_id: string;
  user_id: string;
  password: string;
}

/**
 * 마지막 인증 요청 정보
 */
export type LastAuthRequest =
  | { type: 'device'; request: DeviceAuthRequest }
  | { type: 'app'; request: AppAuthRequest }
  | { type: 'user'; request: UserAuthRequest };

/**
 * Document 형태의 응답 파싱 헬퍼
 */
function parseDocumentMap<S extends z.ZodTypeAny>(
  data: Record<string, unknown> | undefined,
  schema: S
): Array<{ id: string; data: z.output<S> }> {
  if (!data) return [];
  
  return Object.entries(data).map(([id, value]) => ({
    id,
    data: schema.parse(value) as z.output<S>,
  }));
}

/**
 * 인증 응답 스키마
 */
export const AuthTokenResultSchema = z.object({
  token: z.string(),
  api_version: z.string().default('v1'),
  event_listener_url: z.string().default(''),
  [CollectionName.APP]: z.record(z.unknown()).optional(),
  [CollectionName.USER]: z.record(z.unknown()).optional(),
  [CollectionName.DEVICE]: z.record(z.unknown()).optional(),
});

/**
 * 인증 결과 파싱
 */
export function parseAuthResult(json: unknown) {
  const result = AuthTokenResultSchema.parse(json);
  
  return {
    token: result.token,
    apiVersion: result.api_version,
    eventListenerUrl: result.event_listener_url,
    apps: parseDocumentMap(result[CollectionName.APP], AppModelSchema),
    users: parseDocumentMap(result[CollectionName.USER], UserModelSchema),
    devices: parseDocumentMap(result[CollectionName.DEVICE], DeviceModelSchema),
  };
}

export type AuthResult = ReturnType<typeof parseAuthResult>;

/**
 * 인증 상태
 */
export interface AuthState {
  /** API 키 (Bearer 토큰) */
  apiKey: string;
  /** API 버전 */
  apiVersion: string;
  /** 이벤트 리스너 URL */
  eventListenerUrl: string;
  /** 인증된 앱 */
  authedApp: { id: string; data: AppModel } | null;
  /** 인증된 사용자 */
  authedUser: { id: string; data: UserModel } | null;
  /** 인증된 디바이스 */
  authedDevice: { id: string; data: DeviceModel } | null;
  /** 마지막 인증 시간 */
  lastAuthTime: Date | null;
  /** 마지막 인증 요청 */
  lastAuthRequest: LastAuthRequest | null;
}

/**
 * 초기 인증 상태
 */
export function createInitialAuthState(): AuthState {
  return {
    apiKey: '',
    apiVersion: '',
    eventListenerUrl: '',
    authedApp: null,
    authedUser: null,
    authedDevice: null,
    lastAuthTime: null,
    lastAuthRequest: null,
  };
}

/**
 * 인증 유형 판별
 */
export function getAuthType(state: AuthState): ApiAuthType {
  if (!state.lastAuthRequest) return ApiAuthType.NOT_AUTHED;
  
  switch (state.lastAuthRequest.type) {
    case 'device': return ApiAuthType.DEVICE_AUTHED;
    case 'app': return ApiAuthType.APP_AUTHED;
    case 'user': return ApiAuthType.USER_AUTHED;
    default: return ApiAuthType.NOT_AUTHED;
  }
}
