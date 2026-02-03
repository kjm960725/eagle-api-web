import { BaseController, parseDocumentList, parseFirstDocument } from './base.js';
import {
  RoomInterruptModelSchema,
  ROOM_INTERRUPT_COLLECTION_NAME,
  type RoomInterruptModel,
} from '../models/roomInterrupt.js';
import type { Document } from '../models/base.js';

/**
 * RoomInterrupt Controller
 * 
 * 객실 인터럽트(잠금) 관련 작업을 제공합니다.
 * 객실을 다른 클라이언트에서 액세스할 수 없도록 일시적으로 잠글 때 사용합니다.
 */
export class RoomInterruptController extends BaseController {
  /**
   * 객실 잠금 상태 조회
   */
  async get(accomId: string, roomId: string): Promise<Document<RoomInterruptModel> | null> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-interrupt/${accomId}/${roomId}`
    );
    return parseFirstDocument(json, ROOM_INTERRUPT_COLLECTION_NAME, RoomInterruptModelSchema);
  }

  /**
   * 업소의 모든 객실 잠금 조회
   */
  async getAllByAccom(accomId: string): Promise<Array<Document<RoomInterruptModel>>> {
    const json = await this.client.get<Record<string, unknown>>(
      `/v1/room-interrupt/all-by-accom/${accomId}`
    );
    return parseDocumentList(json, ROOM_INTERRUPT_COLLECTION_NAME, RoomInterruptModelSchema);
  }

  /**
   * 객실 잠금
   * 
   * - 이미 잠긴 객실에 인터럽트 요청을 보낼 경우:
   *   - 타 클라이언트로 인해 잠긴 객실: 기존 room_interrupt 반환
   *   - 본인에 의해 잠긴 객실: 잠금 지속 시간 연장
   * - 클라이언트가 명시적으로 해제하지 않으면 일정 시간 후 자동 삭제됨
   */
  async lock(accomId: string, roomId: string): Promise<Document<RoomInterruptModel> | null> {
    const json = await this.client.post<Record<string, unknown>>(
      `/v1/room-interrupt/${accomId}/${roomId}`,
      {}
    );
    return parseFirstDocument(json, ROOM_INTERRUPT_COLLECTION_NAME, RoomInterruptModelSchema);
  }

  /**
   * 객실 잠금 해제
   * 
   * 타 클라이언트로 인해 잠긴 객실은 잠금 해제에 실패합니다.
   */
  async unlock(accomId: string, roomId: string): Promise<Document<RoomInterruptModel> | null> {
    const json = await this.client.delete<Record<string, unknown>>(
      `/v1/room-interrupt/${accomId}/${roomId}`
    );
    return parseFirstDocument(json, ROOM_INTERRUPT_COLLECTION_NAME, RoomInterruptModelSchema);
  }
}
