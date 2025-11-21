// Jest setup file
// Note: @testing-library/jest-native is deprecated, but matchers are built-in to @testing-library/react-native v12.4+

// Mock React Native modules
// Note: NativeAnimatedHelper may not exist in all React Native versions, so we'll skip this mock

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((x) => x),
    Directions: {},
  };
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve()),
  getGenericPassword: jest.fn(() => Promise.resolve({ password: 'test-token' })),
  resetGenericPassword: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-mmkv
const mockStorage = {
  set: jest.fn(),
  getString: jest.fn(() => null),
  getNumber: jest.fn(() => null),
  getBoolean: jest.fn(() => false),
  contains: jest.fn(() => false),
  delete: jest.fn(),
  clearAll: jest.fn(),
};

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => mockStorage),
}));

// Mock storage module
jest.mock('@store/index', () => ({
  loadString: jest.fn(() => null),
  saveString: jest.fn(() => true),
  load: jest.fn(() => null),
  save: jest.fn(() => true),
  remove: jest.fn(),
  clear: jest.fn(),
  loadBool: jest.fn(() => undefined),
  saveBool: jest.fn(() => true),
  getBool: jest.fn(() => true),
  setBool: jest.fn(),
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => Promise.resolve('1.0.0')),
  getBuildNumber: jest.fn(() => Promise.resolve('1')),
  getDeviceId: jest.fn(() => Promise.resolve('test-device-id')),
}));


// Mock react-native-netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    __esModule: true,
    default: View,
  };
});

// Mock i18next
jest.mock('i18next', () => ({
  changeLanguage: jest.fn(() => Promise.resolve()),
  language: 'vi',
  t: (key) => key,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(() => Promise.resolve()),
      language: 'vi',
    },
  }),
  initReactI18next: {
    type: 'languageDetector',
    init: jest.fn(),
  },
}));

// Mock i18n module
jest.mock('@shared/i18n', () => ({
  isRTL: false,
  getSavedLanguage: jest.fn(() => 'vi'),
  saveLanguage: jest.fn(() => true),
  getInitialLanguage: jest.fn(() => 'vi'),
}));

// Mock react-native-localize getLocales
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [{ languageTag: 'vi-VN', languageCode: 'vi', countryCode: 'VN' }]),
  getCountry: jest.fn(() => 'VN'),
  getCurrencies: jest.fn(() => ['VND']),
  getTimeZone: jest.fn(() => 'Asia/Ho_Chi_Minh'),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

