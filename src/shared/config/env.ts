// Environment Configuration
import packageJson from '../../../package.json';
import {
  API_BASE_URL,
  API_BASE_URL_PORTAL,
  API_VERSION,
  API_TIMEOUT,
  NODE_ENV,
  DEBUG_MODE,
  APP_VERSION,
  BUILD_NUMBER,
  CATCH_ERRORS,
  PERSIST_NAVIGATION,
} from '@env';

export const ENV = {
    // API Configuration
    API_BASE_URL: API_BASE_URL,
    API_BASE_URL_PORTAL: API_BASE_URL_PORTAL,
    API_VERSION: API_VERSION,
    API_TIMEOUT: parseInt(API_TIMEOUT || '30000', 10),

    // Environment
    NODE_ENV: NODE_ENV,
    DEBUG_MODE: DEBUG_MODE,

    // App Configuration
    APP_VERSION: APP_VERSION || packageJson.version,
    BUILD_NUMBER: BUILD_NUMBER || '1',

    // App Error/Navigation configs
    CATCH_ERRORS:
      (CATCH_ERRORS as 'always' | 'dev' | 'prod' | 'never') ||
      'always',
    PERSIST_NAVIGATION:
      (PERSIST_NAVIGATION as 'always' | 'dev' | 'prod' | 'never') ||
      'never',
  };

  // Helper functions
  export const isProduction = () => NODE_ENV === 'production';
  export const isDebugMode = () => DEBUG_MODE;

  // Logging configuration based on environment
  export const getLogLevel = () => {
    if (isProduction()) {
      return 'error';
    }
    return 'debug';
  };

  // Get API URLs based on environment
  export const getApiBaseUrl = () => ENV.API_BASE_URL;
  
  export const getPortalApiBaseUrl = () => ENV.API_BASE_URL_PORTAL;

  export default ENV;
