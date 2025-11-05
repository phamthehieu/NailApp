import { sharedColors } from './colors.shared';

export const colors = {
  background: '#181D25',
  text: '#FFFFFF',
  card: '#1E1E21',
  border: '#4c566b',
  placeholderTextColor: '#999999',
  error: '#EF4444',
  primary: '#1D61E7',
  yellow: '#EFBF09',
  black: '#000000',
  white: '#FFFFFF',
  headerBackground: '#11141A',
  borderTable: '#4c566b',
  backgroundTable: '#1E1E21',
  bottomColor: "#4c566b",
  backgroundDisabled: "#4c566b",
  ...sharedColors,
} as const;

