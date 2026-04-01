import { Paths } from "@/app/providers/navigation/paths";
import { RootScreenProps } from "@/app/providers/navigation/types";
import { Colors, useAppTheme } from "@/shared/theme";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import StatusBarComponent from "@/shared/ui/StatusBar";
import MHeader from "@/shared/ui/MHeader";
import Loader from "@/shared/ui/Loader";
import { useEffect, useRef, useState } from "react";
import HeaderDashBoardComponent from "./components/HeaderDashBoardComponent";
import ListBookingForm from "./components/ListBookingFormComponent";
import { useDashBoardHook } from "../hooks/useDashBoardHook";
import ListBookingGridComponent from "./components/ListBookingGridComponent";
import { useEditBookingForm } from "@/features/manage/hooks/useEditBookingForm";
import { ChevronsDown, ChevronsUp } from "lucide-react-native";


const DashBoardScreen = ({ navigation }: RootScreenProps<Paths.DashBoard>) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const [loading] = useState(false);
    const { getListStaffManager } = useEditBookingForm();
    const dashboardHook = useDashBoardHook();
    const tab1Opacity = useRef(new Animated.Value(1)).current;
    const tab1TranslateX = useRef(new Animated.Value(0)).current;
    const tab2Opacity = useRef(new Animated.Value(0)).current;
    const tab2TranslateX = useRef(new Animated.Value(50)).current;
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isChromeCollapsed, setIsChromeCollapsed] = useState(false);
    const [chromeHeight, setChromeHeight] = useState(0);
    const chromeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        getListStaffManager();

    }, [navigation]);

    useEffect(() => {
        if (viewMode === 'list') {
            Animated.parallel([
                Animated.timing(tab1Opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab1TranslateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2Opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2TranslateX, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(tab1Opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab1TranslateX, {
                    toValue: -50,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2Opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2TranslateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [viewMode]);

    const handleToggleChrome = () => {
        const nextCollapsed = !isChromeCollapsed;
        setIsChromeCollapsed(nextCollapsed);
        Animated.timing(chromeAnim, {
            toValue: nextCollapsed ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const chromeAnimatedStyle = {
        height: chromeHeight
            ? chromeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, chromeHeight],
            })
            : undefined,
        opacity: chromeAnim,
        transform: [
            {
                translateY: chromeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                }),
            },
        ],
    } as const;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <Animated.View
                style={[styles.chromeContainer, chromeAnimatedStyle]}
                pointerEvents={isChromeCollapsed ? 'none' : 'auto'}
            >
                <View
                    onLayout={(e) => {
                        const h = e.nativeEvent.layout.height;
                        if (h > 0) setChromeHeight((prev) => (h > prev ? h : prev));
                    }}
                >
                    <MHeader
                        label={t('dashboard.title')}
                        onBack={() => navigation.goBack()}
                        bgColor={colors.yellow}
                    />
                    <HeaderDashBoardComponent
                        dashboardHook={dashboardHook}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onBookPress={() => navigation.navigate(Paths.AddNewBooking)}
                    />
                </View>
            </Animated.View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        marginTop: chromeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 20],
                        }),
                    },
                ]}
            >

                <TouchableOpacity
                    style={[styles.collapseButton, { backgroundColor: colors.yellow }]}
                    onPress={handleToggleChrome}
                    accessibilityRole="button"
                    accessibilityLabel={
                        isChromeCollapsed
                            ? t('common.expand', { defaultValue: 'Mở rộng' })
                            : t('common.collapse', { defaultValue: 'Thu gọn' })
                    }
                >
                    {isChromeCollapsed ? (
                        <ChevronsDown size={18} color={colors.background} />
                    ) : (
                        <ChevronsUp size={18} color={colors.background} />
                    )}
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.tabContainer,
                        {
                            opacity: tab2Opacity,
                            transform: [{ translateX: tab2TranslateX }],
                        },
                    ]}
                    pointerEvents={viewMode === 'grid' ? 'auto' : 'none'}
                >
                    <ListBookingGridComponent navigation={navigation} dashboardHook={dashboardHook} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.tabContainer,
                        {
                            opacity: tab1Opacity,
                            transform: [{ translateX: tab1TranslateX }],
                        },
                    ]}
                    pointerEvents={viewMode === 'list' ? 'auto' : 'none'}
                >
                    <ListBookingForm navigation={navigation} dashboardHook={dashboardHook} />

                </Animated.View>

            </Animated.View>

            <Loader loading={loading} title={t('loading.processing')} />

        </SafeAreaView >
    );
};

const $styles = (colors: Colors) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        chromeContainer: {
            overflow: 'hidden',
        },
        content: {
            flex: 1,
            position: 'relative',
            marginTop: 20,
        },
        collapseButton: {
            position: 'absolute',
            right: 16,
            bottom: 16,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
        },
        tabsWrapper: {
            flex: 1,
            position: 'relative',
        },
        tabContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
        }
    });
};

export default DashBoardScreen;