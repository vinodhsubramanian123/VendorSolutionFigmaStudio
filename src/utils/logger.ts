export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LogLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// In Vite, import.meta.env is used. If we are in a non-Vite env (like plain node or test), default to 'info'.
const currentLevel: LogLevel = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LOG_LEVEL as LogLevel) 
  || 'info';

export const logger = {
  debug: (message: string, ...optionalParams: unknown[]) => {
    if (LogLevels[currentLevel] <= LogLevels.debug) {
      console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
  },
  info: (message: string, ...optionalParams: unknown[]) => {
    if (LogLevels[currentLevel] <= LogLevels.info) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    if (LogLevels[currentLevel] <= LogLevels.warn) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    if (LogLevels[currentLevel] <= LogLevels.error) {
      console.error(`[ERROR] ${message}`, ...optionalParams);
    }
  },
};
