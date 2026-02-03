import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  AccomModelSchema,
  ACCOM_COLLECTION_NAME,
  type AccomModel,
  type NoticeSchema,
  type ReserveSmsConfigSchema,
  type MileageConfigSchema,
  type AddressSchema,
} from '../models/accom.js';
import type { Document } from '../models/base.js';
import type { AccomBusinessSector } from '../types/enums.js';
import type { z } from 'zod';

/** 주소 타입 */
type Address = z.infer<typeof AddressSchema>;
/** 공지 타입 */
type Notice = z.infer<typeof NoticeSchema>;
/** 예약 SMS 설정 타입 */
type ReserveSmsConfig = z.infer<typeof ReserveSmsConfigSchema>;
/** 마일리지 설정 타입 */
type MileageConfig = z.infer<typeof MileageConfigSchema>;

/**
 * Accom 생성 파라미터
 */
export interface AccomCreateParams {
  /** 업소명 (필수) */
  name: string;
  /** 업종 */
  businessSector?: AccomBusinessSector;
  /** 사업자 등록번호 */
  businessNo?: string;
  /** 업소 전화번호 */
  tel?: string;
  /** 도로명 주소 */
  address?: Address;
}

/**
 * Accom 업데이트 파라미터
 */
export interface AccomUpdateParams {
  /** 업소명 */
  name?: string;
  /** 업종 */
  businessSector?: AccomBusinessSector;
  /** 사업자 등록번호 */
  businessNo?: string;
  /** 업소 전화번호 */
  tel?: string;
  /** 도로명 주소 */
  address?: Address;
  /** 공지 설정 */
  notice?: Notice;
  /** 예약 SMS 설정 */
  reserveSmsConfig?: ReserveSmsConfig;
  /** 마일리지 설정 */
  mileageConfig?: MileageConfig;
  /** 일일 매출 정산 마감 시간 (hh:mm) */
  dailySaleDeadlineTime?: string;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * Accom 검색 옵션
 */
export interface AccomSearchOptions {
  /** 페이지당 개수 */
  limit?: number;
  /** 다음 페이지 키 */
  startAfter?: string;
  /** 검색어 (업소명) */
  search?: string;
}

/**
 * Accom 생성 쿼리 옵션
 */
export interface AccomCreateQueryOptions {
  /** 층별 객실수 설정 (예: { "1": 10, "2": 20 }) */
  roomCountByFloor?: Record<string, number>;
  /** 4호 미사용 여부 */
  unusedRoomNo4?: boolean;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: AccomCreateParams | AccomUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('name' in params && params.name !== undefined) body['name'] = params.name;
  if (params.businessSector !== undefined) body['business_sector'] = params.businessSector;
  if (params.businessNo !== undefined) body['business_no'] = params.businessNo;
  if (params.tel !== undefined) body['tel'] = params.tel;
  if (params.address !== undefined) body['address'] = params.address;
  
  // AccomUpdateParams 전용 필드
  if ('notice' in params && params.notice !== undefined) body['notice'] = params.notice;
  if ('reserveSmsConfig' in params && params.reserveSmsConfig !== undefined) body['reserve_sms_config'] = params.reserveSmsConfig;
  if ('mileageConfig' in params && params.mileageConfig !== undefined) body['mileage_config'] = params.mileageConfig;
  if ('dailySaleDeadlineTime' in params && params.dailySaleDeadlineTime !== undefined) body['daily_sale_deadline_time'] = params.dailySaleDeadlineTime;
  if ('isActive' in params && params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * Accom Controller
 * 
 * 업소 관련 CRUD 작업을 제공합니다.
 */
export class AccomController extends BaseController {
  /**
   * 단일 업소 조회
   */
  async get(accomId: string): Promise<Document<AccomModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/accom/${accomId}`
    );
    return parseFirstDocument(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }

  /**
   * 앱의 모든 업소 조회
   */
  async getAllByApp(): Promise<Array<Document<AccomModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/accom/all-by-app`
    );
    return parseDocumentList(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }

  /**
   * 업소 검색
   */
  async search(options: AccomSearchOptions = {}): Promise<{
    accoms: Array<Document<AccomModel>>;
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
    const url = queryString ? `/v1/accom-search?${queryString}` : '/v1/accom-search';

    const json = await this.client.get<Record<string, unknown>>(url);
    const accoms = parseDocumentList(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
    const startAfter = (json['start_after'] as string) ?? null;

    return { accoms, startAfter };
  }

  /**
   * 업소 생성
   */
  async create(
    params: AccomCreateParams,
    queryOptions?: AccomCreateQueryOptions
  ): Promise<Document<AccomModel> | null> {
    const body = toApiBody(params);
    
    const urlParams = new URLSearchParams();
    if (queryOptions?.roomCountByFloor) {
      urlParams.set('room-count-by-floor', JSON.stringify(queryOptions.roomCountByFloor));
    }
    if (queryOptions?.unusedRoomNo4 !== undefined) {
      urlParams.set('unused-room-no-4', queryOptions.unusedRoomNo4.toString());
    }

    const queryString = urlParams.toString();
    const url = queryString ? `/v1/accom?${queryString}` : '/v1/accom';

    const json = await this.client.post<Record<string, unknown>>(url, body);
    return parseFirstDocument(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }

  /**
   * 업소 업데이트
   */
  async update(
    accomId: string,
    params: AccomUpdateParams
  ): Promise<Document<AccomModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/accom/${accomId}`,
      body
    );
    return parseFirstDocument(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }

  /**
   * 업소 삭제
   */
  async delete(accomId: string): Promise<Document<AccomModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/accom/${accomId}`
    );
    return parseFirstDocument(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }
}
