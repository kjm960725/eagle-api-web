import type { RestApiClient } from '../client/RestApiClient.js';
import type { Document } from '../models/base.js';
import type { z } from 'zod';
import { CollectionName } from '../types/constants.js';

/**
 * 기본 Controller 추상 클래스
 */
export abstract class BaseController {
  constructor(protected readonly client: RestApiClient) {}
}

/**
 * API 응답에서 Document 목록 파싱
 * @returns Zod 스키마의 output 타입으로 변환된 Document 배열
 */
export function parseDocumentList<S extends z.ZodTypeAny>(
  json: Record<string, unknown>,
  collectionName: CollectionName,
  schema: S
): Array<Document<z.output<S>>> {
  const collection = json[collectionName];
  
  if (!collection || typeof collection !== 'object') {
    return [];
  }

  return Object.entries(collection as Record<string, unknown>).map(([id, data]) => ({
    id,
    data: schema.parse(data) as z.output<S>,
  }));
}

/**
 * API 응답에서 첫 번째 Document 파싱
 */
export function parseFirstDocument<S extends z.ZodTypeAny>(
  json: Record<string, unknown>,
  collectionName: CollectionName,
  schema: S
): Document<z.output<S>> | null {
  const documents = parseDocumentList(json, collectionName, schema);
  return documents[0] ?? null;
}

/**
 * API 응답에서 특정 ID의 Document 파싱
 */
export function parseDocumentById<S extends z.ZodTypeAny>(
  json: Record<string, unknown>,
  collectionName: CollectionName,
  id: string,
  schema: S
): Document<z.output<S>> | null {
  const collection = json[collectionName];
  
  if (!collection || typeof collection !== 'object') {
    return null;
  }

  const data = (collection as Record<string, unknown>)[id];
  
  if (!data) {
    return null;
  }

  return {
    id,
    data: schema.parse(data) as z.output<S>,
  };
}
