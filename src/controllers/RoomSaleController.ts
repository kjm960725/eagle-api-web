import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  RoomSaleModelSchema,
  RoomPaymentModelSchema,
  ROOM_SALE_COLLECTION_NAME,
  ROOM_PAYMENT_COLLECTION_NAME,
  type RoomSaleModel,
  type RoomPaymentModel,
  type PaymentItemSchema,
  type BreakfastItemSchema,
  type AlarmSchema,
  type IdCardAuthSchema,
} from '../models/roomSale.js';
import { RoomModelSchema, ROOM_COLLECTION_NAME, type RoomModel } from '../models/room.js';
import type { Document } from '../models/base.js';
import type { RoomStayType } from '../types/enums.js';
import type { z } from 'zod';

/** 결제 항목 타입 */
type PaymentItem = z.infer<typeof PaymentItemSchema>;
/** 조식 항목 타입 */
type BreakfastItem = z.infer<typeof BreakfastItemSchema>;
/** 알람 타입 */
type Alarm = z.infer<typeof AlarmSchema>;
/** 신분증 인증 타입 */
type IdCardAuth = z.infer<typeof IdCardAuthSchema>;

/**
 * RoomSale 생성 파라미터
 */
export interface RoomSaleCreateParams {
  /** 객실 ID (필수) */
  roomId: string;
  /** 이용 유형 */
  stayType?: RoomStayType;
  /** 퇴실 예정 시간 */
  checkOutSchedTime?: number;
  /** 객실 요금 */
  fee?: number;
  /** 메모 */
  note?: string;
  /** 차량 번호 */
  carNo?: string;
  /** 고객 휴대폰 번호 (최대 10개) */
  phones?: string[];
  /** 인원 수 */
  personCount?: number;
  /** 예약 ID */
  roomReserveId?: string;
  /** 조식 메뉴 */
  breakfasts?: BreakfastItem[];
  /** 알람 설정 */
  alarm?: Alarm;
  /** 신분증 인증 내역 */
  idCardAuth?: IdCardAuth[];
  /** 결제 내역 */
  payments?: PaymentItem[];
  /** 전원 차단 무시 */
  ignorePowerDown?: boolean;
}

/**
 * RoomSale 업데이트 파라미터
 */
export interface RoomSaleUpdateParams {
  /** 이용 유형 */
  stayType?: RoomStayType;
  /** 퇴실 예정 시간 */
  checkOutSchedTime?: number;
  /** 입실 여부 */
  activate?: boolean;
  /** 객실 요금 */
  fee?: number;
  /** 메모 */
  note?: string;
  /** 차량 번호 */
  carNo?: string;
  /** 고객 휴대폰 번호 (최대 10개) */
  phones?: string[];
  /** 인원 수 */
  personCount?: number;
  /** 조식 메뉴 */
  breakfasts?: BreakfastItem[];
  /** 알람 설정 */
  alarm?: Alarm;
  /** 신분증 인증 내역 */
  idCardAuth?: IdCardAuth[];
  /** 결제 내역 */
  payments?: PaymentItem[];
  /** 전원 차단 무시 */
  ignorePowerDown?: boolean;
}

/**
 * RoomSale 검색 옵션
 */
export interface RoomSaleSearchOptions {
  /** 페이지당 개수 (필수, 1-100) */
  limit: number;
  /** 검색 시작 시간 (필수) */
  startAt: number;
  /** 검색 종료 시간 */
  endAt?: number;
  /** 검색 키 */
  key?: 'room_id' | 'stay_type' | 'note' | 'car_no' | 'phone' | 'channel_type';
  /** 검색 값 */
  value?: string;
}

/**
 * RoomPayment 검색 옵션
 */
export interface RoomPaymentSearchOptions {
  /** 페이지당 개수 (필수, 1-100) */
  limit: number;
  /** 검색 시작 시간 (필수) */
  startAt: number;
  /** 검색 종료 시간 */
  endAt?: number;
  /** 검색 키 */
  key?: 'room_id' | 'stay_type' | 'room_type_id' | 'channel_type' | 'channel_id' | 'agent_type' | 'note' | 'car_no' | 'phone';
  /** 검색 값 */
  value?: string;
}

/**
 * 파라미터를 API 요청 본문으로 변환 (생성용)
 */
function toCreateApiBody(params: RoomSaleCreateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    room_id: params.roomId,
  };

  if (params.stayType !== undefined) body['stay_type'] = params.stayType;
  if (params.checkOutSchedTime !== undefined) body['check_out_sched_time'] = params.checkOutSchedTime;
  if (params.fee !== undefined) body['fee'] = params.fee;
  if (params.note !== undefined) body['note'] = params.note;
  if (params.carNo !== undefined) body['car_no'] = params.carNo;
  if (params.phones !== undefined) body['phones'] = params.phones;
  if (params.personCount !== undefined) body['person_count'] = params.personCount;
  if (params.roomReserveId !== undefined) body['room_reserve_id'] = params.roomReserveId;
  if (params.breakfasts !== undefined) body['breakfasts'] = params.breakfasts;
  if (params.alarm !== undefined) body['alarm'] = params.alarm;
  if (params.idCardAuth !== undefined) body['id_card_auth'] = params.idCardAuth;
  if (params.payments !== undefined) body['payments'] = params.payments;
  if (params.ignorePowerDown !== undefined) body['ignore_power_down'] = params.ignorePowerDown;

  return body;
}

/**
 * 파라미터를 API 요청 본문으로 변환 (업데이트용)
 */
function toUpdateApiBody(params: RoomSaleUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.stayType !== undefined) body['stay_type'] = params.stayType;
  if (params.checkOutSchedTime !== undefined) body['check_out_sched_time'] = params.checkOutSchedTime;
  if (params.activate !== undefined) body['activate'] = params.activate;
  if (params.fee !== undefined) body['fee'] = params.fee;
  if (params.note !== undefined) body['note'] = params.note;
  if (params.carNo !== undefined) body['car_no'] = params.carNo;
  if (params.phones !== undefined) body['phones'] = params.phones;
  if (params.personCount !== undefined) body['person_count'] = params.personCount;
  if (params.breakfasts !== undefined) body['breakfasts'] = params.breakfasts;
  if (params.alarm !== undefined) body['alarm'] = params.alarm;
  if (params.idCardAuth !== undefined) body['id_card_auth'] = params.idCardAuth;
  if (params.payments !== undefined) body['payments'] = params.payments;
  if (params.ignorePowerDown !== undefined) body['ignore_power_down'] = params.ignorePowerDown;

  return body;
}

/**
 * RoomSale Controller
 * 
 * 객실 매출 관련 CRUD 작업을 제공합니다.
 */
export class RoomSaleController extends BaseController {
  /**
   * 단일 매출 조회
   */
  async get(accomId: string, roomSaleId: string): Promise<Document<RoomSaleModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-sale/${accomId}/${roomSaleId}`
    );
    return parseFirstDocument(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema);
  }

  /**
   * 매출 목록 검색
   */
  async search(accomId: string, options: RoomSaleSearchOptions): Promise<{
    roomSales: Array<Document<RoomSaleModel>>;
    nextStartAt: number | null;
  }> {
    const params = new URLSearchParams({
      limit: options.limit.toString(),
      'start-at': options.startAt.toString(),
    });

    if (options.endAt !== undefined) {
      params.set('end-at', options.endAt.toString());
    }
    if (options.key !== undefined) {
      params.set('key', options.key);
    }
    if (options.value !== undefined) {
      params.set('value', options.value);
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-sale/${accomId}?${params.toString()}`
    );

    const roomSales = parseDocumentList(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema);
    const nextStartAt = (json['next_start_at'] as number) ?? null;

    return { roomSales, nextStartAt };
  }

  /**
   * 현재 체크인 중인 모든 매출 조회
   */
  async getAllActivated(accomId: string): Promise<Array<Document<RoomSaleModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-sale/all-activated/${accomId}`
    );
    return parseDocumentList(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema);
  }

  /**
   * 월별/일별 매출 조회
   */
  async getAllByDate(
    accomId: string,
    year: number,
    month: number,
    day?: number
  ): Promise<Array<Document<RoomSaleModel>>> {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString(),
    });

    if (day !== undefined) {
      params.set('day', day.toString());
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-sale/all/${accomId}?${params.toString()}`
    );
    return parseDocumentList(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema);
  }

  /**
   * 매출 생성
   */
  async create(accomId: string, params: RoomSaleCreateParams): Promise<{
    roomSale: Document<RoomSaleModel> | null;
    room: Document<RoomModel> | null;
  }> {
    const body = toCreateApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/room-sale/${accomId}`,
      body
    );

    return {
      roomSale: parseFirstDocument(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema),
      room: parseFirstDocument(json, ROOM_COLLECTION_NAME, RoomModelSchema),
    };
  }

  /**
   * 매출 업데이트
   */
  async update(
    accomId: string,
    roomSaleId: string,
    params: RoomSaleUpdateParams
  ): Promise<{
    roomSale: Document<RoomSaleModel> | null;
    room: Document<RoomModel> | null;
  }> {
    const body = toUpdateApiBody(params);

    if (Object.keys(body).length === 0) {
      return { roomSale: null, room: null };
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/room-sale/${accomId}/${roomSaleId}`,
      body
    );

    return {
      roomSale: parseFirstDocument(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema),
      room: parseFirstDocument(json, ROOM_COLLECTION_NAME, RoomModelSchema),
    };
  }

  /**
   * 매출 삭제
   */
  async delete(accomId: string, roomSaleId: string): Promise<{
    roomSale: Document<RoomSaleModel> | null;
    room: Document<RoomModel> | null;
  }> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/room-sale/${accomId}/${roomSaleId}`
    );

    return {
      roomSale: parseFirstDocument(json, ROOM_SALE_COLLECTION_NAME, RoomSaleModelSchema),
      room: parseFirstDocument(json, ROOM_COLLECTION_NAME, RoomModelSchema),
    };
  }

  /**
   * 결제 내역 검색
   */
  async searchPayments(accomId: string, options: RoomPaymentSearchOptions): Promise<{
    roomPayments: Array<Document<RoomPaymentModel>>;
    nextStartAt: number | null;
  }> {
    const params = new URLSearchParams({
      limit: options.limit.toString(),
      'start-at': options.startAt.toString(),
    });

    if (options.endAt !== undefined) {
      params.set('end-at', options.endAt.toString());
    }
    if (options.key !== undefined) {
      params.set('key', options.key);
    }
    if (options.value !== undefined) {
      params.set('value', options.value);
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-sale/payment/${accomId}?${params.toString()}`
    );

    const roomPayments = parseDocumentList(json, ROOM_PAYMENT_COLLECTION_NAME, RoomPaymentModelSchema);
    const nextStartAt = (json['next_start_at'] as number) ?? null;

    return { roomPayments, nextStartAt };
  }

  /**
   * 월별/일별 결제 내역 조회
   */
  async getAllPaymentsByDate(
    accomId: string,
    year: number,
    month: number,
    day?: number
  ): Promise<Array<Document<RoomPaymentModel>>> {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString(),
    });

    if (day !== undefined) {
      params.set('day', day.toString());
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-sale/payment/all/${accomId}?${params.toString()}`
    );
    return parseDocumentList(json, ROOM_PAYMENT_COLLECTION_NAME, RoomPaymentModelSchema);
  }
}
