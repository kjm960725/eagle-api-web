/**
 * EagleApi - iCrew Cloud API Client for TypeScript
 * 
 * @packageDocumentation
 */

// 메인 클라이언트
export { EagleApiClient } from './EagleApiClient.js';

// 타입
export * from './types/index.js';

// 모델
export * from './models/index.js';

// 컨트롤러 (개별 import 필요 시)
export {
  Controllers,
  RoomController,
  DeviceController,
  AccomController,
  UserController,
  type RoomUpdateParams,
  type RoomCreateParams,
  type DeviceUpdateParams,
} from './controllers/index.js';

// 클라이언트 (고급 사용 시)
export {
  RestApiClient,
  EventListenerClient,
  ApiAuthType,
  isPropertyChanged,
  getPropertyChange,
  type AuthState,
  type ListenOptions,
  type DocumentChange,
  type DocumentChangeType,
  type ListenerState,
  type SnapshotEventArgs,
} from './client/index.js';
