import React, { useMemo, useRef, useCallback } from "react";
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { User, Phone, Calendar } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { TextFieldLabel } from "@/shared/ui/Text";
import { useAppSelector } from "@/app/store";
import { useBookingForm } from "@/features/manage/hooks/useBookingForm";
import Loader from "@/shared/ui/Loader";

interface HistoryBookingComponentProps {
    bookingId?: number | string;
}

const HistoryBookingComponent = ({ bookingId }: HistoryBookingComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const { historyBookingItem, detailBookingItem } = useAppSelector((state) => state.booking);
    const { loadMoreHistoryBookings, loadingMore } = useBookingForm();
    const scrollViewRef = useRef<ScrollView>(null);

    const customer = detailBookingItem?.customer;

    const historyBookings = useMemo(() => {
        if (!historyBookingItem?.items || historyBookingItem.items.length === 0) return [];

        return [...historyBookingItem.items]
            .sort((a, b) => {
                const dateA = new Date(a.dateUsed).getTime();
                const dateB = new Date(b.dateUsed).getTime();
                return dateB - dateA;
            });
    }, [historyBookingItem]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const calculateEndTime = (startDate: string, serviceTimeMinutes: number) => {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(startDateObj.getTime() + serviceTimeMinutes * 60000);
        return formatTime(endDateObj.toISOString());
    };

    const formatDateTime = (dateString: string, serviceTimeMinutes: number) => {
        const date = formatDate(dateString);
        const startTime = formatTime(dateString);
        const endTime = calculateEndTime(dateString, serviceTimeMinutes);
        return `${date} ${startTime} - ${endTime}`;
    };

    const hasMorePages = useMemo(() => {
        if (!historyBookingItem) return false;
        const currentPageIndex = historyBookingItem.pageIndex || 0;
        const totalPages = historyBookingItem.totalPages || 0;
        return currentPageIndex < totalPages - 1;
    }, [historyBookingItem]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {

        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

        if (isCloseToBottom && hasMorePages && !loadingMore && customer?.id) {
            loadMoreHistoryBookings(customer.id.toString());
        }
    }, [hasMorePages, loadingMore, customer?.id, loadMoreHistoryBookings]);

    if (!customer) {
        return (
            <View style={styles.container}>
                <TextFieldLabel style={styles.emptyText}>{t('bookingInformation.noData')}</TextFieldLabel>
            </View>
        );
    }

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={400}
        >
            <View style={styles.section}>
                <TextFieldLabel style={styles.sectionTitle}>{t('bookingInformation.customerInfo')}</TextFieldLabel>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <User size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.customerName')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>{customer.name || '-'}</TextFieldLabel>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Phone size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.phone')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>{customer.phoneNumber || '-'}</TextFieldLabel>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <TextFieldLabel style={styles.sectionTitle}>{t('historyBooking.serviceHistory')}</TextFieldLabel>
                <View style={styles.card}>
                    {historyBookings.length === 0 ? (
                        <TextFieldLabel style={styles.emptyHistoryText}>{t('historyBooking.noHistory')}</TextFieldLabel>
                    ) : (
                        historyBookings.map((item, index) => (
                            <View key={`${item.id}-${item.dateUsed}-${index}`} style={[styles.historyItem, index < historyBookings.length - 1 && styles.historyItemBorder]}>
                                <View style={styles.historyRow}>
                                    <Calendar size={20} color={colors.yellow} />
                                    <View style={styles.historyContent}>
                                        <TextFieldLabel style={styles.historyDateTime}>
                                            {item.dateUsed
                                                ? formatDateTime(item.dateUsed, item.serviceTime)
                                                : '-'
                                            }
                                        </TextFieldLabel>
                                        <TextFieldLabel style={styles.historyService}>
                                            {item.serviceName || '-'}
                                            {item.staff?.displayName && ` - ${item.staff.displayName}`}
                                        </TextFieldLabel>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </View>

            <Loader loading={loadingMore} />
        </ScrollView>
    );
};

const $styles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.text,
        marginLeft: 12,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        textAlign: 'right',
        flexShrink: 0,
        marginLeft: 12,
    },
    historyItem: {
        marginBottom: 16,
    },
    historyItemBorder: {
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    historyContent: {
        flex: 1,
        marginLeft: 12,
    },
    historyDateTime: {
        fontSize: 14,
        color: colors.placeholderTextColor,
        marginBottom: 4,
    },
    historyService: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
        marginLeft: 0,
        paddingLeft: 4,
    },
    emptyText: {
        fontSize: 16,
        color: colors.placeholderTextColor,
        textAlign: 'center',
        marginTop: 32,
    },
    emptyHistoryText: {
        fontSize: 14,
        color: colors.placeholderTextColor,
        textAlign: 'center',
        paddingVertical: 16,
    },
    loadingContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
});

export default HistoryBookingComponent;