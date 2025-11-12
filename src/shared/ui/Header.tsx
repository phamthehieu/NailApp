import { ReactElement } from 'react';
import {
    StyleProp,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';

import { isRTL } from '@shared/i18n';
import { translate } from '@shared/i18n/translate';
import { useAppTheme } from '../theme/context';
import { $styles } from '../theme/styles';
import type { ThemedStyle } from '../theme/types';
import { ExtendedEdge, useSafeAreaInsetsStyle } from '@shared/lib/useSafeAreaInsetsStyle';

import { IconTypes, PressableIcon } from './Icon';
import { TextFieldLabel, TextProps } from './Text';

export interface HeaderProps {
    /**
* Bố cục của tiêu đề so với các thành phần hành động.
* - `center` sẽ buộc tiêu đề luôn được căn giữa so với tiêu đề. Nếu tiêu đề hoặc các nút hành động quá dài, tiêu đề sẽ bị cắt bớt.
* - `flex` sẽ cố gắng căn giữa tiêu đề so với các nút hành động. Nếu các nút hành động có chiều rộng khác nhau, tiêu đề sẽ bị lệch so với tiêu đề.
     */
    titleMode?: 'center' | 'flex';
    /**
     * Một style override tùy chọn cho văn bản tiêu đề.
     */
    titleStyle?: StyleProp<TextStyle>;
    /**
     * Một style override tùy chọn cho container ngoài của văn bản tiêu đề.
     */
    titleContainerStyle?: StyleProp<ViewStyle>;
    /**
     * Một style override tùy chọn cho wrapper nội bộ của tiêu đề.
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Một style override tùy chọn cho container ngoài của tiêu đề.
     */
    containerStyle?: StyleProp<ViewStyle>;
    /**
     * Background color
     */
    backgroundColor?: string;
    /**
     * Văn bản tiêu đề để hiển thị nếu không sử dụng `tx` hoặc các thành phần lồng nhau.
     */
    title?: TextProps['text'];
    /**
     * Văn bản tiêu đề được tra cứu thông qua i18n.
     */
    titleTx?: TextProps['tx'];
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    titleTxOptions?: TextProps['txOptions'];
    /**
     * Icon mà nên hiển thị bên trái.
     * Can be used with `onLeftPress`.
     */
    leftIcon?: IconTypes;
    /**
     * Một màu tùy chọn cho icon bên trái.
     */
    leftIconColor?: string;
    /**
     * Văn bản hành động bên trái để hiển thị nếu không sử dụng `leftTx`.
     * Can be used with `onLeftPress`. Overrides `leftIcon`.
     */
    leftText?: TextProps['text'];
    /**
     * Văn bản hành động bên trái được tra cứu thông qua i18n.
     * Can be used with `onLeftPress`. Overrides `leftIcon`.
     */
    leftTx?: TextProps['tx'];
    /**
     * Thành phần hành động tùy chọn ReactElement nếu các thuộc tính hành động tích hợp không đủ.
     * Overrides `leftIcon`, `leftTx` and `leftText`.
     */
    LeftActionComponent?: ReactElement;
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    leftTxOptions?: TextProps['txOptions'];
    /**
     * Những gì xảy ra khi bạn nhấn vào icon hoặc hành động văn bản bên trái.
     */
    onLeftPress?: TouchableOpacityProps['onPress'];
    /**
     * Icon mà nên hiển thị bên phải.
     * Can be used with `onRightPress`.
     */
    rightIcon?: IconTypes;
    /**
     * Một màu tùy chọn cho icon bên phải.
     */
    rightIconColor?: string;
    /**
     * Văn bản hành động bên phải để hiển thị nếu không sử dụng `rightTx`.
     * Can be used with `onRightPress`. Overrides `rightIcon`.
     */
    rightText?: TextProps['text'];
    /**
     * Văn bản hành động bên phải được tra cứu thông qua i18n.
     * Can be used with `onRightPress`. Overrides `rightIcon`.
     */
    rightTx?: TextProps['tx'];
    /**
     * Thành phần hành động tùy chọn ReactElement nếu các thuộc tính hành động tích hợp không đủ.
     * Overrides `rightIcon`, `rightTx` and `rightText`.
     */
    RightActionComponent?: ReactElement;
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    rightTxOptions?: TextProps['txOptions'];
    /**
     * Những gì xảy ra khi bạn nhấn vào icon hoặc hành động văn bản bên phải.
     */
    onRightPress?: TouchableOpacityProps['onPress'];
    /**
     * Override các cạnh mặc định cho safe area.
     */
    safeAreaEdges?: ExtendedEdge[];
}

interface HeaderActionProps {
    backgroundColor?: string;
    icon?: IconTypes;
    iconColor?: string;
    text?: TextProps['text'];
    tx?: TextProps['tx'];
    txOptions?: TextProps['txOptions'];
    onPress?: TouchableOpacityProps['onPress'];
    ActionComponent?: ReactElement;
}

export function Header(props: HeaderProps) {
    const {
        theme: { colors },
        themed,
    } = useAppTheme();
    const {
        backgroundColor = colors.background,
        LeftActionComponent,
        leftIcon,
        leftIconColor,
        leftText,
        leftTx,
        leftTxOptions,
        onLeftPress,
        onRightPress,
        RightActionComponent,
        rightIcon,
        rightIconColor,
        rightText,
        rightTx,
        rightTxOptions,
        safeAreaEdges = ['top'],
        title,
        titleMode = 'center',
        titleTx,
        titleTxOptions,
        titleContainerStyle: $titleContainerStyleOverride,
        style: $styleOverride,
        titleStyle: $titleStyleOverride,
        containerStyle: $containerStyleOverride,
    } = props;

    const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges);

    const titleContent = titleTx ? translate(titleTx, titleTxOptions) : title;

    return (
        <View style={[$container, $containerInsets, { backgroundColor }, $containerStyleOverride]}>
            <View style={[$styles.row, $wrapper, $styleOverride]}>
                <HeaderAction
                    tx={leftTx}
                    text={leftText}
                    icon={leftIcon}
                    iconColor={leftIconColor}
                    onPress={onLeftPress}
                    txOptions={leftTxOptions}
                    backgroundColor={backgroundColor}
                    ActionComponent={LeftActionComponent}
                />

                {!!titleContent && (
                    <View
                        style={[
                            $titleWrapperPointerEvents,
                            titleMode === 'center' && themed($titleWrapperCenter),
                            titleMode === 'flex' && $titleWrapperFlex,
                            $titleContainerStyleOverride,
                        ]}
                    >
                        <TextFieldLabel
                            weight="medium"
                            size="md"
                            text={titleContent}
                            style={[$title, $titleStyleOverride]}
                        />
                    </View>
                )}

                <HeaderAction
                    tx={rightTx}
                    text={rightText}
                    icon={rightIcon}
                    iconColor={rightIconColor}
                    onPress={onRightPress}
                    txOptions={rightTxOptions}
                    backgroundColor={backgroundColor}
                    ActionComponent={RightActionComponent}
                />
            </View>
        </View>
    );
}

/**
 * @param {HeaderActionProps} props - The props for the `HeaderAction` component.
 * @returns {JSX.Element} The rendered `HeaderAction` component.
 */
function HeaderAction(props: HeaderActionProps) {
    const { backgroundColor, icon, text, tx, txOptions, onPress, ActionComponent, iconColor } = props;
    const { themed } = useAppTheme();

    const content = tx ? translate(tx, txOptions) : text;

    if (ActionComponent) {
        return ActionComponent;
    }

    if (content) {
        return (
            <TouchableOpacity
                style={themed([$actionTextContainer, { backgroundColor }])}
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={0.8}
            >
                <TextFieldLabel weight="medium" size="md" text={content} style={themed($actionText)} />
            </TouchableOpacity>
        );
    }

    if (icon) {
        return (
            <PressableIcon
                size={24}
                icon={icon}
                color={iconColor}
                onPress={onPress}
                containerStyle={themed([$actionIconContainer, { backgroundColor }])}
                style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}}
            />
        );
    }

    return <View style={[$actionFillerContainer, { backgroundColor }]} />;
}

const $wrapper: ViewStyle = {
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
};

const $container: ViewStyle = {
    width: '100%',
};

const $title: TextStyle = {
    textAlign: 'center',
};

const $actionTextContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    flexGrow: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: spacing.md,
    zIndex: 2,
});

const $actionText: ThemedStyle<TextStyle> = ({ colors }) => ({
    color: colors.text,
});

const $actionIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    flexGrow: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: spacing.md,
    zIndex: 2,
});

const $actionFillerContainer: ViewStyle = {
    width: 16,
};

const $titleWrapperPointerEvents: ViewStyle = {
    pointerEvents: 'none',
};

const $titleWrapperCenter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    paddingHorizontal: spacing.xxl,
    zIndex: 1,
});

const $titleWrapperFlex: ViewStyle = {
    justifyContent: 'center',
    flexGrow: 1,
};
