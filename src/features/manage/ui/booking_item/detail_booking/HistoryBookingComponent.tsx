import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { User, Phone, Calendar } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { TextFieldLabel } from "@/shared/ui/Text";
import { scheduleItemsList } from "@/features/manage/data/scheduleItems";

interface HistoryBookingComponentProps {
    bookingId?: number | string;
}

const HistoryBookingComponent = ({ bookingId }: HistoryBookingComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();

    const booking = useMemo(() => {
        if (!bookingId) return null;
        return scheduleItemsList.find(item => item.id === bookingId);
    }, [bookingId]);


    const historyBookings = useMemo(() => {
        if (!booking) return [];

        return scheduleItemsList
            .filter(item => 
                (item.user === booking.user || item.phone === booking.phone) &&
                (item.status === "Đã hoàn thành" || item.status === "Hoàn tất")
            )
            .sort((a, b) => {
                // Sắp xếp theo ngày giảm dần (mới nhất trước)
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
            });
    }, [booking]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (dateString: string, time: string, endTime?: string) => {
        const date = formatDate(dateString);
        const timeStr = endTime ? `${time} - ${endTime}` : time;
        return `${date} ${timeStr}`;
    };

    if (!booking) {
        return (
            <View style={styles.container}>
                <TextFieldLabel style={styles.emptyText}>{t('bookingInformation.noData')}</TextFieldLabel>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Thông tin khách hàng */}
            <View style={styles.section}>
                <TextFieldLabel style={styles.sectionTitle}>{t('bookingInformation.customerInfo')}</TextFieldLabel>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <User size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.customerName')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>{booking.user || '-'}</TextFieldLabel>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Phone size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.phone')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>{booking.phone || '-'}</TextFieldLabel>
                    </View>
                </View>
            </View>

            {/* Lịch sử sử dụng dịch vụ */}
            <View style={styles.section}>
                <TextFieldLabel style={styles.sectionTitle}>{t('historyBooking.serviceHistory')}</TextFieldLabel>
                <View style={styles.card}>
                    {historyBookings.length === 0 ? (
                        <TextFieldLabel style={styles.emptyHistoryText}>{t('historyBooking.noHistory')}</TextFieldLabel>
                    ) : (
                        historyBookings.map((item, index) => (
                            <View key={item.id || index} style={[styles.historyItem, index < historyBookings.length - 1 && styles.historyItemBorder]}>
                                <View style={styles.historyRow}>
                                    <Calendar size={20} color={colors.yellow} />
                                    <View style={styles.historyContent}>
                                        <TextFieldLabel style={styles.historyDateTime}>
                                            {item.date && item.time 
                                                ? formatDateTime(item.date, item.time, item.endTime)
                                                : '-'
                                            }
                                        </TextFieldLabel>
                                        <TextFieldLabel style={styles.historyService}>
                                            {item.note || item.service || '-'}
                                            {item.staff && ` - ${item.staff}`}
                                        </TextFieldLabel>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </View>
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
});

export default HistoryBookingComponent;