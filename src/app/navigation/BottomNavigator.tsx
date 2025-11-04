import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { ChartLine , Monitor , CalendarCheck , UserRound } from 'lucide-react-native';
import { useAppTheme } from '@/shared/theme';
import { Paths } from '@/app/navigation/paths';
import type { RootStackParamList } from '@/app/navigation/types';
import ManageScreen from '@/features/manage/ui/ManageScreen';
import ReportScreen from '@/features/report/ui/ReportScreen';
import SystemScreen from '@/features/system/ui/SystemScreen';
import AccountScreen from '@/features/account/ui/AccountScreen';
const Tab = createBottomTabNavigator<RootStackParamList>();

const BottomNavigator = () => {
    const { theme: { colors } } = useAppTheme();

    const TAB_TITLES: Record<string, string> = {
        [Paths.Manage]: 'Quản lý',
        [Paths.Report]: 'Báo cáo',
        [Paths.System]: 'Hệ thống',
        [Paths.Account]: 'Tài khoản',
    };

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
                },
            }}
        >
            <Tab.Screen
                name={Paths.Manage}
                component={ManageScreen}
                options={{
                    tabBarLabel: TAB_TITLES[Paths.Manage],
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <CalendarCheck  color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name={Paths.Report}
                component={ReportScreen}
                options={{
                    tabBarLabel: TAB_TITLES[Paths.Report],
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <ChartLine  color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name={Paths.System}
                component={SystemScreen}
                options={{
                    tabBarLabel: TAB_TITLES[Paths.System],
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Monitor  color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name={Paths.Account}
                component={AccountScreen}
                options={{
                    tabBarLabel: TAB_TITLES[Paths.Account],
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <UserRound  color={color} size={size} />
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
    },
});