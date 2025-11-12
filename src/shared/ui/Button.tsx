import { ComponentType, forwardRef, Ref } from 'react';
import {
    Pressable,
    PressableProps,
    PressableStateCallbackType,
    StyleProp,
    TextStyle,
    ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/context';
import { $styles } from '../theme/styles';
import type { ThemedStyle, ThemedStyleArray } from '../theme/types';

import { TextFieldLabel, TextProps } from './Text';

type Presets = 'default' | 'filled' | 'reversed';

export interface ButtonAccessoryProps {
    style: StyleProp<any>;
    pressableState: PressableStateCallbackType;
    disabled?: boolean;
}

export interface ButtonProps extends PressableProps {
    /**
     * Văn bản được tra cứu thông qua i18n.
     */
    tx?: TextProps['tx'];
    /**
     * Văn bản hiển thị nếu không sử dụng `tx` hoặc các thành phần lồng nhau.
     */
    text?: TextProps['text'];
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * cũng như thiết lập rõ ràng ngôn ngữ hoặc các bản dịch dự phòng.
     */
    txOptions?: TextProps['txOptions'];
    /**
     * Một style override tùy chọn hữu ích cho việc đệm & lề.
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Một style override tùy chọn cho trạng thái "pressed".
     */
    pressedStyle?: StyleProp<ViewStyle>;
    /**
     * Một style override tùy chọn cho văn bản của nút.
     */
    textStyle?: StyleProp<TextStyle>;
    /**
     * Một style override tùy chọn cho văn bản của nút khi ở trạng thái "pressed".
     */
    pressedTextStyle?: StyleProp<TextStyle>;
    /**
     * Một style override tùy chọn cho văn bản của nút khi ở trạng thái "disabled".
     */
    disabledTextStyle?: StyleProp<TextStyle>;
    /**
     * Một trong các loại nút preset khác nhau.
     */
    preset?: Presets;
    /**
     * Một thành phần tùy chọn để render trên phía bên phải của văn bản.
     * Example: `RightAccessory={(props) => <View {...props} />}`
     */
    RightAccessory?: ComponentType<ButtonAccessoryProps>;
    /**
     * Một thành phần tùy chọn để render trên phía bên trái của văn bản.
     * Example: `LeftAccessory={(props) => <View {...props} />}`
     */
    LeftAccessory?: ComponentType<ButtonAccessoryProps>;
    /**
     * Các thành phần con.
     */
    children?: React.ReactNode;
    /**
     * prop disabled, truy cập trực tiếp cho lý do thiết kế khai báo.
     * https://reactnative.dev/docs/pressable#disabled
     */
    disabled?: boolean;
    /**
     * Một style override tùy chọn cho trạng thái "disabled".
     */
    disabledStyle?: StyleProp<ViewStyle>;
}

export const Button = forwardRef(function Button(props: ButtonProps, ref: Ref<any>) {
    const {
        tx,
        text,
        txOptions,
        style: $viewStyleOverride,
        pressedStyle: $pressedViewStyleOverride,
        textStyle: $textStyleOverride,
        pressedTextStyle: $pressedTextStyleOverride,
        disabledTextStyle: $disabledTextStyleOverride,
        children,
        RightAccessory,
        LeftAccessory,
        disabled,
        disabledStyle: $disabledViewStyleOverride,
        ...rest
    } = props;

    const { themed } = useAppTheme();

    const preset: Presets = props.preset ?? 'default';

    function $viewStyle({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> {
        return [
            themed($viewPresets[preset]),
            $viewStyleOverride,
            !!pressed && themed([$pressedViewPresets[preset], $pressedViewStyleOverride]),
            !!disabled && $disabledViewStyleOverride,
        ];
    }

    function $textStyle({ pressed }: PressableStateCallbackType): StyleProp<TextStyle> {
        return [
            themed($textPresets[preset]),
            $textStyleOverride,
            !!pressed && themed([$pressedTextPresets[preset], $pressedTextStyleOverride]),
            !!disabled && $disabledTextStyleOverride,
        ];
    }

    return (
        <Pressable
            ref={ref}
            style={$viewStyle}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!disabled }}
            {...rest}
            disabled={disabled}
        >
            {(state) => (
                <>
                    {!!LeftAccessory && (
                        <LeftAccessory style={$leftAccessoryStyle} pressableState={state} disabled={disabled} />
                    )}

                    <TextFieldLabel tx={tx} text={text} txOptions={txOptions} style={$textStyle(state)}>
                        {children}
                    </TextFieldLabel>

                    {!!RightAccessory && (
                        <RightAccessory
                            style={$rightAccessoryStyle}
                            pressableState={state}
                            disabled={disabled}
                        />
                    )}
                </>
            )}
        </Pressable>
    );
});

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    minHeight: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
});

const $baseTextStyle: ThemedStyle<TextStyle> = ({ typography }) => ({
    fontSize: 16,
    lineHeight: 20,
    fontFamily: typography.primary.medium,
    textAlign: 'center',
    flexShrink: 1,
    flexGrow: 0,
    zIndex: 2,
});

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    marginStart: spacing.xs,
    zIndex: 1,
});
const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    marginEnd: spacing.xs,
    zIndex: 1,
});

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
    default: [
        $styles.row,
        $baseViewStyle,
        ({ colors }) => ({
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        }),
    ],
    filled: [
        $styles.row,
        $baseViewStyle,
        ({ colors }) => ({ backgroundColor: colors.background }),
    ],
    reversed: [
        $styles.row,
        $baseViewStyle,
        ({ colors }) => ({ backgroundColor: colors.background }),
    ],
};

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
    default: [$baseTextStyle],
    filled: [$baseTextStyle],
    reversed: [$baseTextStyle, ({ colors }) => ({ color: colors.text })],
};

const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
    default: ({ colors }) => ({ backgroundColor: colors.background }),
    filled: ({ colors }) => ({ backgroundColor: colors.background }),
    reversed: ({ colors }) => ({ backgroundColor: colors.background }),
};

const $pressedTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
    default: () => ({ opacity: 0.9 }),
    filled: () => ({ opacity: 0.9 }),
    reversed: () => ({ opacity: 0.9 }),
};
