/**
 * Utility para logging condicional
 * Los logs se muestran solo en desarrollo o cuando NEXT_PUBLIC_ENABLE_LOGGING=true
 */

const isLoggingEnabled = (): boolean => {
  // Verificar si estamos en desarrollo
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // En producción, verificar la variable de entorno específica
  return process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
};

export const logger = {
  log: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Los errores siempre se muestran, incluso en producción
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.debug(...args);
    }
  }
};

// Shortcuts para casos específicos de Firebase
export const firebaseLogger = {
  auth: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.log('🔥', ...args);
    }
  },
  
  success: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.log('✅', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Los errores siempre se muestran
    console.error('❌', ...args);
  }
};
