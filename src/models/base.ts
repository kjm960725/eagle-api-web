import { z } from 'zod';
import { AuthType } from '../types/enums.js';

/**
 * 모든 모델의 기본 스키마
 * C#의 EModelAbstract에 해당
 */
export const BaseModelSchema = z.object({
  /** 업데이트 시간 (Unix milliseconds) */
  update_time: z.number().optional(),

  /** 마지막 업데이트 인증 유형 */
  last_updated_auth_type: z.nativeEnum(AuthType).optional(),

  /** 마지막 업데이트 인증 ID */
  last_updated_auth_id: z.string().optional(),
});

/** 기본 모델 타입 */
export type BaseModel = z.output<typeof BaseModelSchema>;

/**
 * Unix timestamp를 Date로 변환
 */
export function unixMsToDate(unixMs: number | undefined): Date | undefined {
  if (unixMs === undefined || unixMs === 0) return undefined;
  return new Date(unixMs);
}

/**
 * Date를 Unix timestamp로 변환
 */
export function dateToUnixMs(date: Date | undefined): number | undefined {
  if (date === undefined) return undefined;
  return date.getTime();
}

/**
 * Document 래퍼 타입
 */
export interface Document<T> {
  /** 문서 ID */
  id: string;
  /** 문서 데이터 */
  data: T | null;
}

/**
 * 변경 추적이 가능한 Document
 */
export interface DocumentChange<T> extends Document<T> {
  /** 이전 데이터 */
  previousData: T | null;
}

/**
 * Document 생성 헬퍼
 */
export function createDocument<T>(id: string, data: T | null): Document<T> {
  return { id, data };
}
