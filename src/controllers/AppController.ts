import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  AppModelSchema,
  APP_COLLECTION_NAME,
  type AppModel,
  type RateLimit,
  type AccessibleApis,
} from '../models/app.js';
import type { Document } from '../models/base.js';
import { AppBender, AuthType } from '../types/enums.js';

/**
 * App 생성 파라미터
 */
export interface AppCreateParams {
  /** 앱 이름 */
  name: string;
  /** 앱 설명 */
  desc?: string;
  /** App 개발사 */
  bender?: AppBender;
  /** App 담당자 메일 */
  contactEmail?: string;
  /** 온라인 인스톨러 설치 URL */
  onlineInstallerUrl?: string;
  /** 가능한 인증 유형 */
  validAuthType?: AuthType[];
  /** API 요청 할당량 */
  rateLimit?: RateLimit;
  /** 접근 가능한 API 유형 정의 */
  accessibleApis?: AccessibleApis;
  /** 접근 가능한 업소 ID 목록 */
  accessibleAccomIds?: string[];
}

/**
 * App 업데이트 파라미터
 */
export interface AppUpdateParams {
  /** 앱 이름 */
  name?: string;
  /** 앱 설명 */
  desc?: string;
  /** App 개발사 */
  bender?: AppBender;
  /** App 담당자 메일 */
  contactEmail?: string;
  /** 온라인 인스톨러 설치 URL */
  onlineInstallerUrl?: string;
  /** 가능한 인증 유형 */
  validAuthType?: AuthType[];
  /** API 요청 할당량 */
  rateLimit?: RateLimit;
  /** 접근 가능한 API 유형 정의 */
  accessibleApis?: AccessibleApis;
  /** 접근 가능한 업소 ID 목록 */
  accessibleAccomIds?: string[];
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * App 검색 옵션
 */
export interface AppSearchOptions {
  /** 페이지당 개수 */
  limit?: number;
  /** 다음 페이지 키 */
  startAfter?: string;
  /** 검색어 (앱 이름) */
  search?: string;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: AppCreateParams | AppUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('name' in params && params.name !== undefined) body['name'] = params.name;
  if ('desc' in params && params.desc !== undefined) body['desc'] = params.desc;
  if ('bender' in params && params.bender !== undefined) body['bender'] = params.bender;
  if ('contactEmail' in params && params.contactEmail !== undefined) body['contact_email'] = params.contactEmail;
  if ('onlineInstallerUrl' in params && params.onlineInstallerUrl !== undefined) body['online_installer_url'] = params.onlineInstallerUrl;
  if ('validAuthType' in params && params.validAuthType !== undefined) body['valid_auth_type'] = params.validAuthType;
  if ('rateLimit' in params && params.rateLimit !== undefined) body['rate_limit'] = params.rateLimit;
  if ('accessibleApis' in params && params.accessibleApis !== undefined) body['accessible_apis'] = params.accessibleApis;
  if ('accessibleAccomIds' in params && params.accessibleAccomIds !== undefined) body['accessible_accom_ids'] = params.accessibleAccomIds;
  if ('isActive' in params && (params as AppUpdateParams).isActive !== undefined) {
    body['is_active'] = (params as AppUpdateParams).isActive;
  }

  return body;
}

/**
 * App Controller
 * 
 * 애플리케이션 관련 CRUD 작업을 제공합니다.
 */
export class AppController extends BaseController {
  /**
   * 단일 앱 조회
   */
  async get(appId: string): Promise<Document<AppModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/app/${appId}`
    );
    return parseFirstDocument(json, APP_COLLECTION_NAME, AppModelSchema);
  }

  /**
   * 앱 검색
   */
  async search(options: AppSearchOptions = {}): Promise<Array<Document<AppModel>>> {
    const params = new URLSearchParams();

    if (options.limit !== undefined) {
      params.set('limit', options.limit.toString());
    }
    if (options.startAfter !== undefined) {
      params.set('start-after', options.startAfter);
    }
    if (options.search !== undefined) {
      params.set('search', options.search);
    }

    const queryString = params.toString();
    const url = queryString ? `/v1/app-search?${queryString}` : '/v1/app-search';

    const json = await this.client.get<Record<string, unknown>>(url);
    return parseDocumentList(json, APP_COLLECTION_NAME, AppModelSchema);
  }

  /**
   * 앱 생성
   */
  async create(params: AppCreateParams): Promise<Document<AppModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      '/v1/app',
      body
    );
    return parseFirstDocument(json, APP_COLLECTION_NAME, AppModelSchema);
  }

  /**
   * 앱 업데이트
   */
  async update(
    appId: string,
    params: AppUpdateParams
  ): Promise<Document<AppModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/app/${appId}`,
      body
    );
    return parseFirstDocument(json, APP_COLLECTION_NAME, AppModelSchema);
  }

  /**
   * 앱 삭제
   */
  async delete(appId: string): Promise<Document<AppModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/app/${appId}`
    );
    return parseFirstDocument(json, APP_COLLECTION_NAME, AppModelSchema);
  }
}
