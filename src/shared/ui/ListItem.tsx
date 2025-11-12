import { forwardRef, ReactElement, ComponentType } from "react"
import {
    StyleProp,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from "react-native"

import { useAppTheme } from "../theme/context"
import { $styles } from "../theme/styles"
import type { ThemedStyle } from "../theme/types"

import { Icon, IconTypes } from "./Icon"
import { TextFieldLabel, TextProps } from "./Text"

export interface ListItemProps extends TouchableOpacityProps {
    /**
     * Chiều cao của mục danh sách.
     * Default: 56
     */
    height?: number
    /**
     * Có hiển thị dấu phân cách trên cùng không.
     * Default: false
     */
    topSeparator?: boolean
    /**
     * Có hiển thị dấu phân cách dưới cùng không.
     * Default: false
     */
    bottomSeparator?: boolean
    /**
     * Văn bản để hiển thị nếu không sử dụng `tx` hoặc các thành phần lồng nhau.
     */
    text?: TextProps["text"]
    /**
     * Văn bản được tra cứu thông qua i18n.
     */
    tx?: TextProps["tx"]
    /**
     * Các thành phần con.
     */
    children?: TextProps["children"]
    /**
     * Các tùy chọn tùy chọn để chuyển sang i18n. Hữu ích cho việc nội suy
     * as well as explicitly setting locale or translation fallbacks.
     */
    txOptions?: TextProps["txOptions"]
    /**
     * Một style override tùy chọn cho văn bản.
     */
    textStyle?: StyleProp<TextStyle>
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần Text.
     */
    TextProps?: TextProps
    /**
     * Một style override tùy chọn cho container View.
     */
    containerStyle?: StyleProp<ViewStyle>
    /**
     * Một style override tùy chọn cho TouchableOpacity.
     */
    style?: StyleProp<ViewStyle>
    /**
     * Icon mà nên hiển thị bên trái.
     */
    leftIcon?: ReactElement
    /**
     * Một màu tùy chọn cho icon bên trái.
     */
    leftIconColor?: string
    /**
     * Icon mà nên hiển thị bên phải.
     */
    rightIcon?: ReactElement
    /**
     * Một màu tùy chọn cho icon bên phải.
     */
    rightIconColor?: string
    /**
     * Thành phần hành động tùy chọn ReactElement bên phải.
     * Overrides `rightIcon`.
     */
    RightComponent?: ReactElement
    /**
     * Thành phần hành động tùy chọn ReactElement bên trái.
     * Overrides `leftIcon`.
     */
    LeftComponent?: ReactElement
}

interface ListItemActionProps {
    icon?: ReactElement
    iconColor?: string
    Component?: ReactElement
    size: number
    side: "left" | "right"
}

/**
 * A styled row component that can be used in FlatList, SectionList, or by itself.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/ListItem/}
 * @param {ListItemProps} props - The props for the `ListItem` component.
 * @returns {JSX.Element} The rendered `ListItem` component.
 */
export const ListItem = forwardRef<View, ListItemProps>(function ListItem(
    props: ListItemProps,
    ref,
) {
    const {
        bottomSeparator,
        children,
        height = 56,
        LeftComponent,
        leftIcon,
        leftIconColor,
        RightComponent,
        rightIcon,
        rightIconColor,
        style,
        text,
        TextProps,
        topSeparator,
        tx,
        txOptions,
        textStyle: $textStyleOverride,
        containerStyle: $containerStyleOverride,
        ...TouchableOpacityProps
    } = props
    const { themed } = useAppTheme()

    const isTouchable =
        TouchableOpacityProps.onPress !== undefined ||
        TouchableOpacityProps.onPressIn !== undefined ||
        TouchableOpacityProps.onPressOut !== undefined ||
        TouchableOpacityProps.onLongPress !== undefined

    const $textStyles = [$textStyle, $textStyleOverride, TextProps?.style]

    const $containerStyles = [
        topSeparator && $separatorTop,
        bottomSeparator && $separatorBottom,
        $containerStyleOverride,
    ]

    const $touchableStyles = [$styles.row, $touchableStyle, { minHeight: height }, style]

    const Wrapper: ComponentType<TouchableOpacityProps> = isTouchable ? TouchableOpacity : View

    return (
        <View ref={ref} style={themed($containerStyles)}>
            <Wrapper {...TouchableOpacityProps} style={$touchableStyles}>
                <ListItemAction
                    side="left"
                    size={height}
                    icon={leftIcon}
                    iconColor={leftIconColor}
                    Component={LeftComponent}
                />

                <TextFieldLabel {...TextProps} tx={tx} text={text} txOptions={txOptions} style={themed($textStyles)}>
                    {children}
                </TextFieldLabel>

                <ListItemAction
                    side="right"
                    size={height}
                    icon={rightIcon}
                    iconColor={rightIconColor}
                    Component={RightComponent}
                />
            </Wrapper>
        </View>
    )
})

function ListItemAction(props: ListItemActionProps) {
    const { icon, Component, iconColor, size, side } = props
    const { themed } = useAppTheme()

    const $iconContainerStyles = [$iconContainer]

    if (Component) return Component

    if (icon !== undefined) {
        return (
           <View style={{ height: size, width: size, justifyContent: 'center', alignItems: 'center', flexGrow: 0 }}>{icon}</View>
        )
    }

    return null
}

const $separatorTop: ThemedStyle<ViewStyle> = ({ colors }) => ({
    borderTopWidth: 1,
    borderTopColor: colors.border,
})

const $separatorBottom: ThemedStyle<ViewStyle> = ({ colors }) => ({
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
})

const $textStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
    paddingVertical: spacing.xs,
    alignSelf: "center",
    flexGrow: 1,
    flexShrink: 1,
})

const $touchableStyle: ViewStyle = {
    alignItems: "flex-start",
}

const $iconContainer: ViewStyle = {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 0,
}
const $iconContainerLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    marginEnd: spacing.md,
})

const $iconContainerRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
    marginStart: spacing.md,
})
