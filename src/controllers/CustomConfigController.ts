import { BaseController } from './base.js';

/**
 * CustomConfig Controller
 * 
 * 업소에 저장되는 앱 전용 설정을 관리합니다.
 * 타 앱과 데이터를 공유하지 않는 설정 정보를 업소에 저장하고 싶을 때 유용합니다.
 * 
 * 스키마가 별도로 정의되어 있지 않으며 클라이언트에서 자유롭게 관리합니다.
 * 전체 데이터가 1MB를 초과하지 않도록 클라이언트가 관리해야 합니다.
 * 
 * 예약 키: "accom_id", "app_id", "key"는 사용할 수 없습니다.
 */
export class CustomConfigController extends BaseController {
  /**
   * 커스텀 설정 조회
   */
  async get<T = Record<string, unknown>>(
    accomId: string,
    appId: string,
    key: string
  ): Promise<T | null> {
    try {
      const json = await this.client.get<T>(
        `/v1/custom-config/${accomId}/${appId}/${key}`
      );
      return json;
    } catch {
      return null;
    }
  }

  /**
   * 커스텀 설정 덮어쓰기 (전체 교체)
   */
  async set<T = Record<string, unknown>>(
    accomId: string,
    appId: string,
    key: string,
    data: T
  ): Promise<void> {
    await this.client.post(
      `/v1/custom-config/${accomId}/${appId}/${key}`,
      data as Record<string, unknown>
    );
  }

  /**
   * 커스텀 설정 업데이트 (부분 업데이트)
   */
  async update<T = Record<string, unknown>>(
    accomId: string,
    appId: string,
    key: string,
    data: Partial<T>
  ): Promise<void> {
    await this.client.put(
      `/v1/custom-config/${accomId}/${appId}/${key}`,
      data as Record<string, unknown>
    );
  }
}
