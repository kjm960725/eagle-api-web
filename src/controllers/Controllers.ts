import type { RestApiClient } from '../client/RestApiClient.js';
import { RoomController } from './RoomController.js';
import { DeviceController } from './DeviceController.js';
import { AccomController } from './AccomController.js';
import { UserController } from './UserController.js';

/**
 * Controllers Facade
 * 
 * 모든 Controller를 하나의 진입점으로 제공합니다.
 * C#의 EControllers struct에 해당합니다.
 */
export class Controllers {
  /** 객실 컨트롤러 */
  readonly room: RoomController;
  
  /** 디바이스 컨트롤러 */
  readonly device: DeviceController;
  
  /** 업소 컨트롤러 */
  readonly accom: AccomController;
  
  /** 사용자 컨트롤러 */
  readonly user: UserController;

  constructor(client: RestApiClient) {
    this.room = new RoomController(client);
    this.device = new DeviceController(client);
    this.accom = new AccomController(client);
    this.user = new UserController(client);
  }
}
