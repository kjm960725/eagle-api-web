/**
 * WebSocket 테스트 스크립트
 * ACCOM, ALL_ROOMS 구독 후 변경 이벤트 출력
 */

import {
  EagleApiClient,
  consoleLogger,
  SnapshotFlag,
  isPropertyChanged,
  type DocumentChange,
} from './src/index.js';

const APP_ID = 'm0uzYZKVRP3emL3tVB4Z';
const MAC_ADDRESS = '00:1C:42:DB:39:6B';

async function main() {
  console.log('=== WebSocket 테스트 시작 ===\n');

  // 1. 클라이언트 생성
  const client = new EagleApiClient({
    appId: APP_ID,
    logger: consoleLogger,
  });

  try {
    // 2. 디바이스 인증
    console.log('[1] 디바이스 인증 중...');
    await client.authForDevice(MAC_ADDRESS);
    
    console.log('[1] 인증 성공!');
    
    const device = client.authedDevice;
    if (!device) {
      console.error('인증된 디바이스 정보를 찾을 수 없습니다.');
      return;
    }
    
    const accomId = device.data.accom_id;
    console.log(`    - accom_id: ${accomId}`);
    console.log(`    - device_id: ${device.id}`);
    
    if (!accomId) {
      console.error('accom_id를 찾을 수 없습니다.');
      return;
    }

    // 3. EventListener 생성
    console.log('\n[2] WebSocket 연결 중...');
    const listener = client.createEventListener();

    // 4. 상태 변경 이벤트
    listener.on('stateChanged', (state) => {
      console.log(`\n[상태] isConnected=${state.isConnected}, isListening=${state.isListening}`);
      if (state.error) {
        console.log(`  에러: ${state.error}`);
      }
    });

    // 5. 스냅샷 이벤트 (초기 데이터)
    listener.on('snapshot', (event) => {
      console.log('\n[스냅샷 수신]');
      console.log(`  - isInitialized: ${event.isInitialized}`);
      
      if (event.data && typeof event.data === 'object') {
        console.log(`  - 컬렉션 수: ${Object.keys(event.data).length}`);
        
        for (const [collName, docs] of Object.entries(event.data)) {
          if (docs && typeof docs === 'object') {
            console.log(`  - ${collName}: ${Object.keys(docs as object).length}개 문서`);
          }
        }
      } else {
        console.log('  - 데이터 없음');
      }
    });

    // 6. 문서 변경 이벤트 (핵심!)
    listener.on('documentChanged', (change: DocumentChange) => {
      console.log('\n' + '='.repeat(60));
      console.log('[문서 변경 감지]');
      console.log(`  컬렉션: ${change.collectionName}`);
      console.log(`  문서 ID: ${change.id}`);
      console.log(`  변경 유형: ${change.changeType}`);
      console.log(`  update_time: ${change.updateTime}`);

      if (change.changeType === 'add') {
        console.log('\n  ★ 새 문서 추가됨');
        console.log(`  데이터: ${JSON.stringify(change.data, null, 2)}`);
      } else if (change.changeType === 'remove') {
        console.log('\n  ★ 문서 삭제됨');
      } else if (change.changeType === 'update') {
        console.log('\n  ★ 변경된 필드 목록:');
        
        if (change.changedFields.length === 0) {
          console.log('    (변경된 필드 없음 - updateTime만 변경)');
        } else {
          for (const field of change.changedFields) {
            const prevValue = (change.previousData as Record<string, unknown>)?.[field];
            const currValue = (change.data as Record<string, unknown>)?.[field];
            console.log(`    - ${field}:`);
            console.log(`        이전: ${JSON.stringify(prevValue)}`);
            console.log(`        현재: ${JSON.stringify(currValue)}`);
          }
        }
      }
      console.log('='.repeat(60));
    });

    // 7. 연결 및 구독 시작
    console.log('\n[3] 구독 시작: ACCOM, ALL_ROOMS');
    listener.listen({
      accomId,
      snapshots: [SnapshotFlag.ACCOM, SnapshotFlag.ALL_ROOMS],
      ignoreOwnChanges: false,
    });

    // 8. 초기화 대기
    console.log('[4] 스냅샷 초기화 대기 중...');
    await listener.waitForInitialized(30000);
    console.log('[4] 초기화 완료!\n');

    console.log('>>> 이벤트 수신 대기 중... (Ctrl+C로 종료)');
    console.log('>>> 서버에서 Room 데이터를 변경하면 여기에 표시됩니다.\n');

    // 무한 대기 (Ctrl+C로 종료)
    await new Promise(() => {});

  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main().catch(console.error);
