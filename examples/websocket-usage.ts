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
      
      if (change.changeType === 'update' && change.changedFields.length > 0) {
        console.log(`  - 변경된 필드: ${change.changedFields.join(', ')}`);
        
        // 방법 1: changedFields 배열 직접 사용
        for (const field of change.changedFields) {
          const prevValue = change.previousData?.[field as keyof typeof change.previousData];
          const currValue = change.data?.[field as keyof typeof change.data];
          console.log(`    ${field}: ${JSON.stringify(prevValue)} → ${JSON.stringify(currValue)}`);
        }
        
        // 방법 2: isPropertyChanged 함수 사용 (특정 필드 확인)
        if (isPropertyChanged(change as DocumentChange<Record<string, unknown>>, 'temp')) {
          const { previous, current } = getPropertyChange(
            change as DocumentChange<Record<string, unknown>>,
            'temp'
          );
          console.log(`  ★ 온도 변경: ${previous} → ${current}`);
        }
      }
    });

    // 6. 스냅샷 이벤트 핸들러 (전체 데이터)
    listener.on('snapshot', (args) => {
      if (args.isInitialized) {
        console.log('\n[초기 데이터 수신 완료]');
      }
      console.log(`  - 변경된 문서 수: ${args.changes.length}`);
    });

    // 7. 리스닝 시작
    console.log('\n이벤트 리스닝 시작...');
    listener.listen({
      accomId,
      snapshots: [
        SnapshotFlag.ALL_ROOMS,
        SnapshotFlag.ACTIVATED_ROOM_SALES,
        SnapshotFlag.ALL_DEVICES,
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

main();
