import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  UserModelSchema,
  USER_COLLECTION_NAME,
  type UserModel,
} from '../models/user.js';
import type { Document } from '../models/base.js';

/**
 * User Controller
 * 
 * 사용자 관련 조회 작업을 제공합니다.
 */
export class UserController extends BaseController {
  /**
   * 단일 사용자 조회
   */
  async get(userId: string): Promise<Document<UserModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/user/${userId}`
    );
    return parseFirstDocument(json, USER_COLLECTION_NAME, UserModelSchema);
  }

  /**
   * 업소의 모든 사용자 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<UserModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/user/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, USER_COLLECTION_NAME, UserModelSchema);
  }
}
