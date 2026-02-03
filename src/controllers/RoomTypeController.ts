import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  RoomTypeModelSchema,
  ROOM_TYPE_COLLECTION_NAME,
  type RoomTypeModel,
} from '../models/roomType.js';
import type { Document } from '../models/base.js';

/**
 * RoomType 생성 파라미터
 */
export interface RoomTypeCreateParams {
  /** 표시명 (필수) */
  displayName: string;
  /** 정렬 순서 */
  order?: number;
  /** 기본 요금 */
  basePrice?: number;
  /** 대실 요금 */
  hoursPrice?: number;
  /** 숙박 요금 */
  daysPrice?: number;
  /** 주말 대실 요금 */
  weekendHoursPrice?: number;
  /** 주말 숙박 요금 */
  weekendDaysPrice?: number;
  /** 대실 이용 시간 (분) */
  hoursDuration?: number;
  /** 숙박 체크아웃 시간 (시) */
  daysCheckoutHour?: number;
  /** 숙박 체크아웃 시간 (분) */
  daysCheckoutMinute?: number;
  /** 설명 */
  description?: string;
  /** 이미지 URL */
  imageUrl?: string;
}

/**
 * RoomType 업데이트 파라미터
 */
export interface RoomTypeUpdateParams {
  /** 표시명 */
  displayName?: string;
  /** 정렬 순서 */
  order?: number;
  /** 기본 요금 */
  basePrice?: number;
  /** 대실 요금 */
  hoursPrice?: number;
  /** 숙박 요금 */
  daysPrice?: number;
  /** 주말 대실 요금 */
  weekendHoursPrice?: number;
  /** 주말 숙박 요금 */
  weekendDaysPrice?: number;
  /** 대실 이용 시간 (분) */
  hoursDuration?: number;
  /** 숙박 체크아웃 시간 (시) */
  daysCheckoutHour?: number;
  /** 숙박 체크아웃 시간 (분) */
  daysCheckoutMinute?: number;
  /** 설명 */
  description?: string;
  /** 이미지 URL */
  imageUrl?: string;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: RoomTypeCreateParams | RoomTypeUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.displayName !== undefined) body['display_name'] = params.displayName;
  if (params.order !== undefined) body['order'] = params.order;
  if (params.basePrice !== undefined) body['base_price'] = params.basePrice;
  if (params.hoursPrice !== undefined) body['hours_price'] = params.hoursPrice;
  if (params.daysPrice !== undefined) body['days_price'] = params.daysPrice;
  if (params.weekendHoursPrice !== undefined) body['weekend_hours_price'] = params.weekendHoursPrice;
  if (params.weekendDaysPrice !== undefined) body['weekend_days_price'] = params.weekendDaysPrice;
  if (params.hoursDuration !== undefined) body['hours_duration'] = params.hoursDuration;
  if (params.daysCheckoutHour !== undefined) body['days_checkout_hour'] = params.daysCheckoutHour;
  if (params.daysCheckoutMinute !== undefined) body['days_checkout_minute'] = params.daysCheckoutMinute;
  if (params.description !== undefined) body['description'] = params.description;
  if (params.imageUrl !== undefined) body['image_url'] = params.imageUrl;
  if ('isActive' in params && params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * RoomType Controller
 * 
 * 객실 유형 관련 CRUD 작업을 제공합니다.
 */
export class RoomTypeController extends BaseController {
  /**
   * 단일 객실 유형 조회
   */
  async get(accomId: string, roomTypeId: string): Promise<Document<RoomTypeModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-type/${accomId}/${roomTypeId}`
    );
    return parseFirstDocument(json, ROOM_TYPE_COLLECTION_NAME, RoomTypeModelSchema);
  }

  /**
   * 업소의 모든 객실 유형 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<RoomTypeModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-type/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, ROOM_TYPE_COLLECTION_NAME, RoomTypeModelSchema);
  }

  /**
   * 객실 유형 생성
   */
  async create(
    accomId: string,
    params: RoomTypeCreateParams
  ): Promise<Document<RoomTypeModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/room-type/${accomId}`,
      body
    );
    return parseFirstDocument(json, ROOM_TYPE_COLLECTION_NAME, RoomTypeModelSchema);
  }

  /**
   * 객실 유형 업데이트
   */
  async update(
    accomId: string,
    roomTypeId: string,
    params: RoomTypeUpdateParams
  ): Promise<Document<RoomTypeModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/room-type/${accomId}/${roomTypeId}`,
      body
    );
    return parseFirstDocument(json, ROOM_TYPE_COLLECTION_NAME, RoomTypeModelSchema);
  }

  /**
   * 객실 유형 삭제
   */
  async delete(accomId: string, roomTypeId: string): Promise<Document<RoomTypeModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/room-type/${accomId}/${roomTypeId}`
    );
    return parseFirstDocument(json, ROOM_TYPE_COLLECTION_NAME, RoomTypeModelSchema);
  }
}
