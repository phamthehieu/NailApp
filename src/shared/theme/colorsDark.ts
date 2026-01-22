import { sharedColors } from './colors.shared';

export const colors = {
  background: '#181D25',
  text: '#FFFFFF',
  card: '#11141A',
  border: '#4c566b',
  placeholderTextColor: '#999999',
  error: '#EF4444',
  primary: '#1D61E7',
  yellow: '#EFBF09',
  black: '#000000',
  white: '#FFFFFF',
  headerBackground: '#11141A',
  borderTable: '#4c566b',
  backgroundTable: '#000000',
  bottomColor: "#4c566b",
  backgroundDisabled: "#11141A",
  blue: '#358FFC',
  purple: '#AB47BC',
  green: '#10B981',
  red: '#EF4444',
  bacgroundCalendar: '#11141A',
  orange: '#FF8C00',
  ...sharedColors,
} as const;

