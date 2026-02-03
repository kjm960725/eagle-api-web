/**
 * REST API 스냅샷 이벤트 인자
 */
export interface ClientSnapshotEventArgs {
  /** 요청 경로 */
  requestPath: string;
  /** 요청 메서드 */
  requestMethod: string;
  /** 응답 JSON */
  responseJson: Record<string, unknown>;
}

/**
 * WebSocket 리스너 상태
 */
export interface ListenerState {
  /** 리스닝 중 여부 */
  isListening: boolean;
  /** 소켓 연결 여부 */
  isConnected: boolean;
  /** 에러 발생 여부 */
  isError: boolean;
  /** 에러 메시지 */
  errorMessage: string;
}

/**
 * WebSocket 스냅샷 이벤트 인자
 */
export interface ListenerSnapshotEventArgs {
  /** 초기화 완료 여부 */
  isInitialized: boolean;
  /** 응답 JSON */
  responseJson: Record<string, unknown>;
}

/**
 * REST API 클라이언트 이벤트
 */
export interface RestApiClientEvents {
  /** 스냅샷 수신 */
  snapshot: (args: ClientSnapshotEventArgs) => void;
}

/**
 * WebSocket 리스너 이벤트
 */
export interface EventListenerClientEvents {
  /** 상태 변경 */
  stateChanged: (state: ListenerState) => void;
  /** 스냅샷 수신 */
  snapshot: (args: ListenerSnapshotEventArgs) => void;
}
