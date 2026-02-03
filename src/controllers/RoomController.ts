import { BaseController, parseDocumentList, parseFirstDocument, parseDocumentById } from './base.js';
import {
  RoomModelSchema,
  RoomStateLogModelSchema,
  ROOM_COLLECTION_NAME,
  type RoomModel,
  type RoomLight,
  type RoomStateLogModel,
} from '../models/room.js';
import { CollectionName } from '../types/constants.js';
import type { Document } from '../models/base.js';
import type { RoomKey, AirconPowerRule, EmeCall, CarCall } from '../types/enums.js';
import { z } from 'zod';

/**
 * Room 업데이트 파라미터
 */
export interface RoomUpdateParams {
  roomTypeId?: string;
  useThiefDetect?: boolean;
  useKeyless?: boolean;
  requestStateClear?: boolean;
  inspectOrder?: boolean;
  gid?: number;
  lid?: number;
  floor?: number;
  displayName?: string;
  cardBarcode?: number;
  memo?: string;
  outing?: boolean;
  cleanOrder?: boolean;
  dnd?: boolean;
  connection?: boolean;
  kioskHoursSaleStop?: boolean;
  kioskDaysSaleStop?: boolean;
  kioskReserveSaleStop?: boolean;
  onCleanOrderTemp?: number;
  onOutingTemp?: number;
  onEmptyTemp?: number;
  onUsingTemp?: number;
  onCleaningTemp?: number;
  key?: RoomKey;
  temp?: number;
  setTemp?: number;
  maximumTemp?: number;
  minimumTemp?: number;
  airconPowerRule?: AirconPowerRule;
  requestTemp?: number | null;
  airconPower?: boolean;
  door?: boolean;
  requestMakeUpRoom?: boolean;
  theftDetect?: boolean;
  fireDetect?: boolean;
  emeCall?: EmeCall | null;
  carCall?: CarCall | null;
  lights?: RoomLight[];
  mainPower?: boolean;
  powerDownRequest?: boolean;
}

/**
 * Room 생성 파라미터
 */
export interface RoomCreateParams extends RoomUpdateParams {
  displayName: string;  // 필수
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: RoomUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.roomTypeId !== undefined) body['room_type_id'] = params.roomTypeId;
  if (params.useThiefDetect !== undefined) body['use_thief_detect'] = params.useThiefDetect;
  if (params.useKeyless !== undefined) body['use_keyless'] = params.useKeyless;
  if (params.requestStateClear !== undefined) body['request_state_clear'] = params.requestStateClear;
  if (params.inspectOrder !== undefined) body['inspect_order'] = params.inspectOrder;
  if (params.gid !== undefined) body['gid'] = params.gid;
  if (params.lid !== undefined) body['lid'] = params.lid;
  if (params.floor !== undefined) body['floor'] = params.floor;
  if (params.displayName !== undefined) body['display_name'] = params.displayName;
  if (params.cardBarcode !== undefined) body['card_barcode'] = params.cardBarcode;
  if (params.memo !== undefined) body['memo'] = params.memo;
  if (params.outing !== undefined) body['outing'] = params.outing;
  if (params.cleanOrder !== undefined) body['clean_order'] = params.cleanOrder;
  if (params.dnd !== undefined) body['dnd'] = params.dnd;
  if (params.connection !== undefined) body['connection'] = params.connection;
  if (params.kioskHoursSaleStop !== undefined) body['kiosk_hours_sale_stop'] = params.kioskHoursSaleStop;
  if (params.kioskDaysSaleStop !== undefined) body['kiosk_days_sale_stop'] = params.kioskDaysSaleStop;
  if (params.kioskReserveSaleStop !== undefined) body['kiosk_reserve_sale_stop'] = params.kioskReserveSaleStop;
  if (params.onCleanOrderTemp !== undefined) body['on_clean_order_temp'] = params.onCleanOrderTemp;
  if (params.onOutingTemp !== undefined) body['on_outing_temp'] = params.onOutingTemp;
  if (params.onEmptyTemp !== undefined) body['on_empty_temp'] = params.onEmptyTemp;
  if (params.onUsingTemp !== undefined) body['on_using_temp'] = params.onUsingTemp;
  if (params.onCleaningTemp !== undefined) body['on_cleaning_temp'] = params.onCleaningTemp;
  if (params.key !== undefined) body['key'] = params.key;
  if (params.temp !== undefined) body['temp'] = params.temp;
  if (params.setTemp !== undefined) body['set_temp'] = params.setTemp;
  if (params.maximumTemp !== undefined) body['maximum_temp'] = params.maximumTemp;
  if (params.minimumTemp !== undefined) body['minimum_temp'] = params.minimumTemp;
  if (params.airconPowerRule !== undefined) body['aircon_power_rule'] = params.airconPowerRule;
  if (params.requestTemp !== undefined) body['request_temp'] = params.requestTemp;
  if (params.airconPower !== undefined) body['aircon_power'] = params.airconPower;
  if (params.door !== undefined) body['door'] = params.door;
  if (params.requestMakeUpRoom !== undefined) body['request_make_up_room'] = params.requestMakeUpRoom;
  if (params.theftDetect !== undefined) body['theft_detect'] = params.theftDetect;
  if (params.fireDetect !== undefined) body['fire_detect'] = params.fireDetect;
  if (params.emeCall !== undefined) body['eme_call'] = params.emeCall;
  if (params.carCall !== undefined) body['car_call'] = params.carCall;
  if (params.lights !== undefined) body['lights'] = params.lights;
  if (params.mainPower !== undefined) body['main_power'] = params.mainPower;
  if (params.powerDownRequest !== undefined) body['power_down_request'] = params.powerDownRequest;

  return body;
}

/**
 * 상태 로그 검색 결과 스키마
 */
const RoomStateLogSearchResultSchema = z.object({
  [CollectionName.ROOM_STATE_LOG]: z.record(z.unknown()).optional(),
  next_start_at: z.number().nullable().optional(),
});

/**
 * 상태 로그 검색 결과
 */
export interface RoomStateLogSearchResult {
  logs: Array<Document<RoomStateLogModel>>;
  nextStartAt: number | null;
}

/**
 * Room Controller
 * 
 * 객실 관련 CRUD 작업을 제공합니다.
 */
export class RoomController extends BaseController {
  /**
   * 단일 객실 조회
   */
  async get(accomId: string, roomId: string): Promise<Document<RoomModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room/${accomId}/${roomId}`
    );
    return parseFirstDocument(json, ROOM_COLLECTION_NAME, RoomModelSchema);
  }

  /**
   * 업소의 모든 객실 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<RoomModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, ROOM_COLLECTION_NAME, RoomModelSchema);
  }

  /**
   * 객실 생성
   */
  async create(
    accomId: string,
    params: RoomCreateParams
  ): Promise<Document<RoomModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/room/${accomId}`,
      body
    );
    return parseFirstDocument(json, ROOM_COLLECTION_NAME, RoomModelSchema);
  }

  /**
   * 객실 업데이트
   */
  async update(
    accomId: string,
    roomId: string,
    params: RoomUpdateParams
  ): Promise<Document<RoomModel> | null> {
    const body = toApiBody(params);
    
    // 빈 업데이트는 스킵
    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/room/${accomId}/${roomId}`,
      body
    );
    return parseDocumentById(json, ROOM_COLLECTION_NAME, roomId, RoomModelSchema);
  }

  /**
   * 객실 삭제
   */
  async delete(accomId: string, roomId: string): Promise<void> {
    await this.client.delete(`/v1/room/${accomId}/${roomId}`);
  }

  /**
   * 객실 상태 로그 검색
   */
  async searchStateLogs(
    accomId: string,
    options: {
      limit: number;
      startAt: number;
      endAt?: number;
      roomId?: string;
      containsKey?: string;
    }
  ): Promise<RoomStateLogSearchResult> {
    const params = new URLSearchParams({
      limit: options.limit.toString(),
      'start-at': options.startAt.toString(),
    });

    if (options.endAt) {
      params.set('end-at', options.endAt.toString());
    }
    if (options.roomId) {
      params.set('room-id', options.roomId);
    }
    if (options.containsKey) {
      params.set('contains-key', options.containsKey);
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-state-log/${accomId}?${params.toString()}`
    );

    const result = RoomStateLogSearchResultSchema.parse(json);
    const logs = parseDocumentList(
      json,
      CollectionName.ROOM_STATE_LOG,
      RoomStateLogModelSchema
    );

    return {
      logs,
      nextStartAt: result.next_start_at ?? null,
    };
  }
}
