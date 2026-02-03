import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  DeviceModelSchema,
  DEVICE_COLLECTION_NAME,
  type DeviceModel,
} from '../models/device.js';
import type { Document } from '../models/base.js';
import type { DeviceType } from '../types/enums.js';

/**
 * Device 생성 파라미터
 */
export interface DeviceCreateParams {
  /** 업소 ID (필수) */
  accomId: string;
  /** MAC 주소 (필수) */
  macAddress: string;
  /** 표시명 */
  displayName?: string;
  /** 디바이스 유형 */
  type?: DeviceType;
  /** 버전 */
  version?: string;
}

/**
 * Device 업데이트 파라미터
 */
export interface DeviceUpdateParams {
  displayName?: string;
  type?: DeviceType;
  version?: string;
  isActive?: boolean;
}

/**
 * Device 검색 옵션
 */
export interface DeviceSearchOptions {
  /** 페이지당 개수 */
  limit?: number;
  /** 다음 페이지 키 */
  startAfter?: string;
  /** 검색어 (display_name, mac_address) */
  search?: string;
}

/**
 * 파라미터를 API 요청 본문으로 변환 (업데이트용)
 */
function toApiBody(params: DeviceUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.displayName !== undefined) body['display_name'] = params.displayName;
  if (params.type !== undefined) body['type'] = params.type;
  if (params.version !== undefined) body['version'] = params.version;
  if (params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * 생성 파라미터를 API 요청 본문으로 변환
 */
function toCreateApiBody(params: DeviceCreateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    accom_id: params.accomId,
    mac_address: params.macAddress,
  };

  if (params.displayName !== undefined) body['display_name'] = params.displayName;
  if (params.type !== undefined) body['type'] = params.type;
  if (params.version !== undefined) body['version'] = params.version;

  return body;
}

/**
 * Device Controller
 * 
 * 디바이스 관련 CRUD 작업을 제공합니다.
 */
export class DeviceController extends BaseController {
  /**
   * 단일 디바이스 조회
   */
  async get(deviceId: string): Promise<Document<DeviceModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/device/${deviceId}`
    );
    return parseFirstDocument(json, DEVICE_COLLECTION_NAME, DeviceModelSchema);
  }

  /**
   * 업소의 모든 디바이스 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<DeviceModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/device/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, DEVICE_COLLECTION_NAME, DeviceModelSchema);
  }

  /**
   * 디바이스 검색
   */
  async search(options: DeviceSearchOptions = {}): Promise<Array<Document<DeviceModel>>> {
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
    const url = queryString ? `/v1/device-search?${queryString}` : '/v1/device-search';

    const json = await this.client.get<Record<string, unknown>>(url);
    return parseDocumentList(json, DEVICE_COLLECTION_NAME, DeviceModelSchema);
  }

  /**
   * 디바이스 생성
   * 
   * mac_address가 중복되는 device가 있는 경우 400 에러 반환
   */
  async create(params: DeviceCreateParams): Promise<Document<DeviceModel> | null> {
    const body = toCreateApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      '/v1/device',
      body
    );
    return parseFirstDocument(json, DEVICE_COLLECTION_NAME, DeviceModelSchema);
  }

  /**
   * 디바이스 업데이트
   */
  async update(
    deviceId: string,
    params: DeviceUpdateParams
  ): Promise<Document<DeviceModel> | null> {
    const body = toApiBody(params);
    
    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/device/${deviceId}`,
      body
    );
    return parseFirstDocument(json, DEVICE_COLLECTION_NAME, DeviceModelSchema);
  }

  /**
   * 디바이스 삭제
   */
  async delete(deviceId: string): Promise<Document<DeviceModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/device/${deviceId}`
    );
    return parseFirstDocument(json, DEVICE_COLLECTION_NAME, DeviceModelSchema);
  }
}
