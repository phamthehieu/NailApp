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
  headerBackground: '#FFFFFF',
  ...sharedColors,
} as const;
