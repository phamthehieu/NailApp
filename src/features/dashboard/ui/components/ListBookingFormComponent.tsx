import React, { useState, useCallback, useRef, useMemo } from "react";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, useWindowDimensions } from "react-native";
import { User, MoreHorizontal } from "lucide-react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { useAppTheme } from "@/shared/theme";
import type { Colors } from "@/shared/theme";
import { AutoImage } from "@/shared/ui/AutoImage";
import { useTranslation } from "react-i18next";
import { RootScreenProps } from "@/app/providers/navigation/types";
import { Paths } from "@/app/providers/navigation/paths";
import { alertService } from "@/services/alertService";
import { useAppSelector } from "@/app/store";
import { BookingManagerItem, ServiceItem } from "@/features/manage/api/types";
import Loader from "@/shared/ui/Loader";
import { getBookingStatusColor } from "@/features/manage/utils/bookingStatusColor";
import type { DashBoardHookResult } from "../../hooks/useDashBoardHook";
interface ListBookingFormProps {
    navigation: RootScreenProps<Paths.DashBoard>['navigation'];
    dashboardHook: DashBoardHookResult;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

interface BookingServiceFlatItem {
    key: string;
    booking: BookingManagerItem;
    service: ServiceItem | null;
}

const ListBookingFormComponent = ({ navigation, dashboardHook, onScroll }: ListBookingFormProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    const isSmallScreen = screenWidth < 400;
    const styles = useMemo(
        () => $styles(colors, { isSmallScreen, isLandscape }),
        [colors, isSmallScreen, isLandscape],
    );
    const { t, i18n } = useTranslation();
    const { getListBookingByDashBoard, loadMoreBookings, loading, loadingMore, staffId } = dashboardHook;
    const { listBookingManager, pageIndex, totalPages } = useAppSelector((state) => state.booking);

    const [refreshing, setRefreshing] = useState(false);
    const isLoadingMoreRef = useRef(false);

    const formatBookingDateTime = useCallback((dateString: string, timeString?: string) => {
        let dateLabel = dateString;
        const dateLocale = i18n.language === 'vi' ? 'vi-VN' : 'en-AU';
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                dateLabel = new Intl.DateTimeFormat(dateLocale, {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                }).format(date);
            }
        } catch {
        }

        const timeLabel = timeString?.trim() ?? '';
        return { dateLabel, timeLabel };
    }, [i18n.language]);

    const getCustomerInitials = useCallback((name: string) => {
        if (!name) {
            return '';
        }
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) {
            return '';
        }
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }, []);

    const serviceBookings = useMemo<BookingServiceFlatItem[]>(() => {
        if (!listBookingManager?.length) {
            return [];
        }

        const filterByStaff = typeof staffId === 'number';

        return listBookingManager.flatMap((booking): BookingServiceFlatItem[] => {
            if (!booking.services || booking.services.length === 0) {
                if (filterByStaff) {
                    return [];
                }
                return [{
                    key: `${booking.id}-booking`,
                    booking,
                    service: null,
                }];
            }

            const filteredServices = filterByStaff
                ? booking.services.filter((service) => service.staff?.id === staffId)
                : booking.services;

            if (!filteredServices.length) {
                return [];
            }

            return filteredServices.map((service, index) => ({
                key: `${booking.id}-${service.id ?? 'service'}-${index}`,
                booking,
                service,
            }));
        });
    }, [listBookingManager, staffId]);

    const formatPrice = useCallback((price?: number | null) => {
        if (price === null || price === undefined) {
            return '0 pts';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    }, []);

    const renderBookingItem = useCallback(({ item }: { item: BookingServiceFlatItem }) => {
        const { booking, service } = item;
        const statusColor = getBookingStatusColor(booking.status, colors, 'border');
        const { dateLabel, timeLabel } = formatBookingDateTime(booking.bookingDate, booking.bookingHours);
        const initials = getCustomerInitials(booking.customer?.name ?? '');
        const staffName = service?.staff?.displayName || service?.staff?.username;
        const staffLabel = `W/ ${staffName || t('bookingList.unassignedStaff', { defaultValue: '--' })}`;
        const serviceName = service?.serviceName || booking.description || t('bookingList.noServiceName', { defaultValue: '--' });
        const bookingDescription = booking.description && booking.description !== serviceName ? booking.description : '';
        const priceLabel = formatPrice(service?.price);

        return (
            <View style={styles.bookingRow}>
                <View style={styles.dateContainer}>
                    <TextFieldLabel style={styles.dateLabel}>{dateLabel}</TextFieldLabel>
                    {!!timeLabel && <TextFieldLabel style={styles.timeLabel}>{timeLabel}</TextFieldLabel>}
                </View>

                <View style={[styles.avatarWrapper, { borderColor: statusColor }]}>
                    {initials ? (
                        <TextFieldLabel style={styles.avatarInitials}>{initials}</TextFieldLabel>
                    ) : (
                        <User size={18} color={colors.text} />
                    )}
                </View>

                <View style={styles.detailContainer}>
                    <TextFieldLabel style={styles.customerName}>{booking.customer?.name}</TextFieldLabel>
                    <TextFieldLabel style={styles.phoneNumber}>{booking.customer?.phoneNumber}</TextFieldLabel>
                    <TextFieldLabel style={styles.staffText}>{staffLabel}</TextFieldLabel>
                </View>

                <View style={styles.serviceContainer}>
                    <TextFieldLabel style={styles.serviceText} numberOfLines={2}>{serviceName}</TextFieldLabel>
                    {!!bookingDescription && (
                        <TextFieldLabel style={styles.serviceSubText} numberOfLines={1}>{bookingDescription}</TextFieldLabel>
                    )}
                </View>

                <View style={styles.pointsContainer}>
                    <TextFieldLabel style={styles.pointsText}>{priceLabel}</TextFieldLabel>
                    {/* <TouchableOpacity style={styles.moreButton} onPress={() => { }}>
                        <MoreHorizontal size={20} color={colors.text} />
                    </TouchableOpacity> */}
                </View>
            </View>
        );
    }, [colors, t, formatBookingDateTime, getCustomerInitials, formatPrice]);

    const handleLoadMore = useCallback(() => {
        if (isLoadingMoreRef.current || loadingMore || loading) {
            return;
        }

        const canLoadMore = totalPages > 0 && pageIndex < totalPages;

        if (canLoadMore) {
            isLoadingMoreRef.current = true;
            loadMoreBookings()
                .catch((error) => {
                    alertService.showAlert({
                        title: t('bookingList.errorTitle'),
                        message: t('bookingList.errorMessage'),
                        typeAlert: 'Error',
                        onConfirm: () => { },
                    });
                })
                .finally(() => {
                    isLoadingMoreRef.current = false;
                });
        }
    }, [loadingMore, loading, pageIndex, totalPages, loadMoreBookings, t]);

    const hasMoreData = useMemo(() => totalPages > 0 && pageIndex < totalPages, [totalPages, pageIndex]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await getListBookingByDashBoard();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, [getListBookingByDashBoard]);

    const refreshControl = useMemo(() => (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.yellow]}
            tintColor={colors.yellow}
        />
    ), [refreshing, onRefresh, colors.yellow]);

    const ListEmptyComponentMemo = useMemo(() => (
        <View style={styles.emptyContainer}>
            <AutoImage source={require('@assets/icon/no_data.png')} style={styles.emptyImage} />
            <TextFieldLabel style={styles.emptyText}>{t('bookingList.noBookingFound')}</TextFieldLabel>
        </View>
    ), [styles.emptyContainer, styles.emptyImage, styles.emptyText, t]);

    const ListFooterComponentMemo = useMemo(() => {
        if (!loadingMore || !hasMoreData) return null;
        return (
            <View style={styles.footerLoader}>
                <TextFieldLabel style={styles.footerText}>{t('bookingList.loadingMore')}</TextFieldLabel>
            </View>
        );
    }, [loadingMore, hasMoreData, styles.footerLoader, styles.footerText, t]);

    const keyExtractor = useCallback((item: BookingServiceFlatItem) => item.key, []);

    return (
        <>
            <FlatList
                data={serviceBookings}
                keyExtractor={keyExtractor}
                renderItem={renderBookingItem}
                numColumns={1}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
                refreshControl={refreshControl}
                ListEmptyComponent={ListEmptyComponentMemo}
                ListFooterComponent={ListFooterComponentMemo}
            />

            {/* <BookingConfirmationModal
                visible={isBookingConfirmationModalVisible}
                onClose={() => setIsBookingConfirmationModalVisible(false)}
                onConfirm={() => { }}
            />

            <CheckinBookingModal
                visible={isCheckinBookingModalVisible}
                onClose={() => setIsCheckinBookingModalVisible(false)}
                onConfirm={() => { }}
            />

            <BookingPaymentModal
                visible={isBookingPaymentModalVisible}
                onClose={() => setIsBookingPaymentModalVisible(false)}
                onConfirm={() => { }}
            /> */}
            <Loader loading={loading} title={t('bookingList.loading')} />
        </>
    );
};

const $styles = (colors: Colors, opts: { isSmallScreen: boolean; isLandscape: boolean }) =>
    StyleSheet.create({
        listContainer: {
            paddingHorizontal: 12,
            paddingBottom: 32,
        },
        bookingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
            paddingVertical: opts.isLandscape ? 10 : (opts.isSmallScreen ? 12 : 16),
            paddingHorizontal: opts.isSmallScreen ? 4 : 0,
            gap: opts.isSmallScreen ? 4 : 12,
        },
        dateContainer: {
            width: opts.isSmallScreen ? 85 : (opts.isLandscape ? 110 : 140),
            flexShrink: 0,
        },
        dateLabel: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '600',
        },
        timeLabel: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.7,
            marginTop: 4,
        },
        avatarWrapper: {
            width: opts.isSmallScreen ? 40 : (opts.isLandscape ? 40 : 48),
            height: opts.isSmallScreen ? 40 : (opts.isLandscape ? 40 : 48),
            borderRadius: opts.isSmallScreen ? 20 : (opts.isLandscape ? 20 : 24),
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
            flexShrink: 0,
        },
        avatarInitials: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        detailContainer: {
            flex: 1,
            minWidth: opts.isSmallScreen ? 70 : (opts.isLandscape ? 90 : 120),
            flexShrink: 1,
            maxWidth: opts.isSmallScreen ? 100 : undefined,
        },
        customerName: {
            fontSize: opts.isSmallScreen ? 13 : (opts.isLandscape ? 14 : 15),
            fontWeight: '600',
            color: colors.text,
        },
        phoneNumber: {
            fontSize: opts.isSmallScreen ? 11 : (opts.isLandscape ? 12 : 13),
            color: colors.text,
            marginTop: 2,
            opacity: 0.7,
        },
        staffText: {
            fontSize: opts.isSmallScreen ? 11 : (opts.isLandscape ? 12 : 13),
            color: colors.text,
            marginTop: 2,
        },
        serviceContainer: {
            flex: 1,
            paddingHorizontal: opts.isSmallScreen ? 4 : (opts.isLandscape ? 6 : 8),
            flexShrink: 1,
            minWidth: opts.isSmallScreen ? 60 : (opts.isLandscape ? 80 : 100),
            maxWidth: opts.isSmallScreen ? 100 : undefined,
        },
        serviceText: {
            fontSize: opts.isLandscape ? 13 : 14,
            color: colors.text,
            fontWeight: '600',
        },
        serviceSubText: {
            fontSize: opts.isLandscape ? 12 : 13,
            color: colors.text,
            opacity: 0.8,
            marginTop: 4,
        },
        pointsContainer: {
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: opts.isSmallScreen ? 70 : (opts.isLandscape ? 76 : 80),
            flexShrink: 0,
            flexGrow: 0,
        },
        pointsText: {
            fontSize: opts.isSmallScreen ? 12 : (opts.isLandscape ? 13 : 14),
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'right',
        },
        moreButton: {
            padding: 6,
            borderRadius: 12,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 16,
            color: colors.text,
        },
        emptyImage: {
            width: 100,
            height: 100,
            marginBottom: 16,
        },
        footerLoader: {
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        footerText: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.6,
        },
    });

export default ListBookingFormComponent;
