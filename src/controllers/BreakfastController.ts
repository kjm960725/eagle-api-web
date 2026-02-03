import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  BreakfastModelSchema,
  BREAKFAST_COLLECTION_NAME,
  type BreakfastModel,
} from '../models/breakfast.js';
import type { Document } from '../models/base.js';

/**
 * Breakfast 생성 파라미터
 */
export interface BreakfastCreateParams {
  /** 표시 이름 (필수) */
  displayName: string;
  /** 설명 */
  description?: string;
  /** 가격 */
  price?: number;
  /** 제공 시작 시간 (분 단위) */
  startTime?: number;
  /** 제공 종료 시간 (분 단위) */
  endTime?: number;
  /** 이미지 URL */
  imageUrl?: string;
}

/**
 * Breakfast 업데이트 파라미터
 */
export interface BreakfastUpdateParams {
  /** 표시 이름 */
  displayName?: string;
  /** 설명 */
  description?: string;
  /** 가격 */
  price?: number;
  /** 제공 시작 시간 (분 단위) */
  startTime?: number;
  /** 제공 종료 시간 (분 단위) */
  endTime?: number;
  /** 이미지 URL */
  imageUrl?: string;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: BreakfastCreateParams | BreakfastUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('displayName' in params && params.displayName !== undefined) body['display_name'] = params.displayName;
  if (params.description !== undefined) body['description'] = params.description;
  if (params.price !== undefined) body['price'] = params.price;
  if (params.startTime !== undefined) body['start_time'] = params.startTime;
  if (params.endTime !== undefined) body['end_time'] = params.endTime;
  if (params.imageUrl !== undefined) body['image_url'] = params.imageUrl;
  if ('isActive' in params && params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * Breakfast Controller
 * 
 * 조식 관련 CRUD 작업을 제공합니다.
 */
export class BreakfastController extends BaseController {
  /**
   * 단일 조식 조회
   */
  async get(accomId: string, breakfastId: string): Promise<Document<BreakfastModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/breakfast/${accomId}/${breakfastId}`
    );
    return parseFirstDocument(json, BREAKFAST_COLLECTION_NAME, BreakfastModelSchema);
  }

  /**
   * 업소의 모든 조식 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<BreakfastModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/breakfast/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, BREAKFAST_COLLECTION_NAME, BreakfastModelSchema);
  }

  /**
   * 조식 생성
   */
  async create(
    accomId: string,
    params: BreakfastCreateParams
  ): Promise<Document<BreakfastModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/breakfast/${accomId}`,
      body
    );
    return parseFirstDocument(json, BREAKFAST_COLLECTION_NAME, BreakfastModelSchema);
  }

  /**
   * 조식 업데이트
   */
  async update(
    accomId: string,
    breakfastId: string,
    params: BreakfastUpdateParams
  ): Promise<Document<BreakfastModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/breakfast/${accomId}/${breakfastId}`,
      body
    );
    return parseFirstDocument(json, BREAKFAST_COLLECTION_NAME, BreakfastModelSchema);
  }

  /**
   * 조식 삭제
   */
  async delete(accomId: string, breakfastId: string): Promise<Document<BreakfastModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/breakfast/${accomId}/${breakfastId}`
    );
    return parseFirstDocument(json, BREAKFAST_COLLECTION_NAME, BreakfastModelSchema);
  }
}
