import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  UserModelSchema,
  USER_COLLECTION_NAME,
  type UserModel,
} from '../models/user.js';
import type { Document } from '../models/base.js';

/**
 * User 생성 파라미터
 */
export interface UserCreateParams {
  /** 사용자 ID (로그인용, 필수) */
  userId: string;
  /** 비밀번호 (필수) */
  password: string;
  /** 어드민용 유저 메모 */
  adminMemo?: string;
  /** 접근 가능한 업소 ID 목록 (최대 100개) */
  accessibleAccomIds?: string[];
  /** 휴대폰 번호 */
  phone?: string;
  /** 이메일 주소 */
  email?: string;
  /** 일간 매출 보고서 수신 여부 */
  receiveEmailDailySalesReport?: boolean;
  /** 키오스크 판매 알림 메일 수신 여부 */
  receiveEmailKioskSalesNotify?: boolean;
  /** 키오스크 판매 알림 카카오톡/문자 수신 여부 */
  useSmsKioskSalesNotify?: boolean;
}

/**
 * User 업데이트 파라미터
 */
export interface UserUpdateParams {
  /** 비밀번호 */
  password?: string;
  /** 어드민용 유저 메모 */
  adminMemo?: string;
  /** 접근 가능한 업소 ID 목록 (최대 100개) */
  accessibleAccomIds?: string[];
  /** 휴대폰 번호 */
  phone?: string;
  /** 이메일 주소 */
  email?: string;
  /** 일간 매출 보고서 수신 여부 */
  receiveEmailDailySalesReport?: boolean;
  /** 키오스크 판매 알림 메일 수신 여부 */
  receiveEmailKioskSalesNotify?: boolean;
  /** 키오스크 판매 알림 카카오톡/문자 수신 여부 */
  useSmsKioskSalesNotify?: boolean;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * User 검색 옵션
 */
export interface UserSearchOptions {
  /** 페이지당 개수 */
  limit?: number;
  /** 다음 페이지 키 */
  startAfter?: string;
  /** 검색어 (이메일, 휴대폰, user_id) */
  search?: string;
}

/**
 * 파라미터를 API 요청 본문으로 변환 (생성용)
 */
function toCreateApiBody(params: UserCreateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    user_id: params.userId,
    password: params.password,
  };

  if (params.adminMemo !== undefined) body['admin_memo'] = params.adminMemo;
  if (params.accessibleAccomIds !== undefined) body['accessible_accom_ids'] = params.accessibleAccomIds;
  if (params.phone !== undefined) body['phone'] = params.phone;
  if (params.email !== undefined) body['email'] = params.email;
  if (params.receiveEmailDailySalesReport !== undefined) body['receive_email_daily_sales_report'] = params.receiveEmailDailySalesReport;
  if (params.receiveEmailKioskSalesNotify !== undefined) body['receive_email_kiosk_sales_notify'] = params.receiveEmailKioskSalesNotify;
  if (params.useSmsKioskSalesNotify !== undefined) body['use_sms_kiosk_sales_notify'] = params.useSmsKioskSalesNotify;

  return body;
}

/**
 * 파라미터를 API 요청 본문으로 변환 (업데이트용)
 */
function toUpdateApiBody(params: UserUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.password !== undefined) body['password'] = params.password;
  if (params.adminMemo !== undefined) body['admin_memo'] = params.adminMemo;
  if (params.accessibleAccomIds !== undefined) body['accessible_accom_ids'] = params.accessibleAccomIds;
  if (params.phone !== undefined) body['phone'] = params.phone;
  if (params.email !== undefined) body['email'] = params.email;
  if (params.receiveEmailDailySalesReport !== undefined) body['receive_email_daily_sales_report'] = params.receiveEmailDailySalesReport;
  if (params.receiveEmailKioskSalesNotify !== undefined) body['receive_email_kiosk_sales_notify'] = params.receiveEmailKioskSalesNotify;
  if (params.useSmsKioskSalesNotify !== undefined) body['use_sms_kiosk_sales_notify'] = params.useSmsKioskSalesNotify;
  if (params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * User Controller
 * 
 * 사용자 관련 CRUD 작업을 제공합니다.
 */
export class UserController extends BaseController {
  /**
   * 단일 사용자 조회
   */
  async get(userId: string): Promise<Document<UserModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/user/${userId}`
    );
    return parseFirstDocument(json, USER_COLLECTION_NAME, UserModelSchema);
  }

  /**
   * 업소의 모든 사용자 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<UserModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/user/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, USER_COLLECTION_NAME, UserModelSchema);
  }

  /**
   * 사용자 검색
   */
  async search(options: UserSearchOptions = {}): Promise<{
    users: Array<Document<UserModel>>;
    startAfter: string | null;
  }> {
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
    const url = queryString ? `/v1/user-search?${queryString}` : '/v1/user-search';

    const json = await this.client.get<Record<string, unknown>>(url);
    const users = parseDocumentList(json, USER_COLLECTION_NAME, UserModelSchema);
    const startAfter = (json['start_after'] as string) ?? null;

    return { users, startAfter };
  }

  /**
   * 사용자 생성
   */
  async create(params: UserCreateParams): Promise<Document<UserModel> | null> {
    const body = toCreateApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      '/v1/user',
      body
    );
    return parseFirstDocument(json, USER_COLLECTION_NAME, UserModelSchema);
  }

  /**
   * 사용자 업데이트
   */
  async update(
    userId: string,
    params: UserUpdateParams
  ): Promise<Document<UserModel> | null> {
    const body = toUpdateApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/user/${userId}`,
      body
    );
    return parseFirstDocument(json, USER_COLLECTION_NAME, UserModelSchema);
  }

  /**
   * 사용자 삭제
   */
  async delete(userId: string): Promise<Document<UserModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/user/${userId}`
    );
    return parseFirstDocument(json, USER_COLLECTION_NAME, UserModelSchema);
  }
}
