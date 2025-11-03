import { ComponentType, Fragment, ReactElement } from 'react';
import {
    StyleProp,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/context';
import { $styles } from '../theme/styles';
import type { ThemedStyle, ThemedStyleArray } from '../theme/types';

import { Text, TextProps } from './Text';

type Presets = 'default' | 'reversed';

interface CardProps extends TouchableOpacityProps {
    /**
     * Một trong các loại preset văn bản khác nhau.
     */
    preset?: Presets;
    /**
     * Cách nội dung nên được căn chỉnh theo chiều dọc. Điều này đặc biệt (nhưng không phải chỉ riêng) hữu ích
     * when the card is a fixed height but the content is dynamic.
     *
     * `top` (mặc định) - căn chỉnh tất cả nội dung lên trên.
     * `center` - căn chỉnh tất cả nội dung vào giữa.
     * `space-between` - phân bố nội dung đều đặn.
     * `force-footer-bottom` - căn chỉnh tất cả nội dung lên trên, nhưng buộc chân trang xuống dưới.
     */
    verticalAlignment?: 'top' | 'center' | 'space-between' | 'force-footer-bottom';
    /**
     * Thành phần tùy chọn được thêm vào bên trái của thân thẻ.
     */
    LeftComponent?: ReactElement;
    /**
     * Thành phần tùy chọn được thêm vào bên phải của thân thẻ.
     */
    RightComponent?: ReactElement;
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
     * Thành phần tiêu đề tùy chọn.
     * Overrides all other `heading*` props.
     */
    HeadingComponent?: ReactElement;
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
     * Thành phần nội dung tùy chọn.
     * Overrides all other `content*` props.
     */
    ContentComponent?: ReactElement;
    /**
     * Văn bản chân trang để hiển thị nếu không sử dụng `footerTx`.
     */
    footer?: TextProps['text'];
    /**
     * Văn bản chân trang được tra cứu thông qua i18n.
     */
    footerTx?: TextProps['tx'];
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    footerTxOptions?: TextProps['txOptions'];
    /**
     * Style override cho văn bản chân trang.
     */
    footerStyle?: StyleProp<TextStyle>;
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần Text chân trang.
     */
    FooterTextProps?: TextProps;
    /**
     * Thành phần chân trang tùy chọn.
     * Overrides all other `footer*` props.
     */
    FooterComponent?: ReactElement;
}

export function Card(props: CardProps) {
    const {
        content,
        contentTx,
        contentTxOptions,
        footer,
        footerTx,
        footerTxOptions,
        heading,
        headingTx,
        headingTxOptions,
        ContentComponent,
        HeadingComponent,
        FooterComponent,
        LeftComponent,
        RightComponent,
        verticalAlignment = 'top',
        style: $containerStyleOverride,
        contentStyle: $contentStyleOverride,
        headingStyle: $headingStyleOverride,
        footerStyle: $footerStyleOverride,
        ContentTextProps,
        HeadingTextProps,
        FooterTextProps,
        ...WrapperProps
    } = props;

    const {
        themed,
        theme: { spacing },
    } = useAppTheme();

    const preset: Presets = props.preset ?? 'default';
    const isPressable = !!WrapperProps.onPress;
    const isHeadingPresent = !!(HeadingComponent || heading || headingTx);
    const isContentPresent = !!(ContentComponent || content || contentTx);
    const isFooterPresent = !!(FooterComponent || footer || footerTx);

    const Wrapper = (isPressable ? TouchableOpacity : View) as ComponentType<
        TouchableOpacityProps | ViewProps
    >;
    const HeaderContentWrapper = verticalAlignment === 'force-footer-bottom' ? View : Fragment;

    const $containerStyle: StyleProp<ViewStyle> = [
        themed($containerPresets[preset]),
        $containerStyleOverride,
    ];
    const $headingStyle = [
        themed($headingPresets[preset]),
        (isFooterPresent || isContentPresent) && { marginBottom: spacing.xxxs },
        $headingStyleOverride,
        HeadingTextProps?.style,
    ];
    const $contentStyle = [
        themed($contentPresets[preset]),
        isHeadingPresent && { marginTop: spacing.xxxs },
        isFooterPresent && { marginBottom: spacing.xxxs },
        $contentStyleOverride,
        ContentTextProps?.style,
    ];
    const $footerStyle = [
        themed($footerPresets[preset]),
        (isHeadingPresent || isContentPresent) && { marginTop: spacing.xxxs },
        $footerStyleOverride,
        FooterTextProps?.style,
    ];
    const $alignmentWrapperStyle = [
        $alignmentWrapper,
        { justifyContent: $alignmentWrapperFlexOptions[verticalAlignment] },
        LeftComponent && { marginStart: spacing.md },
        RightComponent && { marginEnd: spacing.md },
    ];

    return (
        <Wrapper
            style={$containerStyle}
            activeOpacity={0.8}
            accessibilityRole={isPressable ? 'button' : undefined}
            {...WrapperProps}
        >
            {LeftComponent}

            <View style={$alignmentWrapperStyle}>
                <HeaderContentWrapper>
                    {HeadingComponent ||
                        (isHeadingPresent && (
                            <Text
                                weight="bold"
                                text={heading}
                                tx={headingTx}
                                txOptions={headingTxOptions}
                                {...HeadingTextProps}
                                style={$headingStyle}
                            />
                        ))}

                    {ContentComponent ||
                        (isContentPresent && (
                            <Text
                                weight="normal"
                                text={content}
                                tx={contentTx}
                                txOptions={contentTxOptions}
                                {...ContentTextProps}
                                style={$contentStyle}
                            />
                        ))}
                </HeaderContentWrapper>

                {FooterComponent ||
                    (isFooterPresent && (
                        <Text
                            weight="normal"
                            size="xs"
                            text={footer}
                            tx={footerTx}
                            txOptions={footerTxOptions}
                            {...FooterTextProps}
                            style={$footerStyle}
                        />
                    ))}
            </View>

            {RightComponent}
        </Wrapper>
    );
}

const $containerBase: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: theme.spacing.md,
    padding: theme.spacing.xs,
    borderWidth: 1,
    shadowColor: theme.colors.palette.neutral800,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 12.81,
    elevation: 16,
    minHeight: 96,
});

const $alignmentWrapper: ViewStyle = {
    flex: 1,
    alignSelf: 'stretch',
};

const $alignmentWrapperFlexOptions = {
    top: 'flex-start',
    center: 'center',
    'space-between': 'space-between',
    'force-footer-bottom': 'space-between',
} as const;

const $containerPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
    default: [
        $styles.row,
        $containerBase,
        (theme) => ({
            backgroundColor: theme.colors.palette.neutral100,
            borderColor: theme.colors.palette.neutral300,
        }),
    ],
    reversed: [
        $styles.row,
        $containerBase,
        (theme) => ({
            backgroundColor: theme.colors.palette.neutral800,
            borderColor: theme.colors.palette.neutral500,
        }),
    ],
};

const $headingPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
    default: [],
    reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
};

const $contentPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
    default: [],
    reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
};

const $footerPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
    default: [],
    reversed: [(theme) => ({ color: theme.colors.palette.neutral100 })],
};
