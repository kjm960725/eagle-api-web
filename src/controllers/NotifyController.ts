import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  NotifyModelSchema,
  NOTIFY_COLLECTION_NAME,
  type NotifyModel,
  type NotifyAction,
} from '../models/notify.js';
import type { Document } from '../models/base.js';

/**
 * Notify 생성 파라미터
 */
export interface NotifyCreateParams {
  /** 알림 대상 업소 ID 목록 */
  accomIds?: string[];
  /** 모든 업소에 알림 전송 여부 */
  useAllAccom?: boolean;
  /** 알림 제목 (필수) */
  title: string;
  /** 알림 내용 */
  message?: string;
  /** 알림 액션 */
  action?: NotifyAction;
  /** 알림 타입 */
  type?: string;
  /** 사용 여부 */
  use?: boolean;
  /** 한번만 표시 여부 */
  singleShot?: boolean;
}

/**
 * Notify 업데이트 파라미터
 */
export interface NotifyUpdateParams {
  /** 알림 제목 */
  title?: string;
  /** 알림 내용 */
  message?: string;
  /** 알림 액션 */
  action?: NotifyAction;
  /** 알림 타입 */
  type?: string;
  /** 사용 여부 */
  use?: boolean;
  /** 한번만 표시 여부 */
  singleShot?: boolean;
}

/**
 * Notify 조회 옵션
 */
export interface NotifyGetAllOptions {
  /** 시작 시간 */
  startAt?: number;
  /** 페이지당 개수 */
  limit?: number;
}

/**
 * 파라미터를 API 요청 본문으로 변환
 */
function toApiBody(params: NotifyCreateParams | NotifyUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ('accomIds' in params && params.accomIds !== undefined) body['accom_ids'] = params.accomIds;
  if ('useAllAccom' in params && params.useAllAccom !== undefined) body['use_all_accom'] = params.useAllAccom;
  if ('title' in params && params.title !== undefined) body['title'] = params.title;
  if (params.message !== undefined) body['message'] = params.message;
  if (params.action !== undefined) body['action'] = params.action;
  if (params.type !== undefined) body['type'] = params.type;
  if (params.use !== undefined) body['use'] = params.use;
  if (params.singleShot !== undefined) body['single_shot'] = params.singleShot;

  return body;
}

/**
 * Notify Controller
 * 
 * 알림 관련 CRUD 작업을 제공합니다.
 */
export class NotifyController extends BaseController {
  /**
   * 단일 알림 조회
   */
  async get(notifyId: string): Promise<Document<NotifyModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/notify/${notifyId}`
    );
    return parseFirstDocument(json, NOTIFY_COLLECTION_NAME, NotifyModelSchema);
  }

  /**
   * 모든 알림 조회
   */
  async getAll(options: NotifyGetAllOptions = {}): Promise<Array<Document<NotifyModel>>> {
    const params = new URLSearchParams();

    if (options.startAt !== undefined) {
      params.set('start-at', options.startAt.toString());
    }
    if (options.limit !== undefined) {
      params.set('limit', options.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/v1/notify/all?${queryString}` : '/v1/notify/all';

    const json = await this.client.get<Record<string, unknown>>(url);
    return parseDocumentList(json, NOTIFY_COLLECTION_NAME, NotifyModelSchema);
  }

  /**
   * 업소 관련 알림 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<NotifyModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/notify/by-accom/${accomId}`
    );
    return parseDocumentList(json, NOTIFY_COLLECTION_NAME, NotifyModelSchema);
  }

  /**
   * 알림 생성
   */
  async create(params: NotifyCreateParams): Promise<Document<NotifyModel> | null> {
    const body = toApiBody(params);
    const json = await this.client.post<Record<string, unknown>>(
      '/v1/notify',
      body
    );
    return parseFirstDocument(json, NOTIFY_COLLECTION_NAME, NotifyModelSchema);
  }

  /**
   * 알림 업데이트
   */
  async update(
    notifyId: string,
    params: NotifyUpdateParams
  ): Promise<Document<NotifyModel> | null> {
    const body = toApiBody(params);

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/notify/${notifyId}`,
      body
    );
    return parseFirstDocument(json, NOTIFY_COLLECTION_NAME, NotifyModelSchema);
  }

  /**
   * 알림 삭제
   */
  async delete(notifyId: string): Promise<Document<NotifyModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/notify/${notifyId}`
    );
    return parseFirstDocument(json, NOTIFY_COLLECTION_NAME, NotifyModelSchema);
  }
}
