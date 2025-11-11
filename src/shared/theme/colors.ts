import { sharedColors } from './colors.shared';

export const colors = {
  background: '#F6F8FA',
  text: '#000000',
  card: '#FFFFFF',
  border: '#404756',
  placeholderTextColor: '#999999',
  error: '#EF4444',
  primary: '#1D61E7',
  yellow: '#EFBF09',
  black: '#000000',
  white: '#FFFFFF',
  headerBackground: '#FFFFFF',
  borderTable: '#e0e0e0',
  backgroundTable: '#f5f5f5',
  bottomColor: "#e0e0e0",
  backgroundDisabled: "#e0e0e0",
  blue: '#358FFC',
  purple: '#AB47BC',
  green: '#10B981',
  red: '#EF4444',

  ...sharedColors,
} as const;
