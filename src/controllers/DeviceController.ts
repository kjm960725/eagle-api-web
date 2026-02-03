import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  DeviceModelSchema,
  DEVICE_COLLECTION_NAME,
  type DeviceModel,
} from '../models/device.js';
import type { Document } from '../models/base.js';
import type { DeviceType } from '../types/enums.js';

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
 * 파라미터를 API 요청 본문으로 변환
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
  async delete(deviceId: string): Promise<void> {
    await this.client.delete(`/v1/device/${deviceId}`);
  }
}
