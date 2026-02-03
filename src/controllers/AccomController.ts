import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  AccomModelSchema,
  ACCOM_COLLECTION_NAME,
  type AccomModel,
} from '../models/accom.js';
import type { Document } from '../models/base.js';

/**
 * Accom Controller
 * 
 * 업소 관련 조회 작업을 제공합니다.
 */
export class AccomController extends BaseController {
  /**
   * 단일 업소 조회
   */
  async get(accomId: string): Promise<Document<AccomModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/accom/${accomId}`
    );
    return parseFirstDocument(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }

  /**
   * 앱의 모든 업소 조회
   */
  async getAllByApp(): Promise<Array<Document<AccomModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/accom/all-by-app`
    );
    return parseDocumentList(json, ACCOM_COLLECTION_NAME, AccomModelSchema);
  }
}
