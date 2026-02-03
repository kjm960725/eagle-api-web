/**
 * EagleApi 기본 사용 예제
 *
 * 실행: npx tsx examples/basic-usage.ts
 */

import { EagleApiClient, consoleLogger } from '../src/index.js';
import { RoomStayType } from '../src/types/enums.js';

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

    // ========================================
    // 객실 관리
    // ========================================

    // 4. 모든 객실 조회
    const rooms = await client.controller.room.getAllByAccom(accomId);
    console.log(`\n=== 객실 목록 (${rooms.length}개) ===`);

    for (const room of rooms) {
      console.log(`  - ${room.data.display_name} (Gid:${room.data.gid}, Lid:${room.data.lid})`);
      console.log(`    온도: ${room.data.temp}°C, 설정온도: ${room.data.set_temp}°C`);
      console.log(`    상태: ${room.data.state_summary}, 키: ${room.data.key}`);
    }

    // 5. 객실 업데이트
    if (rooms.length > 0) {
      const firstRoom = rooms[0];
      if (firstRoom) {
        console.log(`\n객실 ${firstRoom.data.display_name} 업데이트 중...`);

        await client.controller.room.update(accomId, firstRoom.id, {
          temp: 25,
          setTemp: 24,
        });

        console.log('객실 업데이트 완료!');
      }
    }

    // ========================================
    // 객실 유형 관리
    // ========================================

    // 6. 객실 유형 조회
    const roomTypes = await client.controller.roomType.getAllByAccom(accomId);
    console.log(`\n=== 객실 유형 (${roomTypes.length}개) ===`);

    for (const roomType of roomTypes) {
      console.log(`  - ${roomType.data.display_name}`);
      console.log(`    대실: ${roomType.data.hours_price}원, 숙박: ${roomType.data.days_price}원`);
    }

    // ========================================
    // 매출 관리
    // ========================================

    // 7. 현재 입실 중인 매출 조회
    const activeSales = await client.controller.roomSale.getAllActivated(accomId);
    console.log(`\n=== 현재 입실 중 (${activeSales.length}개) ===`);

    for (const sale of activeSales) {
      console.log(`  - 객실 ID: ${sale.data.room_id}`);
      console.log(`    요금: ${sale.data.fee}원, 이용유형: ${sale.data.stay_type}`);
      console.log(`    전화번호: ${sale.data.phones.join(', ') || '없음'}`);
    }

    // 8. 매출 생성 예시 (주석 처리)
    /*
    if (rooms.length > 0) {
      const firstRoom = rooms[0];
      if (firstRoom) {
        const { roomSale } = await client.controller.roomSale.create(accomId, {
          roomId: firstRoom.id,
          stayType: RoomStayType.HOURS,
          fee: 50000,
          phones: ['010-1234-5678'],
          personCount: 2,
          payments: [
            {
              type: 'CARD',
              amount_paid_creadit_card: 50000,
              payment_date: Date.now(),
            },
          ],
        });

        console.log(`\n매출 생성됨: ${roomSale?.id}`);
      }
    }
    */

    // ========================================
    // 예약 관리
    // ========================================

    // 9. 예약 목록 조회
    const { roomReserves } = await client.controller.roomReserve.search(accomId, {
      limit: 10,
      startAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7일 전부터
    });
    console.log(`\n=== 최근 예약 (${roomReserves.length}개) ===`);

    for (const reserve of roomReserves) {
      console.log(`  - ${reserve.data.name || '이름없음'} (${reserve.data.phone || '번호없음'})`);
      console.log(`    예약번호: ${reserve.data.reserve_no || '없음'}`);
    }

    // ========================================
    // 키오스크 관리
    // ========================================

    // 10. 키오스크 목록 조회
    const kiosks = await client.controller.kiosk.getAllByAccom(accomId);
    console.log(`\n=== 키오스크 (${kiosks.length}개) ===`);

    for (const kiosk of kiosks) {
      console.log(`  - 디바이스 ID: ${kiosk.data.device_id}`);
      console.log(`    유형: ${kiosk.data.type}, 상태: ${kiosk.data.sale_state}`);
      console.log(`    성인인증: ${kiosk.data.use_adult_auth ? '사용' : '미사용'}`);
    }

    // ========================================
    // 도어락 관리
    // ========================================

    // 11. 도어락 목록 조회
    const doorLocks = await client.controller.doorLock.getAllByAccom(accomId);
    console.log(`\n=== 도어락 (${doorLocks.length}개) ===`);

    for (const doorLock of doorLocks) {
      console.log(`  - 객실: ${doorLock.data.room_id}`);
      console.log(`    제조사: ${doorLock.data.vender}`);
    }

    console.log('\n모든 조회 완료!');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main();
