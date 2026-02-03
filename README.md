# @kjm960725/eagle-api

iCrew Cloud API를 위한 TypeScript/JavaScript 클라이언트 라이브러리입니다.

## 특징

- TypeScript로 작성된 완전한 타입 지원
- REST API 및 WebSocket 실시간 이벤트 지원
- ESM 및 CommonJS 모듈 지원
- Node.js 및 브라우저 환경 지원

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

- `client.controller.room` - 객실 관리
- `client.controller.device` - 디바이스 관리
- `client.controller.accom` - 업소 관리
- `client.controller.user` - 사용자 관리

## API 문서

자세한 API 문서는 TypeScript 타입 정의를 참고하세요.

## 요구사항

- Node.js >= 18.0.0

## 라이선스

MIT
