import { ReactNode, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    KeyboardAvoidingViewProps,
    LayoutChangeEvent,
    Platform,
    ScrollView,
    ScrollViewProps,
    StyleProp,
    View,
    ViewStyle,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import { SystemBars, SystemBarsProps, SystemBarStyle } from 'react-native-edge-to-edge';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useAppTheme } from '@shared/theme';
import { $styles } from '@shared/theme/styles';
import { ExtendedEdge, useSafeAreaInsetsStyle } from '@shared/lib/useSafeAreaInsetsStyle';

export const DEFAULT_BOTTOM_OFFSET = 50;

interface BaseScreenProps {
    /**
     * Các thành phần con.
     */
    children?: ReactNode;
    /**
     * Style cho container ngoài của nội dung. Hữu ích cho việc đệm & lề.
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Style cho container nội bộ của nội dung. Hữu ích cho việc đệm & lề.
     */
    contentContainerStyle?: StyleProp<ViewStyle>;
    /**
     * Override các cạnh mặc định cho safe area.
     */
    safeAreaEdges?: ExtendedEdge[];
    /**
     * Background color
     */
    backgroundColor?: string;
    /**
     * Cài đặt thanh hệ thống. Mặc định là dark.
     */
    systemBarStyle?: SystemBarStyle;
    /**
     * Bằng bao nhiêu phải offset keyboard? Mặc định là 0.
     */
    keyboardOffset?: number;
    /**
     * Bằng bao nhiêu phải scroll up khi keyboard được hiển thị. Mặc định là 50.
     */
    keyboardBottomOffset?: number;
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần SystemBars.
     */
    systemBarsProps?: SystemBarsProps;
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần KeyboardAvoidingView.
     */
    keyboardAvoidingViewProps?: KeyboardAvoidingViewProps;
}

interface FixedScreenProps extends BaseScreenProps {
    preset?: 'fixed';
}
interface ScrollScreenProps extends BaseScreenProps {
    preset?: 'scroll';
    /**
     * Có keyboard persist trên tap screen không? Mặc định là handled.
     * Only applies to scroll preset.
     */
    keyboardShouldPersistTaps?: 'handled' | 'always' | 'never';
    /**
     * Truyền bất kỳ thuộc tính nào thêm vào thành phần ScrollView.
     */
    scrollViewProps?: ScrollViewProps;
}

interface AutoScreenProps extends Omit<ScrollScreenProps, 'preset'> {
    preset?: 'auto';
    /**
     * Ngưỡng để kích hoạt tự động vô hiệu hóa/bật khả năng cuộn.
     * Defaults to `{ percent: 0.92 }`.
     */
    scrollEnabledToggleThreshold?: { percent?: number; point?: number };
}

export type ScreenProps = ScrollScreenProps | FixedScreenProps | AutoScreenProps

const isIos = Platform.OS === 'ios';

type ScreenPreset = 'fixed' | 'scroll' | 'auto';

function isNonScrolling(preset?: ScreenPreset) {
    return !preset || preset === 'fixed';
}

function useAutoPreset(props: AutoScreenProps): {
    scrollEnabled: boolean;
    onContentSizeChange: (w: number, h: number) => void;
    onLayout: (e: LayoutChangeEvent) => void;
} {
    const { preset, scrollEnabledToggleThreshold } = props;
    const { percent = 0.92, point = 0 } = scrollEnabledToggleThreshold || {};

    const scrollViewHeight = useRef<null | number>(null);
    const scrollViewContentHeight = useRef<null | number>(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    function updateScrollState() {
        if (scrollViewHeight.current === null || scrollViewContentHeight.current === null) { return; }

        // kiểm tra xem nội dung có phù hợp với màn hình không rồi chuyển đổi trạng thái cuộn theo nội dung đó
        const contentFitsScreen = (function () {
            if (point) {
                return scrollViewContentHeight.current < scrollViewHeight.current - point;
            } else {
                return scrollViewContentHeight.current < scrollViewHeight.current * percent;
            }
        })();

        // nội dung nhỏ hơn kích thước của màn hình, vì vậy chúng tôi có thể vô hiệu hóa cuộn
        if (scrollEnabled && contentFitsScreen) { setScrollEnabled(false); }

        // nội dung lớn hơn kích thước của màn hình, vì vậy hãy bật cuộn
        if (!scrollEnabled && !contentFitsScreen) { setScrollEnabled(true); }
    }

    /**
     * @param {number} w - Chiều rộng của nội dung.
     * @param {number} h - Chiều cao của nội dung.
     */
    function onContentSizeChange(w: number, h: number) {
        // cập nhật chiều cao nội dung của scroll-view
        scrollViewContentHeight.current = h;
        updateScrollState();
    }

    /**
     * @param {LayoutChangeEvent} e = Sự kiện thay đổi bố cục.
     */
    function onLayout(e: LayoutChangeEvent) {
        const { height } = e.nativeEvent.layout;
        // cập nhật chiều cao của scroll-view
        scrollViewHeight.current = height;
        updateScrollState();
    }

    // cập nhật trạng thái cuộn trên mỗi render
    if (preset === 'auto') { updateScrollState(); }

    return {
        scrollEnabled: preset === 'auto' ? scrollEnabled : true,
        onContentSizeChange,
        onLayout,
    };
}

/**
 * @param {ScreenProps} props - Các thuộc tính cho thành phần `ScreenWithoutScrolling`.
 * @returns {JSX.Element} - Thành phần `ScreenWithoutScrolling` được render.
 */
function ScreenWithoutScrolling(props: ScreenProps) {
    const { style, contentContainerStyle, children, preset } = props;
    return (
        <View style={[$outerStyle, style]}>
            <View style={[$innerStyle, preset === 'fixed' && $justifyFlexEnd, contentContainerStyle]}>
                {children}
            </View>
        </View>
    );
}

/**
 * @param {ScreenProps} props - Các thuộc tính cho thành phần `ScreenWithScrolling`.
 * @returns {JSX.Element} - Thành phần `ScreenWithScrolling` được render.
 */
function ScreenWithScrolling(props: ScreenProps) {
    const {
        children,
        keyboardShouldPersistTaps = 'handled',
        keyboardBottomOffset = DEFAULT_BOTTOM_OFFSET,
        contentContainerStyle,
        scrollViewProps,
        style,
    } = props as ScrollScreenProps;

    const ref = useRef<ScrollView>(null);

    const { scrollEnabled, onContentSizeChange, onLayout } = useAutoPreset(props as AutoScreenProps);

    // Thêm hành vi gốc của việc nhấn tab hoạt động để cuộn lên đầu nội dung
    // More info at: https://reactnavigation.org/docs/use-scroll-to-top/
    useScrollToTop(ref);

    return (
        <KeyboardAwareScrollView
            bottomOffset={keyboardBottomOffset}
            {...{ keyboardShouldPersistTaps, scrollEnabled, ref }}
            {...scrollViewProps}
            onLayout={(e) => {
                onLayout(e);
                scrollViewProps?.onLayout?.(e)
            }}
            onContentSizeChange={(w: number, h: number) => {
                onContentSizeChange(w, h);
                scrollViewProps?.onContentSizeChange?.(w, h)
            }}
            style={[$outerStyle, scrollViewProps?.style, style]}
            contentContainerStyle={[
                $innerStyle,
                scrollViewProps?.contentContainerStyle,
                contentContainerStyle,
            ]}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}

/**
 * Đại diện cho một thành phần màn hình cung cấp bố cục và hành vi đồng nhất cho các preset màn hình khác nhau.
 * The `Screen` component can be used with different presets such as "fixed", "scroll", or "auto".
 * It handles safe area insets, status bar settings, keyboard avoiding behavior, and scrollability based on the preset.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Screen/}
 * @param {ScreenProps} props - Các thuộc tính cho thành phần `Screen`.
 * @returns {JSX.Element} Thành phần `Screen` được render.
 */
export function Screen(props: ScreenProps) {
    const {
        theme: { colors },
        themeContext,
    } = useAppTheme();
    const {
        backgroundColor,
            keyboardAvoidingViewProps,
        keyboardOffset = 0,
        safeAreaEdges,
        systemBarsProps,
        systemBarStyle,
    } = props;

    const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges);

    return (
        <View
            style={[
                $containerStyle,
                { backgroundColor: backgroundColor || colors.background },
                $containerInsets,
            ]}
        >
            <SystemBars
                style={systemBarStyle || (themeContext === 'dark' ? 'light' : 'dark')}
                {...systemBarsProps}
            />

            <KeyboardAvoidingView
                behavior={isIos ? 'padding' : 'height'}
                keyboardVerticalOffset={keyboardOffset}
                {...keyboardAvoidingViewProps}
                style={[$styles.flex1, keyboardAvoidingViewProps?.style]}
            >
                {isNonScrolling(props.preset) ? (
                    <ScreenWithoutScrolling {...props} />
                ) : (
                    <ScreenWithScrolling {...props} />
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const $containerStyle: ViewStyle = {
    flex: 1,
    height: '100%',
    width: '100%',
};

const $outerStyle: ViewStyle = {
    flex: 1,
    height: '100%',
    width: '100%',
};

const $justifyFlexEnd: ViewStyle = {
    justifyContent: 'flex-end',
};

const $innerStyle: ViewStyle = {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
};
