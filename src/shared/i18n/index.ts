import i18n from 'i18next';
import {I18nManager} from 'react-native';
import {initReactI18next} from 'react-i18next';
import 'intl-pluralrules';
import {getLocales} from 'react-native-localize';

import vi, {Translations} from './vi';
import en from './en';
import * as storage from '@store/index';
import KeyStoreData from '@store/KeyStoreData';

const fallbackLocale = 'en';

const systemLocales = (() => {
  try {
    return typeof getLocales === 'function' ? getLocales() : [];
  } catch {
    return [];
  }
})();

const resources = {
  vi: {translation: vi},
  en: {translation: en},
};
const supportedTags = Object.keys(resources);

const systemTagMatchesSupportedTags = (deviceTag: string) => {
  const primaryTag = deviceTag.split('-')[0];
  return supportedTags.includes(primaryTag);
};

const pickSupportedLocale = () => {
  return systemLocales.find(locale =>
    systemTagMatchesSupportedTags(locale.languageTag),
  );
};

// Hàm để lấy ngôn ngữ đã lưu hoặc phát hiện từ hệ thống
const getInitialLanguage = (): string => {
  // Kiểm tra xem có ngôn ngữ đã lưu không
  const savedLanguage = storage.loadString(KeyStoreData.LANGUAGE);
  if (savedLanguage && supportedTags.includes(savedLanguage)) {
    return savedLanguage;
  }

  // Nếu chưa có ngôn ngữ đã lưu, phát hiện từ hệ thống
  const systemLocale = pickSupportedLocale();
  if (systemLocale && systemTagMatchesSupportedTags(systemLocale.languageTag)) {
    const detectedLanguage = systemLocale.languageTag.split('-')[0];
    return detectedLanguage;
  }

  // Fallback về tiếng Anh nếu không phát hiện được
  return fallbackLocale;
};

// Hàm để lưu ngôn ngữ được chọn
export const saveLanguage = (language: string): boolean => {
  if (supportedTags.includes(language)) {
    return storage.saveString(KeyStoreData.LANGUAGE, language);
  }
  return false;
};

// Hàm để lấy ngôn ngữ hiện tại đã lưu
export const getSavedLanguage = (): string | null => {
  const savedLanguage = storage.loadString(KeyStoreData.LANGUAGE);
  return savedLanguage && supportedTags.includes(savedLanguage)
    ? savedLanguage
    : null;
};

const initialLanguage = getInitialLanguage();
const locale = {languageTag: initialLanguage, isRTL: false} as any;

export let isRTL = false;

if (locale?.languageTag && locale?.isRTL) {
  I18nManager.allowRTL(true);
  isRTL = true;
} else {
  I18nManager.allowRTL(false);
}

export const initI18n = async () => {
  i18n.use(initReactI18next);

  const languageToUse = locale?.languageTag ?? fallbackLocale;

  await i18n.init({
    resources,
    lng: languageToUse,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  });

  // Lưu ngôn ngữ ban đầu nếu chưa có ngôn ngữ nào được lưu
  const savedLanguage = storage.loadString(KeyStoreData.LANGUAGE);
  if (!savedLanguage) {
    saveLanguage(languageToUse);
  }

  return i18n;
};

export type TxKeyPath = RecursiveKeyOf<Translations>;

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`,
    true
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`,
    false
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
  ? IsFirstLevel extends true
    ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
    : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
  : Text;
