import { Image, ImageProps, ImageStyle, StyleProp, TextStyle, View, ViewStyle } from 'react-native';

import { translate } from '@shared/i18n/translate';
import { useAppTheme } from '../theme/context';
import type { ThemedStyle } from '../theme/types';

import { Button, ButtonProps } from './Button';
import { Text, TextProps } from './Text';

const sadFace = require('../../assets/images/sad-face.png');

interface EmptyStateProps {
    /**
     * Một thuộc tính tùy chọn chỉ định bộ văn bản/hình ảnh được sử dụng cho trạng thái trống.
     */
    preset?: 'generic';
    /**
         * Style override cho container.
         */
    style?: StyleProp<ViewStyle>;
    /**
     * Một nguồn hình ảnh để hiển thị trên tiêu đề.
     */
    imageSource?: ImageProps['source'];
    /**
     * Style override cho hình ảnh.
     */
    imageStyle?: StyleProp<ImageStyle>;
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần Image.
     */
    ImageProps?: Omit<ImageProps, 'source'>;
    /**
     * Văn bản tiêu đề để hiển thị nếu không sử dụng `headingTx`.
     */
    heading?: TextProps['text'];
    /**
     * Văn bản tiêu đề được tra cứu thông qua i18n.
     */
    headingTx?: TextProps['tx'];
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    headingTxOptions?: TextProps['txOptions'];
    /**
     * Style override cho văn bản tiêu đề.
     */
    headingStyle?: StyleProp<TextStyle>;
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần Text tiêu đề.
     */
    HeadingTextProps?: TextProps;
    /**
     * Văn bản nội dung để hiển thị nếu không sử dụng `contentTx`.
     */
    content?: TextProps['text'];
    /**
     * Văn bản nội dung được tra cứu thông qua i18n.
     */
    contentTx?: TextProps['tx'];
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    contentTxOptions?: TextProps['txOptions'];
    /**
     * Style override cho văn bản nội dung.
     */
    contentStyle?: StyleProp<TextStyle>;
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần Text nội dung.
     */
    ContentTextProps?: TextProps;
    /**
     * Văn bản nút để hiển thị nếu không sử dụng `buttonTx`.
     */
    button?: TextProps['text'];
    /**
     * Văn bản nút được tra cứu thông qua i18n.
     */
    buttonTx?: TextProps['tx'];
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    buttonTxOptions?: TextProps['txOptions'];
    /**
     * Style override cho nút.
     */
    buttonStyle?: ButtonProps['style'];
    /**
     * Style override cho văn bản nút.
     */
    buttonTextStyle?: ButtonProps['textStyle'];
    /**
     * Được gọi khi nút được nhấn.
     */
    buttonOnPress?: ButtonProps['onPress'];
    /**
     * Truyền bấkỳ thuộc tính nào thêm vào thành phần Button.
     */
    ButtonProps?: ButtonProps;
}

interface EmptyStatePresetItem {
    imageSource: ImageProps['source'];
    heading: TextProps['text'];
    content: TextProps['text'];
    button: TextProps['text'];
}

export function EmptyState(props: EmptyStateProps) {
    const {
        theme,
        themed,
        theme: { spacing },
    } = useAppTheme();

    const EmptyStatePresets = {
        generic: {
            imageSource: sadFace,
            heading: translate('emptyStateComponent:generic.heading'),
            content: translate('emptyStateComponent:generic.content'),
            button: translate('emptyStateComponent:generic.button'),
        } as EmptyStatePresetItem,
    } as const;

    const preset = EmptyStatePresets[props.preset ?? 'generic'];

    const {
        button = preset.button,
        buttonTx,
        buttonOnPress,
        buttonTxOptions,
        content = preset.content,
        contentTx,
        contentTxOptions,
        heading = preset.heading,
        headingTx,
        headingTxOptions,
        imageSource = preset.imageSource,
        style: $containerStyleOverride,
        buttonStyle: $buttonStyleOverride,
        buttonTextStyle: $buttonTextStyleOverride,
        contentStyle: $contentStyleOverride,
        headingStyle: $headingStyleOverride,
        imageStyle: $imageStyleOverride,
        ButtonProps: buttonProps,
        ContentTextProps,
        HeadingTextProps,
        ImageProps: imageProps,
    } = props;

    const isImagePresent = !!imageSource;
    const isHeadingPresent = !!(heading || headingTx);
    const isContentPresent = !!(content || contentTx);
    const isButtonPresent = !!(button || buttonTx);

    const $containerStyles = [$containerStyleOverride];
    const $imageStyles = [
        $image,
        (isHeadingPresent || isContentPresent || isButtonPresent) && { marginBottom: spacing.xxxs },
        $imageStyleOverride,
        imageProps?.style,
    ];
    const $headingStyles = [
        themed($heading),
        isImagePresent && { marginTop: spacing.xxxs },
        (isContentPresent || isButtonPresent) && { marginBottom: spacing.xxxs },
        $headingStyleOverride,
        HeadingTextProps?.style,
    ];
    const $contentStyles = [
        themed($content),
        (isImagePresent || isHeadingPresent) && { marginTop: spacing.xxxs },
        isButtonPresent && { marginBottom: spacing.xxxs },
        $contentStyleOverride,
        ContentTextProps?.style,
    ];
    const $buttonStyles = [
        (isImagePresent || isHeadingPresent || isContentPresent) && { marginTop: spacing.xl },
        $buttonStyleOverride,
        buttonProps?.style,
    ];

    return (
        <View style={$containerStyles}>
            {isImagePresent && (
                <Image
                    source={imageSource}
                    {...imageProps}
                    style={$imageStyles}
                    tintColor={theme.colors.palette.neutral900}
                />
            )}

            {isHeadingPresent && (
                <Text
                    preset="subheading"
                    text={heading}
                    tx={headingTx}
                    txOptions={headingTxOptions}
                    {...HeadingTextProps}
                    style={$headingStyles}
                />
            )}

            {isContentPresent && (
                <Text
                    text={content}
                    tx={contentTx}
                    txOptions={contentTxOptions}
                    {...ContentTextProps}
                    style={$contentStyles}
                />
            )}

            {isButtonPresent && (
                <Button
                    onPress={buttonOnPress}
                    text={button}
                    tx={buttonTx}
                    txOptions={buttonTxOptions}
                    textStyle={$buttonTextStyleOverride}
                    {...buttonProps}
                    style={$buttonStyles}
                />
            )}
        </View>
    );
}

const $image: ImageStyle = { alignSelf: 'center' };
const $heading: ThemedStyle<TextStyle> = ({ spacing }) => ({
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
});
const $content: ThemedStyle<TextStyle> = ({ spacing }) => ({
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
});
