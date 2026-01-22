const envName = process.env.NODE_ENV || 'development';
const envPath = envName === 'production' ? '.env.production' : '.env.development';
const isProduction = envName === 'production';

module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        // Tắt React Refresh runtime trong production
        unstable_transformProfile: isProduction ? 'hermes-stable' : 'default',
      },
    ],
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.ts', '.tsx'],
        alias: {
          '@': './src',
          '@features': './src/features',
          '@app': './src/app',
          '@assets': './src/assets',
          '@services': './src/services',
          '@shared': './src/shared',
          '@store': './src/store',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: envPath,
        safe: false,
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin'
  ],
};
