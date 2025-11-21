import { Paths } from "@/app/navigation/paths";
import { RootScreenProps } from "@/app/navigation/types";
import { Colors, useAppTheme } from "@/shared/theme";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import StatusBarComponent from "@/shared/ui/StatusBar";
import MHeader from "@/shared/ui/MHeader";
import Loader from "@/shared/ui/Loader";
import { useEffect, useRef, useState } from "react";
import HeaderDashBoardComponent from "./components/HeaderDashBoardComponent";
import { useStaffForm } from "@/features/manage/hooks/useStaffForm";
import ListBookingForm from "./components/ListBookingFormComponent";
import { useDashBoardHook } from "../hooks/useDashBoardHook";
import ListBookingGridComponent from "./components/ListBookingGridComponent";


const DashBoardScreen = ({ navigation }: RootScreenProps<Paths.DashBoard>) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { getListStaff } = useStaffForm();
    const dashboardHook = useDashBoardHook();
    const tab1Opacity = useRef(new Animated.Value(1)).current;
    const tab1TranslateX = useRef(new Animated.Value(0)).current;
    const tab2Opacity = useRef(new Animated.Value(0)).current;
    const tab2TranslateX = useRef(new Animated.Value(50)).current;
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    useEffect(() => {
        getListStaff();
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('dashboard.title')}
                onBack={() => navigation.goBack()}
                bgColor={colors.yellow}
            />
            <HeaderDashBoardComponent dashboardHook={dashboardHook} viewMode={viewMode} setViewMode={setViewMode} onBookPress={() => navigation.navigate(Paths.AddNewBooking)} />

            <View style={styles.content}>

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

            </View>

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
        content: {
            flex: 1,
            position: 'relative',
            marginTop: 20,
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