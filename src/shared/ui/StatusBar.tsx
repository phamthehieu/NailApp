import { useAppTheme } from '@shared/theme';
import { StatusBar } from 'react-native';

const StatusBarComponent = ({ backgroundColor }: { backgroundColor?: string }) => {
    const { theme } = useAppTheme();
    const { colors, isDark } = theme;

    function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const normalized = hex.replace('#', '');
        if (normalized.length === 3) {
            const r = parseInt(normalized[0] + normalized[0], 16);
            const g = parseInt(normalized[1] + normalized[1], 16);
            const b = parseInt(normalized[2] + normalized[2], 16);
            return { r, g, b };
        }
        if (normalized.length === 6) {
            const r = parseInt(normalized.slice(0, 2), 16);
            const g = parseInt(normalized.slice(2, 4), 16);
            const b = parseInt(normalized.slice(4, 6), 16);
            return { r, g, b };
        }
        return null;
    }

    function getBrightness(color: string): number | null {
        const rgb = hexToRgb(color);
        if (!rgb) {
            return null;
        }
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }

    const brightness = getBrightness(backgroundColor || colors.background);
    const computedBarStyle = brightness !== null
        ? (brightness < 150 ? 'light-content' : 'dark-content')
        : (isDark ? 'light-content' : 'dark-content');

    return (
        <StatusBar
            translucent
            backgroundColor={backgroundColor}
            barStyle={computedBarStyle}
        />
    );
};

export default StatusBarComponent;


