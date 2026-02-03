/**
 * 로거 인터페이스
 * console과 호환되는 최소 인터페이스
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * 아무것도 출력하지 않는 Null 로거
 */
export const nullLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

/**
 * 콘솔 로거 (기본값)
 */
export const consoleLogger: Logger = {
  debug: (message, ...args) => console.debug(`[EagleApi] ${message}`, ...args),
  info: (message, ...args) => console.info(`[EagleApi] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[EagleApi] ${message}`, ...args),
  error: (message, ...args) => console.error(`[EagleApi] ${message}`, ...args),
};

/**
 * API 클라이언트 설정
 */
export interface EagleApiConfig {
  /** 앱 ID (필수) */
  appId: string;

  /** API 기본 URL (기본값: https://api.icrew.cloud) */
  baseUrl?: string;

  /** 요청 타임아웃 (밀리초, 기본값: 30000) */
  timeout?: number;

  /** 로거 (기본값: nullLogger) */
  logger?: Logger;

  /** 스테이징 서버 사용 여부 (기본값: false) */
  useStaging?: boolean;
}

/**
 * 설정 기본값
 */
export const DEFAULT_CONFIG = {
  baseUrl: 'https://api.icrew.cloud',
  stagingBaseUrl: 'https://api.staging.icrew.cloud',
  timeout: 30000,
} as const;

/**
 * 설정을 병합하여 완전한 설정 객체 생성
 */
export function resolveConfig(config: EagleApiConfig): Required<Omit<EagleApiConfig, 'useStaging'>> & { baseUrl: string } {
  const baseUrl = config.useStaging
    ? DEFAULT_CONFIG.stagingBaseUrl
    : (config.baseUrl ?? DEFAULT_CONFIG.baseUrl);

  return {
    appId: config.appId,
    baseUrl,
    timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    logger: config.logger ?? nullLogger,
  };
}
