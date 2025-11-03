import { sharedColors } from './colors.shared';

export const colors = {
  background: '#181D25',
  text: '#FFFFFF',
  card: '#11141A',
  border: '#2C323E',
  placeholderTextColor: '#999999',
  error: '#EF4444',
  primary: '#1D61E7',
  yellow: '#EFBF09',
  black: '#000000',
  headerBackground: '#11141A',
  ...sharedColors,
} as const;

