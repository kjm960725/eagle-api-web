import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  DoorLockModelSchema,
  DoorLockOtpResponseSchema,
  DOOR_LOCK_COLLECTION_NAME,
  type DoorLockModel,
  type DoorLockOtpResponse,
} from '../models/doorLock.js';
import type { Document } from '../models/base.js';
import type { DoorLockVender, DoorLockQrVersion, DoorLockOtpVersion, DoorLockRfVersion } from '../types/enums.js';

/**
 * DoorLock 생성 파라미터
 */
export interface DoorLockCreateParams {
  /** 객실 ID */
  roomId?: string;
  /** 도어락 제조사 */
  vender?: DoorLockVender;
  /** 마스터 비밀번호 */
  masterPassword?: string;
  /** 도어락 이벤트 부저음 볼륨 크기 */
  volume?: number;
  /** OTP 프로토콜 버전 */
  otpProtocolVersion?: DoorLockOtpVersion;
  /** QR 프로토콜 버전 */
  qrProtocolVersion?: DoorLockQrVersion;
  /** RF 프로토콜 버전 */
  rfProtocolVersion?: DoorLockRfVersion;
}

/**
 * DoorLock 업데이트 파라미터
 */
export interface DoorLockUpdateParams {
  /** 객실 ID */
  roomId?: string;
  /** 도어락 제조사 */
  vender?: DoorLockVender;
  /** 마스터 비밀번호 */
  masterPassword?: string;
  /** 도어락 이벤트 부저음 볼륨 크기 */
  volume?: number;
  /** OTP 프로토콜 버전 */
  otpProtocolVersion?: DoorLockOtpVersion;
  /** QR 프로토콜 버전 */
  qrProtocolVersion?: DoorLockQrVersion;
  /** RF 프로토콜 버전 */
  rfProtocolVersion?: DoorLockRfVersion;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: DoorLockCreateParams | DoorLockUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.roomId !== undefined) body['room_id'] = params.roomId;
  if (params.vender !== undefined) body['vender'] = params.vender;
  if (params.masterPassword !== undefined) body['master_password'] = params.masterPassword;
  if (params.volume !== undefined) body['volume'] = params.volume;
  if (params.otpProtocolVersion !== undefined) body['otp_protocol_version'] = params.otpProtocolVersion;
  if (params.qrProtocolVersion !== undefined) body['qr_protocol_version'] = params.qrProtocolVersion;
  if (params.rfProtocolVersion !== undefined) body['rf_protocol_version'] = params.rfProtocolVersion;
  if ('isActive' in params && params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * DoorLock Controller
 * 
 * 도어락 관련 CRUD 작업을 제공합니다.
 */
export class DoorLockController extends BaseController {
  /**
   * 단일 도어락 조회
   */
  async get(accomId: string, doorLockId: string): Promise<Document<DoorLockModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/door-lock/${accomId}/${doorLockId}`
    );
    return parseFirstDocument(json, DOOR_LOCK_COLLECTION_NAME, DoorLockModelSchema);
  }

  /**
   * 업소의 모든 도어락 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<DoorLockModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/door-lock/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, DOOR_LOCK_COLLECTION_NAME, DoorLockModelSchema);
  }

  /**
   * 도어락 생성
   */
  async create(
    accomId: string,
    params: DoorLockCreateParams
  ): Promise<Document<DoorLockModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/door-lock/${accomId}`,
      body
    );
    return parseFirstDocument(json, DOOR_LOCK_COLLECTION_NAME, DoorLockModelSchema);
  }

  /**
   * 도어락 업데이트
   */
  async update(
    accomId: string,
    doorLockId: string,
    params: DoorLockUpdateParams
  ): Promise<Document<DoorLockModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/door-lock/${accomId}/${doorLockId}`,
      body
    );
    return parseFirstDocument(json, DOOR_LOCK_COLLECTION_NAME, DoorLockModelSchema);
  }

  /**
   * 도어락 삭제
   */
  async delete(accomId: string, doorLockId: string): Promise<Document<DoorLockModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/door-lock/${accomId}/${doorLockId}`
    );
    return parseFirstDocument(json, DOOR_LOCK_COLLECTION_NAME, DoorLockModelSchema);
  }

  /**
   * 도어락 OTP 조회 (RoomSale ID 기준)
   * 
   * 해당 room_sale_id와 연결된 객실이 입실 상태여야 합니다.
   */
  async getOtp(accomId: string, roomSaleId: string): Promise<DoorLockOtpResponse> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/door-lock/otp/${accomId}/${roomSaleId}`
    );
    return DoorLockOtpResponseSchema.parse(json);
  }

  /**
   * 도어락 OTP 조회 (객실 ID 기준)
   */
  async getOtpByRoomId(accomId: string, roomId: string): Promise<DoorLockOtpResponse> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/door-lock/otp/by-room-id/${accomId}/${roomId}`
    );
    return DoorLockOtpResponseSchema.parse(json);
  }

  /**
   * 도어락 OTP 조회 (도어락 ID 기준)
   */
  async getOtpByDoorLockId(accomId: string, doorLockId: string): Promise<DoorLockOtpResponse> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/door-lock/otp/by-doorlock-id/${accomId}/${doorLockId}`
    );
    return DoorLockOtpResponseSchema.parse(json);
  }
}
