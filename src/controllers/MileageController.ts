import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  MileageModelSchema,
  MileageMemberModelSchema,
  MILEAGE_COLLECTION_NAME,
  MILEAGE_MEMBER_COLLECTION_NAME,
  type MileageModel,
  type MileageMemberModel,
} from '../models/mileage.js';
import type { Document } from '../models/base.js';

/**
 * MileageMember 생성 파라미터
 */
export interface MileageMemberCreateParams {
  /** 휴대폰 번호 (필수) */
  phone: string;
  /** 회원명 */
  name?: string;
}

/**
 * MileageMember 업데이트 파라미터
 */
export interface MileageMemberUpdateParams {
  /** 회원명 */
  name?: string;
}

/**
 * Mileage 검색 옵션
 */
export interface MileageSearchOptions {
  /** 페이지당 개수 (필수, 1-100) */
  limit: number;
  /** 검색 시작 시간 (registed_time 기준, 필수) */
  startAt: number;
  /** 검색 종료 시간 */
  endAt?: number;
  /** 마일리지 회원 ID */
  memberId?: string;
}

/**
 * MileageMember 검색 옵션
 */
export interface MileageMemberSearchOptions {
  /** 페이지당 개수 (필수, 1-100) */
  limit: number;
  /** 검색 시작 시간 (updated_time 기준, 필수) */
  startAt: number;
  /** 검색 종료 시간 */
  endAt?: number;
  /** 검색어 */
  search?: string;
}

/**
 * Mileage Controller
 * 
 * 마일리지 관련 작업을 제공합니다.
 */
export class MileageController extends BaseController {
  /**
   * 마일리지 적립/차감
   */
  async addPoint(
    accomId: string,
    phone: string,
    point: number
  ): Promise<Document<MileageModel> | null> {
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/mileage/${accomId}/${phone}`,
      { point }
    );
    return parseFirstDocument(json, MILEAGE_COLLECTION_NAME, MileageModelSchema);
  }

  /**
   * 마일리지 이력 검색
   */
  async search(accomId: string, options: MileageSearchOptions): Promise<{
    mileages: Array<Document<MileageModel>>;
    nextStartAt: number | null;
  }> {
    const params = new URLSearchParams({
      limit: options.limit.toString(),
      'start-at': options.startAt.toString(),
    });

    if (options.endAt !== undefined) {
      params.set('end-at', options.endAt.toString());
    }
    if (options.memberId !== undefined) {
      params.set('member_id', options.memberId);
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/mileage/${accomId}?${params.toString()}`
    );

    const mileages = parseDocumentList(json, MILEAGE_COLLECTION_NAME, MileageModelSchema);
    const nextStartAt = (json['next_start_at'] as number) ?? null;

    return { mileages, nextStartAt };
  }

  /**
   * 마일리지 회원 조회
   */
  async getMember(accomId: string, phone: string): Promise<Document<MileageMemberModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/mileage-member/${accomId}/${phone}`
    );
    return parseFirstDocument(json, MILEAGE_MEMBER_COLLECTION_NAME, MileageMemberModelSchema);
  }

  /**
   * 마일리지 회원 목록 검색
   */
  async searchMembers(accomId: string, options: MileageMemberSearchOptions): Promise<{
    members: Array<Document<MileageMemberModel>>;
    nextStartAt: number | null;
  }> {
    const params = new URLSearchParams({
      limit: options.limit.toString(),
      'start-at': options.startAt.toString(),
    });

    if (options.endAt !== undefined) {
      params.set('end-at', options.endAt.toString());
    }
    if (options.search !== undefined) {
      params.set('search', options.search);
    }

    const json = await this.client.get<Record<string, unknown>>(
      `/v1/mileage-member/${accomId}?${params.toString()}`
    );

    const members = parseDocumentList(json, MILEAGE_MEMBER_COLLECTION_NAME, MileageMemberModelSchema);
    const nextStartAt = (json['next_start_at'] as number) ?? null;

    return { members, nextStartAt };
  }

  /**
   * 마일리지 회원 등록
   */
  async createMember(
    accomId: string,
    params: MileageMemberCreateParams
  ): Promise<Document<MileageMemberModel> | null> {
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/mileage-member/${accomId}`,
      {
        phone: params.phone,
        name: params.name,
      }
    );
    return parseFirstDocument(json, MILEAGE_MEMBER_COLLECTION_NAME, MileageMemberModelSchema);
  }

  /**
   * 마일리지 회원 업데이트
   */
  async updateMember(
    accomId: string,
    phone: string,
    params: MileageMemberUpdateParams
  ): Promise<Document<MileageMemberModel> | null> {
    const body: Record<string, unknown> = {};
    if (params.name !== undefined) body['name'] = params.name;

    if (Object.keys(body).length === 0) {
      return null;
    }

    const json = await this.client.put<Record<string, unknown>>(
      `/v1/mileage-member/${accomId}/${phone}`,
      body
    );
    return parseFirstDocument(json, MILEAGE_MEMBER_COLLECTION_NAME, MileageMemberModelSchema);
  }

  /**
   * 마일리지 회원 삭제
   */
  async deleteMember(accomId: string, phone: string): Promise<Document<MileageMemberModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/mileage-member/${accomId}/${phone}`
    );
    return parseFirstDocument(json, MILEAGE_MEMBER_COLLECTION_NAME, MileageMemberModelSchema);
  }
}
