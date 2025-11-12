import { ReactNode, forwardRef, ForwardedRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { TOptions } from 'i18next';

import { isRTL, TxKeyPath } from '../i18n';
import { translate } from '../i18n/translate';
import { useAppTheme } from '../theme/context';
import type { ThemedStyle, ThemedStyleArray } from '../theme/types';
import { typography } from '../theme/typography';

type Sizes = keyof typeof $sizeStyles;
type Weights = keyof typeof typography.primary;
type Presets = 'default' | 'bold' | 'heading' | 'subheading' | 'formLabel' | 'formHelper';

export interface TextProps extends RNTextProps {
    /**
     * Văn bản được tra cứu thông qua i18n.
     */
    tx?: TxKeyPath;
    /**
     * Văn bản để hiển thị nếu không sử dụng `tx` hoặc các thành phần lồng nhau.
     */
    text?: string;
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    txOptions?: TOptions;
    /**
     * Một style override tùy chọn hữu ích cho việc đệm & lề.
     */
    style?: StyleProp<TextStyle>;
    /**
     * Một trong các loại preset văn bản khác nhau.
     */
    preset?: Presets;
    /**
     * Modifier trọng số văn bản.
     */
    weight?: Weights;
    /**
     * Modifier kích thước văn bản.
     */
    size?: Sizes;
    /**
     * Các thành phần con.
     */
    children?: ReactNode;
}


export const TextFieldLabel = forwardRef(function TextFieldLabel(props: TextProps, ref: ForwardedRef<RNText>) {
    const { weight, size, tx, txOptions, text, children, style: $styleOverride, ...rest } = props;
    const { themed } = useAppTheme()

    const i18nText = tx && translate(tx, txOptions);
    const content = i18nText || text || children;

    const preset: Presets = props.preset ?? 'default';
    const $styles: StyleProp<TextStyle> = [
        $rtlStyle,
        themed($presets[preset]),
        weight && $fontWeightStyles[weight],
        size && $sizeStyles[size],
        $styleOverride,
    ];

    return (
        <RNText {...rest} style={$styles} ref={ref} allowFontScaling={false}>
            {content}
        </RNText>
    )
})

const $sizeStyles = {
    xxl: { fontSize: 36, lineHeight: 44 } satisfies TextStyle,
    xl: { fontSize: 24, lineHeight: 34 } satisfies TextStyle,
    lg: { fontSize: 20, lineHeight: 32 } satisfies TextStyle,
    md: { fontSize: 18, lineHeight: 26 } satisfies TextStyle,
    sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,
    xs: { fontSize: 14, lineHeight: 21 } satisfies TextStyle,
    xxs: { fontSize: 12, lineHeight: 18 } satisfies TextStyle,
}

const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontFamily]) => {
    return { ...acc, [weight]: { fontFamily } }
}, {}) as Record<Weights, TextStyle>;

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
    ...$sizeStyles.sm,
    ...$fontWeightStyles.normal,
    color: theme.colors.text,
});

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
    default: [$baseStyle],
    bold: [$baseStyle, { ...$fontWeightStyles.bold }],
    heading: [
        $baseStyle,
        {
            ...$sizeStyles.xxl,
            ...$fontWeightStyles.bold,
        },
    ],
    subheading: [$baseStyle, { ...$sizeStyles.lg, ...$fontWeightStyles.medium }],
    formLabel: [$baseStyle, { ...$fontWeightStyles.medium }],
    formHelper: [$baseStyle, { ...$sizeStyles.sm, ...$fontWeightStyles.normal }],
};
const $rtlStyle: TextStyle = isRTL ? { writingDirection: 'rtl' } : {};
