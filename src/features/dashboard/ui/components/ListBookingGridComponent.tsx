import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Dimensions } from "react-native";
import { User, MoreHorizontal, ChevronDown } from "lucide-react-native";
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
import { getLocalizedBookingStatusName } from "@/features/manage/utils/bookingStatusLabel";
import type { DashBoardHookResult } from "../../hooks/useDashBoardHook";
import { isTablet } from "@/shared/lib/useIsTablet";
interface ListBookingFormProps {
    navigation: RootScreenProps<Paths.DashBoard>['navigation'];
    dashboardHook: DashBoardHookResult;
}

interface BookingServiceFlatItem {
    key: string;
    booking: BookingManagerItem;
    service: ServiceItem | null;
}

const ListBookingGridComponent = ({ navigation, dashboardHook }: ListBookingFormProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t, i18n } = useTranslation();
    const { getListBookingByDashBoard, loadMoreBookings, loading, loadingMore, staffId } = dashboardHook;
    const { listBookingManager, pageIndex, totalPages } = useAppSelector((state) => state.booking);

    const [refreshing, setRefreshing] = useState(false);
    const isLoadingMoreRef = useRef(false);
    const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

    const formatBookingDateTime = (dateString: string, timeString?: string) => {
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
    };

    const getCustomerInitials = (name: string) => {
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
    };

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
                key: `${booking.id}-${service.id ?? index}`,
                booking,
                service,
            }));
        });
    }, [listBookingManager, staffId]);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const isLandscape = dimensions.width > dimensions.height;
    const numColumns = isTablet() && isLandscape ? 3 : 1;
    const screenWidth = dimensions.width;
    const paddingHorizontal = 16 * 2;
    const gap = 12;
    const itemWidth = numColumns > 1
        ? (screenWidth - paddingHorizontal - gap * (numColumns - 1)) / numColumns
        : screenWidth - paddingHorizontal;

    const renderBookingItem = ({ item }: { item: BookingServiceFlatItem }) => {
        const { booking, service } = item;
        const statusColor = getBookingStatusColor(booking.status, colors, 'border');
        const { dateLabel, timeLabel } = formatBookingDateTime(booking.bookingDate, booking.bookingHours);
        const initials = getCustomerInitials(booking.customer?.name ?? '');
        const staffName = service?.staff?.displayName || service?.staff?.username;
        const staffLabel = `W/ ${staffName || t('bookingList.unassignedStaff', { defaultValue: '--' })}`;
        const serviceName = service?.serviceName || booking.description || t('bookingList.noServiceName', { defaultValue: '--' });
        const bookingDescription = booking.description && booking.description !== serviceName ? booking.description : '';
        const statusLabel = getLocalizedBookingStatusName(booking.status, booking.statusObj?.name, t);
        return (
            <View style={[styles.bookingCard, { borderColor: statusColor, width: itemWidth }]}>
                <View style={styles.cardHeader}>
                    <View>
                        <TextFieldLabel style={styles.headerDate}>{dateLabel}</TextFieldLabel>
                        {!!timeLabel && <TextFieldLabel style={styles.headerTime}>{timeLabel}</TextFieldLabel>}
                    </View>

                    <View style={styles.assignmentButton}>
                        <View style={[styles.statusBadge, { borderColor: statusColor, borderWidth: 1 }]}>
                            <TextFieldLabel style={[styles.statusText, { color: statusColor }]}>{statusLabel}</TextFieldLabel>
                        </View>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={[styles.avatarWrapper, { borderColor: statusColor }]}>
                        {initials ? (
                            <TextFieldLabel style={styles.avatarInitials}>{initials}</TextFieldLabel>
                        ) : (
                            <User size={18} color={colors.text} />
                        )}
                    </View>

                    <View style={styles.detailContainer}>
                        <TextFieldLabel style={styles.customerName}>{booking.customer?.name || t('bookingList.emptyName', { defaultValue: '--' })}</TextFieldLabel>
                        <TextFieldLabel style={styles.phoneNumber}>{booking.customer?.phoneNumber || t('bookingList.emptyPhone', { defaultValue: '--' })}</TextFieldLabel>
                        <TextFieldLabel style={styles.staffText}>{staffLabel}</TextFieldLabel>
                    </View>

                    {/* <View style={styles.pointsBadge}>
                        <TextFieldLabel style={styles.pointsText}>{priceLabel}</TextFieldLabel>
                    </View> */}
                </View>

                <View style={styles.serviceContainer}>
                    <TextFieldLabel style={styles.serviceText} numberOfLines={2}>{serviceName}</TextFieldLabel>
                    {!!bookingDescription && (
                        <TextFieldLabel style={styles.serviceSubText} numberOfLines={1}>{bookingDescription}</TextFieldLabel>
                    )}
                </View>

                {/* <View style={styles.cardFooter}>
                    <TextFieldLabel style={styles.footerDate}>{footerDate}</TextFieldLabel>
                    <TouchableOpacity style={styles.footerAction} onPress={() => { }}>
                        <MoreHorizontal size={20} color={colors.text} />
                    </TouchableOpacity>
                </View> */}
            </View>
        );
    };

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
    }, [loadingMore, loading, pageIndex, totalPages, loadMoreBookings, listBookingManager.length, getListBookingByDashBoard]);

    const hasMoreData = totalPages > 0 && pageIndex < totalPages;

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

    return (
        <>
            <FlatList
                data={serviceBookings}
                keyExtractor={(item) => item.key}
                renderItem={renderBookingItem}
                numColumns={numColumns}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.yellow]}
                        tintColor={colors.yellow}
                    />
                }
                ListEmptyComponent={

                    <View style={styles.emptyContainer}>

                        <AutoImage source={require('@assets/icon/no_data.png')} style={styles.emptyImage} />

                        <TextFieldLabel style={styles.emptyText}>{t('bookingList.noBookingFound')}</TextFieldLabel>

                    </View>
                }
                ListFooterComponent={
                    loadingMore && hasMoreData ? (
                        <View style={styles.footerLoader}>
                            <TextFieldLabel style={styles.footerText}>{t('bookingList.loadingMore')}</TextFieldLabel>
                        </View>
                    ) : null
                }
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

const $styles = (colors: Colors) =>
    StyleSheet.create({
        listContainer: {
            paddingHorizontal: 16,
            paddingBottom: 32,
            gap: 12,
        },
        bookingCard: {
            margin: 6,
            padding: 16,
            borderRadius: 16,
            borderWidth: StyleSheet.hairlineWidth,
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
            gap: 16,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerDate: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        headerTime: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.7,
            marginTop: 2,
        },
        assignmentButton: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.background,
            gap: 6,
        },
        assignmentText: {
            fontSize: 13,
            color: colors.text,
            fontWeight: '600',
        },
        cardBody: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        avatarWrapper: {
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        avatarInitials: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        detailContainer: {
            flex: 1,
        },
        customerName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        phoneNumber: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.7,
            marginTop: 2,
        },
        staffText: {
            fontSize: 13,
            color: colors.text,
            marginTop: 6,
        },
        pointsBadge: {
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.yellow ? `${colors.yellow}22` : colors.background,
        },
        pointsText: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.yellow ?? colors.text,
        },
        serviceContainer: {
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.background,
        },
        serviceText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        serviceSubText: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.8,
            marginTop: 4,
        },
        cardFooter: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        footerDate: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.8,
        },
        footerAction: {
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
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            minWidth: 100,
            textAlign: "center",
        },
        statusText: {
            color: colors.white,
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
        },
    });

export default ListBookingGridComponent;
