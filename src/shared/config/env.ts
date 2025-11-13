// Environment Configuration
import packageJson from '../../../package.json';

export const ENV = {
    // API Configuration
    API_BASE_URL: process.env.API_BASE_URL,
    API_BASE_URL_PORTAL: process.env.API_BASE_URL_PORTAL,
    API_VERSION: process.env.API_VERSION,
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),

    // Environment
    NODE_ENV: process.env.NODE_ENV,
    DEBUG_MODE: process.env.DEBUG_MODE,

    // App Configuration
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
  export const isProduction = () => process.env.NODE_ENV === 'production';
  export const isDebugMode = () => process.env.DEBUG_MODE;

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
