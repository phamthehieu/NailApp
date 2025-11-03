/**
 * Theme exports
 * Import everything from this file for cleaner imports throughout your app
 *
 * @example
 * import { useAppTheme, lightTheme, spacing } from '@shared/theme'
 */

// Theme context and hooks
export { ThemeProvider, useAppTheme } from './context';
export type { ThemeContextType, ThemeProviderProps } from './context';

// Themes
export { darkTheme, lightTheme } from './theme';

// Theme values
export { colors } from './colors';
export { colors as colorsDark } from './colorsDark';
export { spacing } from './spacing';
export { timing } from './timing';
export { typography } from './typography';
export { $styles } from './styles';

// Types
export type { Theme, Colors, Spacing, Timing, Typography, ThemeContextModeT, ImmutableThemeContextModeT, ThemedStyle, ThemedStyleArray, AllowedStylesT, ThemedFnT } from './types';

// Utilities
export { setImperativeTheming, setSystemUIBackgroundColor } from './context.utils';

