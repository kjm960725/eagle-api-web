import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  ReserveAgentConfigModelSchema,
  RESERVE_AGENT_CONFIG_COLLECTION_NAME,
  type ReserveAgentConfigModel,
} from '../models/reserveAgentConfig.js';
import type { Document } from '../models/base.js';
import type { OtaProvider } from '../types/enums.js';

/**
 * ReserveAgentConfig 생성 파라미터
 */
export interface ReserveAgentConfigCreateParams {
  /** OTA 에이전트 타입 */
  type?: OtaProvider;
  /** OTA 사이트 업소명 */
  placeName?: string;
  /** 연동 사용자 ID */
  userId?: string;
  /** 연동 비밀번호 */
  password?: string;
  /** 예약 조회 사용 여부 */
  useGetRoomReserve?: boolean;
}

/**
 * ReserveAgentConfig 업데이트 파라미터
 */
export interface ReserveAgentConfigUpdateParams {
  /** OTA 에이전트 타입 */
  type?: OtaProvider;
  /** OTA 사이트 업소명 */
  placeName?: string;
  /** 연동 사용자 ID */
  userId?: string;
  /** 연동 비밀번호 */
  password?: string;
  /** 예약 조회 사용 여부 */
  useGetRoomReserve?: boolean;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: ReserveAgentConfigCreateParams | ReserveAgentConfigUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.type !== undefined) body['type'] = params.type;
  if (params.placeName !== undefined) body['place_name'] = params.placeName;
  if (params.userId !== undefined) body['user_id'] = params.userId;
  if (params.password !== undefined) body['password'] = params.password;
  if (params.useGetRoomReserve !== undefined) body['use_get_room_reserve'] = params.useGetRoomReserve;
  if ('isActive' in params && params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * ReserveAgentConfig Controller
 * 
 * OTA 예약 연동 설정 관련 CRUD 작업을 제공합니다.
 */
export class ReserveAgentConfigController extends BaseController {
  /**
   * 단일 예약 연동 설정 조회
   */
  async get(accomId: string, configId: string): Promise<Document<ReserveAgentConfigModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/reserve-agent-config/${accomId}/${configId}`
    );
    return parseFirstDocument(json, RESERVE_AGENT_CONFIG_COLLECTION_NAME, ReserveAgentConfigModelSchema);
  }

  /**
   * 업소의 모든 예약 연동 설정 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<ReserveAgentConfigModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/reserve-agent-config/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, RESERVE_AGENT_CONFIG_COLLECTION_NAME, ReserveAgentConfigModelSchema);
  }

  /**
   * 예약 연동 설정 생성
   */
  async create(
    accomId: string,
    params: ReserveAgentConfigCreateParams
  ): Promise<Document<ReserveAgentConfigModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/reserve-agent-config/${accomId}`,
      body
    );
    return parseFirstDocument(json, RESERVE_AGENT_CONFIG_COLLECTION_NAME, ReserveAgentConfigModelSchema);
  }

  /**
   * 예약 연동 설정 업데이트
   */
  async update(
    accomId: string,
    configId: string,
    params: ReserveAgentConfigUpdateParams
  ): Promise<Document<ReserveAgentConfigModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/reserve-agent-config/${accomId}/${configId}`,
      body
    );
    return parseFirstDocument(json, RESERVE_AGENT_CONFIG_COLLECTION_NAME, ReserveAgentConfigModelSchema);
  }

  /**
   * 예약 연동 설정 삭제
   */
  async delete(accomId: string, configId: string): Promise<Document<ReserveAgentConfigModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/reserve-agent-config/${accomId}/${configId}`
    );
    return parseFirstDocument(json, RESERVE_AGENT_CONFIG_COLLECTION_NAME, ReserveAgentConfigModelSchema);
  }
}
