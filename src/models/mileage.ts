import { z } from 'zod';
import { BaseModelSchema } from './base.js';
import { CollectionName } from '../types/constants.js';

/**
 * 마일리지 이력 모델 스키마
 */
export const MileageModelSchema = BaseModelSchema.extend({
  /** 업소 ID (readOnly) */
  accom_id: z.string().default(''),

  /** 마일리지 회원 ID */
  member_id: z.string().default(''),

  /** 적립 포인트 */
  save_point: z.number().default(0),

  /** 사용 포인트 */
  use_point: z.number().default(0),

  /** 무인(키오스크) 적립/사용 여부 */
  is_unmanned: z.boolean().default(false),

  /** 객실 결제 내역 ID 참조 */
  room_payment_id: z.string().nullable().optional(),

  /** 업소 메모 (적립 및 사용 이유에 대한 특이사항 기재) */
  memo: z.string().default(''),

  /** 등록 시간 (readOnly) */
  registed_time: z.number().default(0),
});

/** 마일리지 이력 모델 타입 */
export type MileageModel = z.output<typeof MileageModelSchema>;

/**
 * Mileage 컬렉션명
 */
export const MILEAGE_COLLECTION_NAME = CollectionName.MILEAGE;

/**
 * 마일리지 회원 모델 스키마
 */
export const MileageMemberModelSchema = BaseModelSchema.extend({
  /** 업소 ID */
  accom_id: z.string().default(''),

  /** 휴대폰 번호 */
  phone: z.string().default(''),

  /** 회원명 */
  name: z.string().default(''),

  /** 현재 적립 포인트 */
  point: z.number().default(0),

  /** 총 적립 포인트 */
  total_earned: z.number().default(0),

  /** 총 사용 포인트 */
  total_used: z.number().default(0),

  /** 방문 횟수 */
  visit_count: z.number().default(0),

  /** 마지막 방문 시간 */
  last_visit_time: z.number().default(0),

  /** 업데이트 시간 */
  updated_time: z.number().default(0),
});

/** 마일리지 회원 모델 타입 */
export type MileageMemberModel = z.output<typeof MileageMemberModelSchema>;

/**
 * MileageMember 컬렉션명
 */
export const MILEAGE_MEMBER_COLLECTION_NAME = CollectionName.MILEAGE_MEMBER;
