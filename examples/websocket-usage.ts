/**
 * EagleApi WebSocket 이벤트 리스너 사용 예제
 *
 * 실행: npx tsx examples/websocket-usage.ts
 */

import {
  EagleApiClient,
  consoleLogger,
  SnapshotFlag,
  isPropertyChanged,
  getPropertyChange,
  type DocumentChange,
  type ListenerState,
} from '../src/index.js';
import { CollectionName } from '../src/types/constants.js';

async function main() {
  // 1. 클라이언트 생성
  const client = new EagleApiClient({
    appId: 'your-app-id',
    logger: consoleLogger,
  });

  try {
    // 2. 디바이스로 인증
    await client.authForDevice('AA:BB:CC:DD:EE:FF');
    console.log('인증 성공!');

    const accomId = client.authedDevice?.data?.accom_id;
    if (!accomId) {
      throw new Error('업소 ID를 찾을 수 없습니다');
    }

    // 3. 이벤트 리스너 생성
    const listener = client.createEventListener();

    // 4. 상태 변경 이벤트 핸들러
    listener.on('stateChanged', (state: ListenerState) => {
      console.log('\n[상태 변경]');
      console.log(`  - 리스닝: ${state.isListening}`);
      console.log(`  - 연결됨: ${state.isConnected}`);
      console.log(`  - 에러: ${state.isError}`);
      if (state.errorMessage) {
        console.log(`  - 메시지: ${state.errorMessage}`);
      }
      if (state.reconnectAttempts > 0) {
        console.log(`  - 재연결 시도: ${state.reconnectAttempts}회`);
      }
    });

    // 5. 문서 변경 이벤트 핸들러 (핵심!)
    listener.on('documentChanged', (change: DocumentChange) => {
      console.log('\n[문서 변경]');
      console.log(`  - 컬렉션: ${change.collectionName}`);
      console.log(`  - ID: ${change.id}`);
      console.log(`  - 유형: ${change.changeType}`);

      // 컬렉션별 처리
      switch (change.collectionName) {
        case CollectionName.ROOM:
          handleRoomChange(change);
          break;
        case CollectionName.ROOM_SALE:
          handleRoomSaleChange(change);
          break;
        case CollectionName.DEVICE:
          handleDeviceChange(change);
          break;
        default:
          handleGenericChange(change);
      }
    });

    // 6. 스냅샷 이벤트 핸들러 (전체 데이터)
    listener.on('snapshot', (args) => {
      if (args.isInitialized) {
        console.log('\n[초기 데이터 수신 완료]');
        console.log(`  - 수신된 문서 수: ${args.changes.length}`);

        // 컬렉션별 문서 수 집계
        const countByCollection: Record<string, number> = {};
        for (const change of args.changes) {
          countByCollection[change.collectionName] = (countByCollection[change.collectionName] || 0) + 1;
        }

        for (const [collection, count] of Object.entries(countByCollection)) {
          console.log(`    - ${collection}: ${count}개`);
        }
      }
    });

    // 7. 리스닝 시작
    console.log('\n이벤트 리스닝 시작...');
    listener.listen({
      accomId,
      snapshots: [
        SnapshotFlag.ALL_ROOMS,
        SnapshotFlag.ACTIVATED_ROOM_SALES,
        SnapshotFlag.ALL_DEVICES,
        SnapshotFlag.ALL_ROOM_TYPES,
        SnapshotFlag.ALL_DOOR_LOCKS,
        SnapshotFlag.ALL_KIOSKS,
        SnapshotFlag.ALL_ROOM_RESERVES,
      ],
      ignoreOwnChanges: true, // 자신의 변경은 무시
    });

    // 8. 초기 스냅샷 수신 대기
    const initialized = await listener.waitForInitialized(30000);
    if (!initialized) {
      throw new Error('초기 데이터 수신 타임아웃');
    }

    console.log('\n초기화 완료! 실시간 이벤트 대기 중...');
    console.log('(Ctrl+C로 종료)\n');

    // 무한 대기 (이벤트 수신)
    await new Promise(() => {});
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

/**
 * 객실 변경 처리
 */
function handleRoomChange(change: DocumentChange) {
  if (change.changeType === 'update' && change.changedFields.length > 0) {
    console.log(`  - 변경된 필드: ${change.changedFields.join(', ')}`);

    // 온도 변경 감지
    if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'temp')) {
      const { previous, current } = getPropertyChange(
        change as DocumentChange<Record<string, unknown>>,
        'temp'
      );
      console.log(`  ★ 온도 변경: ${previous}°C → ${current}°C`);
    }

    // 설정 온도 변경 감지
    if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'set_temp')) {
      const { previous, current } = getPropertyChange(
        change as DocumentChange<Record<string, unknown>>,
        'set_temp'
      );
      console.log(`  ★ 설정온도 변경: ${previous}°C → ${current}°C`);
    }

    // 객실 상태 변경 감지
    if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'state_summary')) {
      const { previous, current } = getPropertyChange(
        change as DocumentChange<Record<string, unknown>>,
        'state_summary'
      );
      console.log(`  ★ 객실상태 변경: ${previous} → ${current}`);
    }
  }
}

/**
 * 매출 변경 처리
 */
function handleRoomSaleChange(change: DocumentChange) {
  if (change.changeType === 'create') {
    const data = change.data as Record<string, unknown>;
    console.log(`  ★ 새 매출 발생!`);
    console.log(`    - 객실: ${data['room_id']}`);
    console.log(`    - 요금: ${data['fee']}원`);
    console.log(`    - 이용유형: ${data['stay_type']}`);
    const phones = data['phones'] as string[] | undefined;
    if (phones && phones.length > 0) {
      console.log(`    - 전화번호: ${phones.join(', ')}`);
    }
  } else if (change.changeType === 'update') {
    // 퇴실 감지 (activate: true → false)
    if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'activate')) {
      const { previous, current } = getPropertyChange(
        change as DocumentChange<Record<string, unknown>>,
        'activate'
      );
      if (previous === true && current === false) {
        console.log(`  ★ 퇴실 완료!`);
      }
    }

    // 결제 추가 감지
    if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'payments')) {
      console.log(`  ★ 결제 정보 변경!`);
    }
  }
}

/**
 * 디바이스 변경 처리
 */
function handleDeviceChange(change: DocumentChange) {
  if (change.changeType === 'update' && change.changedFields.length > 0) {
    // 디바이스 온라인/오프라인 감지
    if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'is_online')) {
      const { previous, current } = getPropertyChange(
        change as DocumentChange<Record<string, unknown>>,
        'is_online'
      );
      const status = current ? '온라인' : '오프라인';
      console.log(`  ★ 디바이스 ${status}!`);
    }
  }
}

/**
 * 일반 변경 처리
 */
function handleGenericChange(change: DocumentChange) {
  if (change.changeType === 'update' && change.changedFields.length > 0) {
    console.log(`  - 변경된 필드: ${change.changedFields.join(', ')}`);

    for (const field of change.changedFields) {
      const prevValue = change.previousData?.[field as keyof typeof change.previousData];
      const currValue = change.data?.[field as keyof typeof change.data];
      console.log(`    ${field}: ${JSON.stringify(prevValue)} → ${JSON.stringify(currValue)}`);
    }
  }
}

main();
