import {
    Image,
    ImageStyle,
    StyleProp,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/context';

export type IconTypes = keyof typeof iconRegistry;

type BaseIconProps = {
    /**
     * Tên của icon
     */
    icon: IconTypes;

    /**
     * Một màu tùy chọn cho icon
     */
    color?: string;

    /**
     * Một kích thước tùy chọn cho icon. Nếu không cung cấp, icon sẽ được định kích thước theo độ phân giải của icon.
     */
    size?: number;

    /**
     * Style override cho hình ảnh icon
     */
    style?: StyleProp<ImageStyle>;

    /**
     * Style override cho container icon
     */
    containerStyle?: StyleProp<ViewStyle>;
}

type PressableIconProps = Omit<TouchableOpacityProps, 'style'> & BaseIconProps;
type IconProps = Omit<ViewProps, 'style'> & BaseIconProps;


export function PressableIcon(props: PressableIconProps) {
    const {
        icon,
        color,
        size,
        style: $imageStyleOverride,
        containerStyle: $containerStyleOverride,
        ...pressableProps
    } = props;

    const { theme } = useAppTheme();

    const $imageStyle: StyleProp<ImageStyle> = [
        $imageStyleBase,
        { tintColor: color ?? theme.colors.text },
        size !== undefined && { width: size, height: size },
        $imageStyleOverride,
    ];

    return (
        <TouchableOpacity {...pressableProps} style={$containerStyleOverride}>
            <Image style={$imageStyle} source={iconRegistry[icon]} />
        </TouchableOpacity>
    );
}


export function Icon(props: IconProps) {
    const {
        icon,
        color,
        size,
        style: $imageStyleOverride,
        containerStyle: $containerStyleOverride,
        ...viewProps
    } = props;

    const { theme } = useAppTheme();

    const $imageStyle: StyleProp<ImageStyle> = [
        $imageStyleBase,
        { tintColor: color ?? theme.colors.text },
        size !== undefined && { width: size, height: size },
        $imageStyleOverride,
    ];

    return (
        <View {...viewProps} style={$containerStyleOverride}>
            <Image style={$imageStyle} source={iconRegistry[icon]} />
        </View>
    );
}

export const iconRegistry = {

};

const $imageStyleBase: ImageStyle = {
    resizeMode: 'contain',
};
