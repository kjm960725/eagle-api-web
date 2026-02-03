import { z } from 'zod';
import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  KioskModelSchema,
  KIOSK_COLLECTION_NAME,
  type KioskModel,
  TtsConfigSchema,
  GuestCallBtnSchema,
  CashAcceptorSchema,
  CashDispensorSchema,
  ReceiptPrinterSchema,
  DistributorSchema,
  CreditCardReaderSchema,
} from '../models/kiosk.js';
import type { Document } from '../models/base.js';
import type { KioskType, KioskEventType, KioskCheckInType, KioskSaleState } from '../types/enums.js';

/** TTS 설정 타입 */
type TtsConfig = z.infer<typeof TtsConfigSchema>;
/** 게스트 콜 버튼 타입 */
type GuestCallBtn = z.infer<typeof GuestCallBtnSchema>;
/** 지폐 인식기 타입 */
type CashAcceptor = z.infer<typeof CashAcceptorSchema>;
/** 지폐 방출기 타입 */
type CashDispensor = z.infer<typeof CashDispensorSchema>;
/** 영수증 프린터 타입 */
type ReceiptPrinter = z.infer<typeof ReceiptPrinterSchema>;
/** 분배기 타입 */
type Distributor = z.infer<typeof DistributorSchema>;
/** 카드 리더기 타입 */
type CreditCardReader = z.infer<typeof CreditCardReaderSchema>;

/**
 * Kiosk 생성 파라미터
 */
export interface KioskCreateParams {
  /** 디바이스 ID (필수) */
  deviceId: string;
  /** 키오스크 유형 */
  type?: KioskType;
  /** 판매 상태 */
  saleState?: KioskSaleState;
  /** 키오스크에서 차량번호 입력 옵션 사용 여부 */
  useCarNoInputFromKiosk?: boolean;
  /** 키오스크 관리자 비밀번호 */
  adminPassword?: string;
  /** 유휴 상태 후 첫 페이지 복귀 시간 (초) */
  goHomePageAfterSecWhenIdle?: number;
  /** 결제 완료 후 첫 페이지 복귀 시간 (초) */
  goHomePageAfterSecWhenComplatePayment?: number;
  /** 관리자 페이지 자동 복귀 사용 여부 */
  useAutoPopAdminPage?: boolean;
  /** 첫 페이지에서 동작 감지시 카드데크 LED 점멸 */
  useCardDeckLedIntro?: boolean;
  /** TTS 설정 */
  tts?: TtsConfig;
  /** 객실 카드 도난 감지시 경보 사용 여부 */
  useCardTheftDetectionAlarm?: boolean;
  /** 성인인증 사용 여부 */
  useAdultAuth?: boolean;
  /** 성인인증할 최대 동행자 수 */
  maximumCompanionAdultAuth?: number;
  /** 키오스크 판매 중단 설정 */
  saleStop?: boolean;
  /** 중요 이벤트 발생시 문자 수신 휴대폰 번호 목록 */
  importantEventSmsReceivePhones?: string[];
  /** 게스트 콜 버튼 옵션 */
  guestCallBtn?: GuestCallBtn;
  /** 지폐 인식기 상태/설정 */
  cashAcceptor?: CashAcceptor;
  /** 지폐 방출기 상태/설정 */
  cashDispensor?: CashDispensor;
  /** 영수증 프린터 상태/설정 */
  receiptPrinter?: ReceiptPrinter;
  /** 분배기 상태/설정 */
  distributor?: Distributor;
  /** 카드 리더기 상태 */
  creditCardReader?: CreditCardReader;
}

/**
 * Kiosk 업데이트 파라미터
 */
export interface KioskUpdateParams {
  /** 키오스크 유형 */
  type?: KioskType;
  /** 판매 상태 */
  saleState?: KioskSaleState;
  /** 키오스크에서 차량번호 입력 옵션 사용 여부 */
  useCarNoInputFromKiosk?: boolean;
  /** 키오스크 관리자 비밀번호 */
  adminPassword?: string;
  /** 유휴 상태 후 첫 페이지 복귀 시간 (초) */
  goHomePageAfterSecWhenIdle?: number;
  /** 결제 완료 후 첫 페이지 복귀 시간 (초) */
  goHomePageAfterSecWhenComplatePayment?: number;
  /** 관리자 페이지 자동 복귀 사용 여부 */
  useAutoPopAdminPage?: boolean;
  /** 첫 페이지에서 동작 감지시 카드데크 LED 점멸 */
  useCardDeckLedIntro?: boolean;
  /** TTS 설정 */
  tts?: TtsConfig;
  /** 객실 카드 도난 감지시 경보 사용 여부 */
  useCardTheftDetectionAlarm?: boolean;
  /** 성인인증 사용 여부 */
  useAdultAuth?: boolean;
  /** 성인인증할 최대 동행자 수 */
  maximumCompanionAdultAuth?: number;
  /** 키오스크 판매 중단 설정 */
  saleStop?: boolean;
  /** 중요 이벤트 발생시 문자 수신 휴대폰 번호 목록 */
  importantEventSmsReceivePhones?: string[];
  /** 게스트 콜 버튼 옵션 */
  guestCallBtn?: GuestCallBtn;
  /** 지폐 인식기 상태/설정 */
  cashAcceptor?: CashAcceptor;
  /** 지폐 방출기 상태/설정 */
  cashDispensor?: CashDispensor;
  /** 영수증 프린터 상태/설정 */
  receiptPrinter?: ReceiptPrinter;
  /** 분배기 상태/설정 */
  distributor?: Distributor;
  /** 카드 리더기 상태 */
  creditCardReader?: CreditCardReader;
  /** 활성화 여부 */
  isActive?: boolean;
}

/**
 * Kiosk 이벤트 파라미터
 */
export interface KioskEventParams {
  /** 이벤트 타입 (필수) */
  eventType: KioskEventType;
  /** 객실 ID */
  roomId?: string;
  /** 결제 금액 */
  amount?: number;
}

/**
 * 객실 판매 가능 여부 응답 스키마
 */
const QueryRoomAvailableResponseSchema = z.object({
  success: z.boolean().default(false),
  messages: z.array(z.string()).default([]),
});

/**
 * 객실 판매 가능 여부 응답
 */
export interface QueryRoomAvailableResponse {
  success: boolean;
  messages: string[];
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: KioskCreateParams | KioskUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('deviceId' in params && params.deviceId !== undefined) body['device_id'] = params.deviceId;
  if (params.type !== undefined) body['type'] = params.type;
  if (params.saleState !== undefined) body['sale_state'] = params.saleState;
  if (params.useCarNoInputFromKiosk !== undefined) body['use_car_no_input_from_kiosk'] = params.useCarNoInputFromKiosk;
  if (params.adminPassword !== undefined) body['admin_password'] = params.adminPassword;
  if (params.goHomePageAfterSecWhenIdle !== undefined) body['go_home_page_after_sec_when_idle'] = params.goHomePageAfterSecWhenIdle;
  if (params.goHomePageAfterSecWhenComplatePayment !== undefined) body['go_home_page_after_sec_when_complate_payment'] = params.goHomePageAfterSecWhenComplatePayment;
  if (params.useAutoPopAdminPage !== undefined) body['use_auto_pop_admin_page'] = params.useAutoPopAdminPage;
  if (params.useCardDeckLedIntro !== undefined) body['use_card_deck_led_intro'] = params.useCardDeckLedIntro;
  if (params.tts !== undefined) body['tts'] = params.tts;
  if (params.useCardTheftDetectionAlarm !== undefined) body['use_card_theft_detection_alarm'] = params.useCardTheftDetectionAlarm;
  if (params.useAdultAuth !== undefined) body['use_adult_auth'] = params.useAdultAuth;
  if (params.maximumCompanionAdultAuth !== undefined) body['maximum_companion_adult_auth'] = params.maximumCompanionAdultAuth;
  if (params.saleStop !== undefined) body['sale_stop'] = params.saleStop;
  if (params.importantEventSmsReceivePhones !== undefined) body['important_event_sms_receive_phones'] = params.importantEventSmsReceivePhones;
  if (params.guestCallBtn !== undefined) body['guest_call_btn'] = params.guestCallBtn;
  if (params.cashAcceptor !== undefined) body['cash_acceptor'] = params.cashAcceptor;
  if (params.cashDispensor !== undefined) body['cash_dispensor'] = params.cashDispensor;
  if (params.receiptPrinter !== undefined) body['receipt_printer'] = params.receiptPrinter;
  if (params.distributor !== undefined) body['distributor'] = params.distributor;
  if (params.creditCardReader !== undefined) body['credit_card_reader'] = params.creditCardReader;
  if ('isActive' in params && params.isActive !== undefined) body['is_active'] = params.isActive;

  return body;
}

/**
 * Kiosk Controller
 * 
 * 키오스크 관련 CRUD 작업을 제공합니다.
 */
export class KioskController extends BaseController {
  /**
   * 단일 키오스크 조회
   */
  async get(accomId: string, kioskId: string): Promise<Document<KioskModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/kiosk/${accomId}/${kioskId}`
    );
    return parseFirstDocument(json, KIOSK_COLLECTION_NAME, KioskModelSchema);
  }

  /**
   * 디바이스 ID로 키오스크 조회
   */
  async getByDevice(accomId: string, deviceId: string): Promise<Document<KioskModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/kiosk/by-device/${accomId}/${deviceId}`
    );
    return parseFirstDocument(json, KIOSK_COLLECTION_NAME, KioskModelSchema);
  }

  /**
   * 업소의 모든 키오스크 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<KioskModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/kiosk/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, KIOSK_COLLECTION_NAME, KioskModelSchema);
  }

  /**
   * 객실 판매 가능 여부 조회
   */
  async queryRoomAvailable(
    accomId: string,
    deviceId: string,
    roomId: string,
    checkInType: KioskCheckInType,
    roomReserveId?: string
  ): Promise<QueryRoomAvailableResponse> {
    const params = new URLSearchParams({
      device_id: deviceId,
      room_id: roomId,
      check_in_type: checkInType,
    });

    if (roomReserveId !== undefined) {
      params.set('room_reserve_id', roomReserveId);
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/kiosk/query-room-available/${accomId}?${params.toString()}`
    );

    return QueryRoomAvailableResponseSchema.parse(json);
  }

  /**
   * 키오스크 생성
   */
  async create(
    accomId: string,
    params: KioskCreateParams
  ): Promise<Document<KioskModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/kiosk/${accomId}`,
      body
    );
    return parseFirstDocument(json, KIOSK_COLLECTION_NAME, KioskModelSchema);
  }

  /**
   * 키오스크 업데이트
   */
  async update(
    accomId: string,
    kioskId: string,
    params: KioskUpdateParams
  ): Promise<Document<KioskModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/kiosk/${accomId}/${kioskId}`,
      body
    );
    return parseFirstDocument(json, KIOSK_COLLECTION_NAME, KioskModelSchema);
  }

  /**
   * 키오스크 삭제
   */
  async delete(accomId: string, kioskId: string): Promise<Document<KioskModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/kiosk/${accomId}/${kioskId}`
    );
    return parseFirstDocument(json, KIOSK_COLLECTION_NAME, KioskModelSchema);
  }

  /**
   * 키오스크 이벤트 전송
   * 
   * 업소에 등록된 사용자들에게 푸시 알림을 전송합니다.
   */
  async sendEvent(
    accomId: string,
    kioskId: string,
    params: KioskEventParams
  ): Promise<{ message: string; sentToUsers: number }> {
    const body: Record<string, unknown> = {
      event_type: params.eventType,
    };

    if (params.roomId !== undefined) body['room_id'] = params.roomId;
    if (params.amount !== undefined) body['amount'] = params.amount;

    const json = await this.client.post<Record<string, unknown>>(
      `/v1/kiosk/event/${accomId}/${kioskId}`,
      body
    );

    return {
      message: (json['message'] as string) ?? '',
      sentToUsers: (json['sent_to_users'] as number) ?? 0,
    };
  }
}
