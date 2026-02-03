# @kjm960725/eagle-api

iCrew Cloud API를 위한 TypeScript/JavaScript 클라이언트 라이브러리입니다.

## 특징

- TypeScript로 작성된 완전한 타입 지원
- REST API 및 WebSocket 실시간 이벤트 지원
- Zod 기반 모델 스키마 검증
- ESM 및 CommonJS 모듈 지원
- Node.js 환경 지원

## 설치

```bash
npm install @kjm960725/eagle-api
```

## 기본 사용법

```typescript
import { EagleApiClient } from '@kjm960725/eagle-api';

// 클라이언트 생성
const client = new EagleApiClient({
  appId: 'your-app-id',
});

// 디바이스로 인증
await client.authForDevice('AA:BB:CC:DD:EE:FF');

// 업소 ID 가져오기
const accomId = client.authedDevice?.data?.accom_id;

// 모든 객실 조회
const rooms = await client.controller.room.getAllByAccom(accomId);

for (const room of rooms) {
  console.log(`${room.data.display_name}: ${room.data.temp}°C`);
}

// 객실 업데이트
await client.controller.room.update(accomId, roomId, {
  temp: 25,
  setTemp: 24,
});
```

## WebSocket 이벤트 리스너

실시간으로 데이터 변경사항을 수신할 수 있습니다.

```typescript
import {
  EagleApiClient,
  SnapshotFlag,
  type DocumentChange,
} from '@kjm960725/eagle-api';

const client = new EagleApiClient({ appId: 'your-app-id' });
await client.authForDevice('AA:BB:CC:DD:EE:FF');

const accomId = client.authedDevice?.data?.accom_id;

// 이벤트 리스너 생성
const listener = client.createEventListener();

// 문서 변경 이벤트 핸들러
listener.on('documentChanged', (change: DocumentChange) => {
  console.log(`${change.collectionName}/${change.id} ${change.changeType}`);
  console.log('변경된 필드:', change.changedFields);
});

// 상태 변경 이벤트 핸들러
listener.on('stateChanged', (state) => {
  console.log(`연결: ${state.isConnected}, 에러: ${state.isError}`);
});

// 리스닝 시작
listener.listen({
  accomId,
  snapshots: [
    SnapshotFlag.ALL_ROOMS,
    SnapshotFlag.ALL_DEVICES,
    SnapshotFlag.ACTIVATED_ROOM_SALES,
  ],
  ignoreOwnChanges: true,
});

// 초기 데이터 수신 대기
await listener.waitForInitialized();
```

## 인증 방식

```typescript
// 디바이스 인증
await client.authForDevice('AA:BB:CC:DD:EE:FF');

// 앱 인증
await client.authForApp('your-app-secret');

// 사용자 인증
await client.authForUser('user-id', 'password');
```

## Controllers

클라이언트는 다음 컨트롤러들을 제공합니다:

| 컨트롤러 | 설명 |
|---------|------|
| `client.controller.room` | 객실 관리 (CRUD, 상태 조회) |
| `client.controller.roomType` | 객실 유형 관리 |
| `client.controller.roomSale` | 객실 매출 관리 |
| `client.controller.roomReserve` | 객실 예약 관리 |
| `client.controller.roomInterrupt` | 객실 인터럽트 관리 |
| `client.controller.device` | 디바이스 관리 |
| `client.controller.doorLock` | 도어락 관리 |
| `client.controller.accom` | 업소 관리 |
| `client.controller.user` | 사용자 관리 |
| `client.controller.app` | 앱 관리 |
| `client.controller.kiosk` | 키오스크 관리 |
| `client.controller.notify` | 알림 관리 |
| `client.controller.mileage` | 마일리지 관리 |
| `client.controller.breakfast` | 조식 메뉴 관리 |
| `client.controller.reserveAgentConfig` | OTA 연동 설정 |
| `client.controller.customConfig` | 커스텀 설정 |

## 예제: 객실 매출 생성

```typescript
// 객실 매출 생성 (결제 정보 포함)
await client.controller.roomSale.create(accomId, {
  roomId: 'room-123',
  stayType: RoomStayType.HOURS,
  fee: 50000,
  phones: ['010-1234-5678'],
  payments: [
    {
      type: 'CARD',
      amount_paid_creadit_card: 50000,
      payment_date: Date.now(),
    },
  ],
});
```

## 예제: 키오스크 설정

```typescript
// 키오스크 업데이트 (TTS 설정 포함)
await client.controller.kiosk.update(accomId, kioskId, {
  saleState: KioskSaleState.SELLABLE,
  useAdultAuth: true,
  tts: {
    gender: 'FEMALE',
    pitch: 0,
    volume: 0,
    rate: 1,
    kr: {
      greetings: '안녕하세요, 환영합니다.',
      card_payment_success: '결제가 완료되었습니다.',
    },
  },
  receiptPrinter: {
    use: true,
    print_condition: 'WHEN_PRINT_BUTTON_CLICKED',
  },
});
```

## API 문서

자세한 API 문서는 TypeScript 타입 정의를 참고하세요.

## 요구사항

- Node.js >= 18.0.0

## 라이선스

MIT
