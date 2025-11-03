// Environment Configuration
import packageJson from '../../../package.json';

export const ENV = {
    API_BASE_URL: process.env.API_BASE_URL,
    API_BASE_URL_GPS: process.env.API_BASE_URL_GPS,
    API_BASE_UPLOAD: process.env.API_BASE_UPLOAD,
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),

    // Environment
    NODE_ENV: process.env.NODE_ENV,
    DEBUG_MODE: process.env.DEBUG_MODE,
    LOG_LEVEL: process.env.LOG_LEVEL,

    // GPS Configuration
    GPS_UPDATE_INTERVAL: parseInt(process.env.GPS_UPDATE_INTERVAL || '5000', 10),
    GPS_ACCURACY: parseInt(process.env.GPS_ACCURACY || '10', 10),
    GPS_DISTANCE_FILTER: parseInt(process.env.GPS_DISTANCE_FILTER || '5', 10),

    // Feature Flags
    ENABLE_DEBUG_MENU: process.env.ENABLE_DEBUG_MENU,
    ENABLE_LOGGING: process.env.ENABLE_LOGGING,
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,

    // App Configuration
    APP_NAME: process.env.APP_NAME || packageJson.name,
    APP_VERSION: process.env.APP_VERSION || packageJson.version,
    BUILD_NUMBER: process.env.BUILD_NUMBER || '1',

    // App Error/Navigation configs
    CATCH_ERRORS:
      (process.env.CATCH_ERRORS as 'always' | 'dev' | 'prod' | 'never') ||
      'always',
    PERSIST_NAVIGATION:
      (process.env.PERSIST_NAVIGATION as 'always' | 'dev' | 'prod' | 'never') ||
      'never',
  };

  // Helper functions
  export const isDevelopment = () => ENV.NODE_ENV === 'development';
  export const isProduction = () => ENV.NODE_ENV === 'production';
  export const isDebugMode = () => ENV.DEBUG_MODE;

  // Logging configuration based on environment
  export const getLogLevel = () => {
    if (isProduction()) {
      return 'error';
    }
    return ENV.LOG_LEVEL;
  };

  // Get API URLs based on environment
  export const getApiBaseUrl = () => {
    if (isProduction()) {
      // Fallback URLs cho production nếu không có env variables
      return ENV.API_BASE_URL;
    }
    return ENV.API_BASE_URL;
  };

  export const getGpsApiBaseUrl = () => {
    if (isProduction()) {
      return ENV.API_BASE_URL_GPS;
    }
    return ENV.API_BASE_URL_GPS;
  };

  export const getUploadApiBaseUrl = () => {
    if (isProduction()) {
      return ENV.API_BASE_UPLOAD;
    }
    return ENV.API_BASE_UPLOAD;
  };

  export default ENV;
