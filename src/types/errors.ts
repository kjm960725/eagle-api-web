/**
 * EagleApi 에러 코드
 */
export const ApiErrorCode = {
  // 인증 에러
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // 네트워크 에러
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // 응답 에러
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  PARSE_ERROR: 'PARSE_ERROR',
  
  // HTTP 에러
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // WebSocket 에러
  WEBSOCKET_ERROR: 'WEBSOCKET_ERROR',
  WEBSOCKET_CLOSED: 'WEBSOCKET_CLOSED',
  PROTOCOL_ERROR: 'PROTOCOL_ERROR',
  
  // 일반 에러
  UNKNOWN: 'UNKNOWN',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/**
 * API 에러 상세 정보
 */
export interface ApiErrorDetail {
  code: ApiErrorCode;
  message: string;
  statusCode?: number | undefined;
  cause?: Error | undefined;
  context?: Record<string, unknown> | undefined;
}

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode?: number;
  readonly cause?: Error;
  readonly context?: Record<string, unknown>;

  constructor(detail: ApiErrorDetail) {
    super(detail.message);
    this.name = 'ApiError';
    this.code = detail.code;
    this.statusCode = detail.statusCode;
    this.cause = detail.cause;
    this.context = detail.context;

    // V8 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * 에러를 JSON으로 직렬화
   */
  toJSON(): ApiErrorDetail {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }

  /**
   * 에러인지 타입 가드
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

/**
 * 에러 팩토리 함수
 */
export const Errors = {
  authFailed: (message: string = '인증에 실패했습니다'): ApiError =>
    new ApiError({ code: ApiErrorCode.AUTH_FAILED, message }),

  tokenExpired: (): ApiError =>
    new ApiError({ code: ApiErrorCode.TOKEN_EXPIRED, message: '토큰이 만료되었습니다' }),

  networkError: (cause?: Error): ApiError =>
    new ApiError({
      code: ApiErrorCode.NETWORK_ERROR,
      message: '네트워크 오류가 발생했습니다',
      cause,
    }),

  timeout: (timeoutMs: number): ApiError =>
    new ApiError({
      code: ApiErrorCode.TIMEOUT,
      message: `요청 시간이 초과되었습니다 (${timeoutMs}ms)`,
      context: { timeoutMs },
    }),

  invalidResponse: (message: string = '잘못된 응답 형식입니다'): ApiError =>
    new ApiError({ code: ApiErrorCode.INVALID_RESPONSE, message }),

  parseError: (cause?: Error): ApiError =>
    new ApiError({
      code: ApiErrorCode.PARSE_ERROR,
      message: 'JSON 파싱에 실패했습니다',
      cause,
    }),

  httpError: (statusCode: number, message?: string): ApiError => {
    let code: ApiErrorCode;
    let defaultMessage: string;

    if (statusCode === 400) {
      code = ApiErrorCode.BAD_REQUEST;
      defaultMessage = '잘못된 요청입니다';
    } else if (statusCode === 404) {
      code = ApiErrorCode.NOT_FOUND;
      defaultMessage = '리소스를 찾을 수 없습니다';
    } else if (statusCode >= 500) {
      code = ApiErrorCode.SERVER_ERROR;
      defaultMessage = '서버 오류가 발생했습니다';
    } else {
      code = ApiErrorCode.UNKNOWN;
      defaultMessage = `HTTP 오류: ${statusCode}`;
    }

    return new ApiError({
      code,
      message: message ?? defaultMessage,
      statusCode,
    });
  },

  websocketError: (message: string, cause?: Error): ApiError =>
    new ApiError({
      code: ApiErrorCode.WEBSOCKET_ERROR,
      message,
      cause,
    }),

  protocolError: (message: string): ApiError =>
    new ApiError({ code: ApiErrorCode.PROTOCOL_ERROR, message }),
} as const;
