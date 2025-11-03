import {StatusBar} from 'react-native';
import type {Theme} from './types';

export const setSystemUIBackgroundColor = (color: string, isDark?: boolean) => {
  StatusBar.setBackgroundColor?.(color);
  StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
};

export const setImperativeTheming = (theme: Theme) => {
  setSystemUIBackgroundColor(theme.colors.background, theme.isDark);
};
