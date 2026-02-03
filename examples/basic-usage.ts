/**
 * EagleApi 기본 사용 예제
 * 
 * 실행: npx tsx examples/basic-usage.ts
 */

import { EagleApiClient, consoleLogger } from '../src/index.js';

async function main() {
  // 1. 클라이언트 생성
  const client = new EagleApiClient({
    appId: 'your-app-id',
    logger: consoleLogger, // 로그 출력 활성화
    // useStaging: true, // 스테이징 서버 사용 시
  });

  try {
    // 2. 디바이스로 인증
    await client.authForDevice('AA:BB:CC:DD:EE:FF');
    
    console.log('인증 성공!');
    console.log('인증된 디바이스:', client.authedDevice?.data?.display_name);
    
    // 3. 업소 ID 가져오기
    const accomId = client.authedDevice?.data?.accom_id;
    if (!accomId) {
      throw new Error('업소 ID를 찾을 수 없습니다');
    }
    
    // 4. 모든 객실 조회
    const rooms = await client.controller.room.getAllByAccom(accomId);
    console.log(`\n총 ${rooms.length}개 객실:`);
    
    for (const room of rooms) {
      console.log(`  - ${room.data.display_name} (Gid:${room.data.gid}, Lid:${room.data.lid})`);
      console.log(`    온도: ${room.data.temp}°C, 설정온도: ${room.data.set_temp}°C`);
      console.log(`    상태: ${room.data.state_summary}, 키: ${room.data.key}`);
    }
    
    // 5. 첫 번째 객실 업데이트 (예시)
    if (rooms.length > 0) {
      const firstRoom = rooms[0];
      if (firstRoom) {
        console.log(`\n객실 ${firstRoom.data.display_name} 업데이트 중...`);
        
        await client.controller.room.update(accomId, firstRoom.id, {
          temp: 25,
          setTemp: 24,
        });
        
        console.log('업데이트 완료!');
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main();
