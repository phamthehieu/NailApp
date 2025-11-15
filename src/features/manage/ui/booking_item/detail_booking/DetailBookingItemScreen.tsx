import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootScreenProps } from '@/app/navigation/types';
import { Paths } from '@/app/navigation/paths';
import MHeader from '@/shared/ui/MHeader';
import { Colors, useAppTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { ArrowLeft } from 'lucide-react-native';
import TabComponent from '@/shared/ui/TabComponent';
import BookingInformationComponent from './BookingInformationComponent';
import HistoryBookingComponent from './HistoryBookingComponent';
import { Button } from '@/shared/ui/Button';
import { alertService } from '@/services/alertService';
import { useAppSelector } from '@/app/store';

type TabType = { label: string; value: number }

const DetailBookingItem = ({ navigation, route }: RootScreenProps<Paths.DetailBookingItem>) => {
    const { bookingId } = route.params;
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const { detailBookingItem } = useAppSelector((state) => state.booking);
    const tab1Opacity = useRef(new Animated.Value(1)).current;
    const tab1TranslateX = useRef(new Animated.Value(0)).current;
    const tab2Opacity = useRef(new Animated.Value(0)).current;
    const tab2TranslateX = useRef(new Animated.Value(50)).current;

    const [activeTab, setActiveTab] = useState<TabType>({ label: t('calenderDashboard.calenderTab.schedule'), value: 1 });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Chờ xác nhận":
                return colors.blue;
            case "Đã xác nhận":
                return colors.yellow;
            case "Đang thực hiện":
                return colors.purple;
            case "Đã hoàn thành":
                return colors.green;
            case "Hoàn tất":
                return colors.green;
            case "Đã hủy":
                return colors.red;
            default:
                return colors.yellow;
        }
    };

    const statusColor = detailBookingItem ? getStatusColor(detailBookingItem.statusObj?.name) : colors.yellow;

    const handleCancelBooking = () => {
        alertService.showAlert({
            title: t('detailBookingItem.deleteBooking.title'),
            message: t('detailBookingItem.deleteBooking.message'),
            typeAlert: 'Delete',
            okText: t('detailBookingItem.deleteBooking.okText'),
            cancelText: t('detailBookingItem.deleteBooking.cancelText'),
            onConfirm: () => {
                console.log('Cancel booking:', bookingId);
            },
            onCancel: () => {
                console.log('Cancel booking:', bookingId);
            },
        });
    };

    const handleEditBooking = () => {
        console.log('Edit booking:', bookingId);
    };

    useEffect(() => {
        if (activeTab.value === 1) {
            // Tab 1 (Calendar) hiển thị
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
    }, [activeTab.value]);
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('detailBookingItem.title')}
                showIconLeft={true}
                iconLeft={<ArrowLeft size={24} color={colors.background} />}
                onBack={() => navigation.goBack()}
                bgColor={colors.yellow}
                status={detailBookingItem?.statusObj?.name}
                statusColor={statusColor}
                statusBgColor={colors.yellow}
            />

            <TabComponent activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} tabs={[{ label: t('detailBookingItem.tab.schedule'), value: 1 }, { label: t('detailBookingItem.tab.history'), value: 2 }]} showBookButton={false} />


            <View style={styles.tabsWrapper}>
                <Animated.View
                    style={[
                        styles.tabContainer,
                        {
                            opacity: tab2Opacity,
                            transform: [{ translateX: tab2TranslateX }],
                        },
                    ]}
                    pointerEvents={activeTab.value === 2 ? 'auto' : 'none'}
                >
                    <View style={styles.content}>
                        <HistoryBookingComponent bookingId={bookingId} />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.tabContainer,
                        {
                            opacity: tab1Opacity,
                            transform: [{ translateX: tab1TranslateX }],
                        },
                    ]}
                    pointerEvents={activeTab.value === 1 ? 'auto' : 'none'}
                >
                    <View style={styles.content}>
                        <BookingInformationComponent bookingId={bookingId} />
                    </View>
                </Animated.View>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    text={t('detailBookingItem.cancelBooking')}
                    preset="default"
                    onPress={handleCancelBooking}
                    style={[styles.button, styles.cancelButton]}
                    textStyle={styles.cancelButtonText}
                />
                <Button
                    text={t('detailBookingItem.editBooking')}
                    preset="filled"
                    onPress={handleEditBooking}
                    style={[styles.button, styles.editButton]}
                    textStyle={styles.editButtonText}
                />
                <Button
                    text={t('detailBookingItem.editBooking')}
                    preset="filled"
                    onPress={handleEditBooking}
                    style={[styles.button, styles.editButton]}
                    textStyle={styles.editButtonText}
                />
            </View>

        </SafeAreaView>
    )
}

const $styles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tabContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    tabsWrapper: {
        flex: 1,
        position: 'relative',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 16,
        gap: 12,
        backgroundColor: colors.background,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
    button: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
    },
    cancelButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.red,
    },
    cancelButtonText: {
        color: colors.red,
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: colors.yellow,
    },
    editButtonText: {
        color: colors.black,
        fontWeight: '600',
    },
});

export default DetailBookingItem;