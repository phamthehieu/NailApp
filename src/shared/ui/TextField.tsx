import { ComponentType, forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import {
    ImageStyle,
    StyleProp,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import { isRTL } from '../i18n';
import { translate } from '../i18n/translate';
import { useAppTheme } from '../theme/context';
import { $styles } from '../theme/styles';
import type { ThemedStyle, ThemedStyleArray } from '../theme/types';

import { Text, TextProps } from './Text';

export interface TextFieldAccessoryProps {
    style: StyleProp<ViewStyle | TextStyle | ImageStyle>
    status: TextFieldProps['status']
    multiline: boolean
    editable: boolean
}

export interface TextFieldProps extends Omit<TextInputProps, 'ref'> {
    /**
     * Một style modifier cho các trạng thái đầu vào khác nhau.
     */
    status?: 'error' | 'disabled'
    /**
     * Hiển thị dấu sao đỏ bắt buộc sau label
     */
    required?: boolean
    /**
     * Văn bản nhãn để hiển thị nếu không sử dụng `labelTx`.
     */
    label?: TextProps['text']
    /**
     * Văn bản nhãn được tra cứu thông qua i18n.
     */
    labelTx?: TextProps['tx']
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    labelTxOptions?: TextProps['txOptions']
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần Text nhãn.
     */
    LabelTextProps?: TextProps
    /**
     * The helper text to display if not using `helperTx`.
     */
    helper?: TextProps['text']
    /**
     * Helper text which is looked up via i18n.
     */
    helperTx?: TextProps['tx']
    /**
     * Optional helper options to pass to i18n. Useful for interpolation
     * as well as explicitly setting locale or translation fallbacks.
     */
    helperTxOptions?: TextProps['txOptions']
    /**
     * Pass any additional props directly to the helper Text component.
     */
    HelperTextProps?: TextProps
    /**
     * The placeholder text to display if not using `placeholderTx`.
     */
    placeholder?: TextProps['text']
    /**
     * Placeholder text which is looked up via i18n.
     */
    placeholderTx?: TextProps['tx']
    /**
     * Optional placeholder options to pass to i18n. Useful for interpolation
     * as well as explicitly setting locale or translation fallbacks.
     */
    placeholderTxOptions?: TextProps['txOptions']
    /**
     * Optional input style override.
     */
    style?: StyleProp<TextStyle>
    /**
     * Style overrides for the container
     */
    containerStyle?: StyleProp<ViewStyle>
    /**
     * Style overrides for the input wrapper
     */
    inputWrapperStyle?: StyleProp<ViewStyle>

    RightAccessory?: ComponentType<TextFieldAccessoryProps>

    LeftAccessory?: ComponentType<TextFieldAccessoryProps>
}

export const TextField = forwardRef(function TextField(props: TextFieldProps, ref: Ref<TextInput>) {
    const {
        labelTx,
        label,
        labelTxOptions,
        required,
        placeholderTx,
        placeholder,
        placeholderTxOptions,
        helper,
        helperTx,
        helperTxOptions,
        status,
        RightAccessory,
        LeftAccessory,
        HelperTextProps,
        LabelTextProps,
        style: $inputStyleOverride,
        containerStyle: $containerStyleOverride,
        inputWrapperStyle: $inputWrapperStyleOverride,
        ...TextInputProps
    } = props;
    const input = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    const {
        themed,
        theme: { colors },
    } = useAppTheme();

    const disabled = TextInputProps.editable === false || status === 'disabled';

    const placeholderContent = placeholderTx
        ? translate(placeholderTx, placeholderTxOptions)
        : placeholder;

    const $containerStyles = [$containerStyleOverride];

    const $labelStyles = [$labelStyle, LabelTextProps?.style];

    const $inputWrapperStyles = [
        $styles.row,
        $inputWrapperStyle,
        $inputWrapperStyleOverride,
        TextInputProps.multiline && { minHeight: 112 },
        (LeftAccessory || RightAccessory) && { alignItems: 'center' as const },
        LeftAccessory && { paddingStart: 10 },
        RightAccessory && { paddingEnd: 0 },
        status === 'error' && { borderColor: colors.error },
        isFocused && { borderColor: colors.yellow },
    ]

    const $inputStyles: ThemedStyleArray<TextStyle> = [
        $inputStyle,
        disabled && { color: colors.placeholderTextColor },
        isRTL && { textAlign: 'right' as TextStyle['textAlign'] },
        TextInputProps.multiline && { height: 'auto' },
        (LeftAccessory || RightAccessory) && !TextInputProps.multiline && { marginVertical: 0 },
        $inputStyleOverride,
    ]

    const $helperStyles = [
        $helperStyle,
        status === 'error' && { color: colors.error },
        HelperTextProps?.style,
    ]

    /**
     *
     */
    function focusInput() {
        if (disabled) { return; }

        input.current?.focus();
    }

    useImperativeHandle(ref, () => input.current as TextInput);

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={$containerStyles}
            onPress={focusInput}
            accessibilityState={{ disabled }}
        >
            {!!(label || labelTx) && (
                <View style={$styles.row}>
                    <Text
                        preset="formLabel"
                        text={label}
                        tx={labelTx}
                        txOptions={labelTxOptions}
                        {...LabelTextProps}
                        style={themed($labelStyles)}
                    />
                    {!!required && (
                        <Text style={[themed($labelStyles), { marginLeft: 6, color: colors.error }]}>
                        (*)
                        </Text>
                    )}
                </View>
            )}

            <View style={themed($inputWrapperStyles)}>
                {!!LeftAccessory && (
                    <LeftAccessory
                        style={themed($leftAccessoryStyle)}
                        status={status}
                        editable={!disabled}
                        multiline={TextInputProps.multiline ?? false}
                    />
                )}

                <TextInput
                    ref={input}
                    underlineColorAndroid={colors.card}
                    textAlignVertical={TextInputProps.multiline ? "top" : "center"}
                    placeholder={placeholderContent}
                    placeholderTextColor={colors.placeholderTextColor}
                    cursorColor={TextInputProps.cursorColor ?? colors.yellow}
                    selectionColor={TextInputProps.selectionColor ?? colors.yellow}
                    {...TextInputProps}
                    onFocus={(e) => {
                        setIsFocused(true)
                        TextInputProps.onFocus?.(e)
                    }}
                    onBlur={(e) => {
                        setIsFocused(false)
                        TextInputProps.onBlur?.(e)
                    }}
                    editable={!disabled}
                    style={themed($inputStyles)}
                />

                {!!RightAccessory && (
                    <RightAccessory
                        style={themed($rightAccessoryStyle)}
                        status={status}
                        editable={!disabled}
                        multiline={TextInputProps.multiline ?? false}
                    />
                )}
            </View>

            {!!(helper || helperTx) && (
                <Text
                    preset="formHelper"
                    text={helper}
                    tx={helperTx}
                    txOptions={helperTxOptions}
                    {...HelperTextProps}
                    style={themed($helperStyles)}
                />
            )}
        </TouchableOpacity>
    )
})

const $labelStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
    marginBottom: spacing.xs,
})

const $inputWrapperStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderColor: colors.border,
    overflow: 'hidden',
});

const $inputStyle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
    flex: 1,
    alignSelf: 'stretch',
    fontFamily: typography.primary.normal,
    color: colors.text,
    fontSize: 16,
    height: 28,
    // https://github.com/facebook/react-native/issues/21720#issuecomment-532642093
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
});

const $helperStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
    marginTop: spacing.xs,
});

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    marginEnd: spacing.xs + 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
});

const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    marginStart: spacing.xs,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
});
