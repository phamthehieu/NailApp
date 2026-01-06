import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { CalendarCheck, UserRound, UserCheck, Home } from 'lucide-react-native';
import { useAppTheme } from '@/shared/theme';
import { Paths } from '@/app/providers/navigation/paths';
import type { RootStackParamList } from '@/app/providers/navigation/types';
import BookingManageScreen from '@/features/manage/ui/BookingManageScreen';
import { useTranslation } from 'react-i18next';
import { TextFieldLabel } from '@/shared/ui/Text';
import CheckinScreen from '@/features/store/ui/CheckinScreen';
import { SettingsScreen } from '@/features/settings';
import { DashBoardScreen } from '@/features/dashboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Tab = createBottomTabNavigator<RootStackParamList>();

const BottomNavigator = () => {
    const { theme: { colors } } = useAppTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const TAB_TITLES: Record<string, string> = {
        [Paths.DashBoard]: t('bottomNavigator.dashboard'),
        [Paths.BookingManage]: t('bottomNavigator.bookingManage'),
        [Paths.Checkin]: t('bottomNavigator.checkin'),
        [Paths.Settings]: t('bottomNavigator.settings'),
    };

    const renderLabel = (routeName: string, color: string) => (
        <TextFieldLabel allowFontScaling={false} style={[styles.tabLabel, { color }]}>
            {TAB_TITLES[routeName]}
        </TextFieldLabel>
    );

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.yellow,
                tabBarInactiveTintColor: colors.placeholderTextColor,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    backgroundColor: colors.card,
                    paddingTop: 8,
                    paddingBottom: Math.max(insets.bottom, 8),
                    height: 60 + Math.max(insets.bottom, 8),
                },
                tabBarLabelStyle: {
                    marginBottom: 4,
                },
            }}
        >

            <Tab.Screen
                name={Paths.BookingManage}
                component={BookingManageScreen}
                options={{
                    tabBarLabel: ({ color }: { color: string }) => renderLabel(Paths.BookingManage, color),
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <CalendarCheck color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name={Paths.DashBoard}
                component={DashBoardScreen}
                options={{
                    tabBarLabel: ({ color }: { color: string }) => renderLabel(Paths.DashBoard, color),
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Home color={color} size={size} />
                    ),
                }}
            />


            <Tab.Screen
                name={Paths.Checkin}
                component={CheckinScreen}
                options={{
                    tabBarLabel: ({ color }: { color: string }) => renderLabel(Paths.Checkin, color),
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <UserCheck color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name={Paths.Settings}
                component={SettingsScreen}
                options={{
                    tabBarLabel: ({ color }: { color: string }) => renderLabel(Paths.Settings, color),
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <UserRound color={color} size={size} />
                    ),
                }}
            />

        </Tab.Navigator>
    );
};

export default BottomNavigator;

const styles = StyleSheet.create({
    bottomBarWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 16,
        paddingHorizontal: 12,
    },
    bottomBar: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 24,
        borderWidth: 1,
        alignSelf: 'center',
        alignItems: 'center',
        width: '92%',
        justifyContent: 'space-between',
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    sideGroup: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    fillerSpace: {
        width: 72,
    },
    centerButton: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 6,
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    centerButtonInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontWeight: '600',
        fontSize: 12,
    },
});