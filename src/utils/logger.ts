/**
 * Utility para logging condicional
 * Los logs se muestran solo en desarrollo o cuando NEXT_PUBLIC_ENABLE_LOGGING=true
 */

// Tipo para valores que pueden ser loggeados de forma segura
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggableValue = string | number | boolean | null | undefined | object | Error | any;

const isLoggingEnabled = (): boolean => {
  // Verificar si estamos en desarrollo
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // En producción, verificar la variable de entorno específica
  return process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
};

export const logger = {
  log: (...args: LoggableValue[]) => {
    if (isLoggingEnabled()) {
      console.log(...args);
    }
  },
  
  warn: (...args: LoggableValue[]) => {
    if (isLoggingEnabled()) {
      console.warn(...args);
    }
  },
  
  error: (...args: LoggableValue[]) => {
    // Los errores siempre se muestran, incluso en producción
    console.error(...args);
  },
  
  info: (...args: LoggableValue[]) => {
    if (isLoggingEnabled()) {
      console.info(...args);
    }
  },
  
  debug: (...args: LoggableValue[]) => {
    if (isLoggingEnabled()) {
      console.debug(...args);
    }
  }
};

// Shortcuts para casos específicos de Firebase
export const firebaseLogger = {
  auth: (...args: LoggableValue[]) => {
    if (isLoggingEnabled()) {
      console.log('🔥', ...args);
    }
  },
  
  success: (...args: LoggableValue[]) => {
    if (isLoggingEnabled()) {
      console.log('✅', ...args);
    }
  },
  
  error: (...args: LoggableValue[]) => {
    // Los errores siempre se muestran
    console.error('❌', ...args);
  },
  
  // Helper para mostrar un resumen conciso cuando no estamos en debug mode
  summary: (message: string, details?: object) => {
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      console.log('📊', message, details);
    } else if (isLoggingEnabled()) {
      console.log('📊', message);
    }
  }
};