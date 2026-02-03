import type { RestApiClient } from '../client/RestApiClient.js';
import { RoomController } from './RoomController.js';
import { DeviceController } from './DeviceController.js';
import { AccomController } from './AccomController.js';
import { UserController } from './UserController.js';
import { AppController } from './AppController.js';
import { RoomTypeController } from './RoomTypeController.js';
import { NotifyController } from './NotifyController.js';
import { DoorLockController } from './DoorLockController.js';
import { RoomSaleController } from './RoomSaleController.js';
import { RoomReserveController } from './RoomReserveController.js';
import { RoomInterruptController } from './RoomInterruptController.js';
import { ReserveAgentConfigController } from './ReserveAgentConfigController.js';
import { MileageController } from './MileageController.js';
import { BreakfastController } from './BreakfastController.js';
import { KioskController } from './KioskController.js';
import { CustomConfigController } from './CustomConfigController.js';

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

  /** 앱 컨트롤러 */
  readonly app: AppController;

  /** 객실 유형 컨트롤러 */
  readonly roomType: RoomTypeController;

  /** 알림 컨트롤러 */
  readonly notify: NotifyController;

  /** 도어락 컨트롤러 */
  readonly doorLock: DoorLockController;

  /** 매출 컨트롤러 */
  readonly roomSale: RoomSaleController;

  /** 예약 컨트롤러 */
  readonly roomReserve: RoomReserveController;

  /** 객실 인터럽트 컨트롤러 */
  readonly roomInterrupt: RoomInterruptController;

  /** 예약 연동 설정 컨트롤러 */
  readonly reserveAgentConfig: ReserveAgentConfigController;

  /** 마일리지 컨트롤러 */
  readonly mileage: MileageController;

  /** 조식 컨트롤러 */
  readonly breakfast: BreakfastController;

  /** 키오스크 컨트롤러 */
  readonly kiosk: KioskController;

  /** 커스텀 설정 컨트롤러 */
  readonly customConfig: CustomConfigController;

  constructor(client: RestApiClient) {
    this.room = new RoomController(client);
    this.device = new DeviceController(client);
    this.accom = new AccomController(client);
    this.user = new UserController(client);
    this.app = new AppController(client);
    this.roomType = new RoomTypeController(client);
    this.notify = new NotifyController(client);
    this.doorLock = new DoorLockController(client);
    this.roomSale = new RoomSaleController(client);
    this.roomReserve = new RoomReserveController(client);
    this.roomInterrupt = new RoomInterruptController(client);
    this.reserveAgentConfig = new ReserveAgentConfigController(client);
    this.mileage = new MileageController(client);
    this.breakfast = new BreakfastController(client);
    this.kiosk = new KioskController(client);
    this.customConfig = new CustomConfigController(client);
  }
}
