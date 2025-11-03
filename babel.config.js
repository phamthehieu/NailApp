module.exports = {
  presets: ['module:@react-native/babel-preset'],
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
    'react-native-reanimated/plugin'
  ],
};
