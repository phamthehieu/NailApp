import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { User, Phone, Calendar, Clock, Info } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/ui/Text";
import { scheduleItemsList } from "@/features/manage/data/scheduleItems";

interface BookingInformationComponentProps {
    bookingId?: number | string;
}

const BookingInformationComponent = ({ bookingId }: BookingInformationComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();

    const booking = useMemo(() => {
        if (!bookingId) return null;
        return scheduleItemsList.find(item => item.id === bookingId);
    }, [bookingId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (time: string, endTime?: string) => {
        if (endTime) {
            return `${time} - ${endTime}`;
        }
        return time;
    };

    if (!booking) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>{t('bookingInformation.noData')}</Text>
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
                <Text style={styles.sectionTitle}>{t('bookingInformation.customerInfo')}</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <User size={20} color={colors.yellow} />
                            <Text style={styles.infoLabel}>{t('bookingInformation.customerName')}</Text>
                        </View>
                        <Text style={styles.infoValue}>{booking.user || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Phone size={20} color={colors.yellow} />
                            <Text style={styles.infoLabel}>{t('bookingInformation.phone')}</Text>
                        </View>
                        <Text style={styles.infoValue}>{booking.phone || '-'}</Text>
                    </View>
                </View>
            </View>

            {/* Thông tin đặt lịch */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('bookingInformation.bookingInfo')}</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Calendar size={20} color={colors.yellow} />
                            <Text style={styles.infoLabel}>{t('bookingInformation.bookingDate')}</Text>
                        </View>
                        <Text style={styles.infoValue}>{booking.date ? formatDate(booking.date) : '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Clock size={20} color={colors.yellow} />
                            <Text style={styles.infoLabel}>{t('bookingInformation.bookingTime')}</Text>
                        </View>
                        <Text style={styles.infoValue}>
                            {booking.time ? formatTime(booking.time, booking.endTime) : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Info size={20} color={colors.yellow} />
                            <Text style={styles.infoLabel}>{t('bookingInformation.service')}</Text>
                        </View>
                        <View style={styles.infoValueRight}>
                            <Text style={styles.infoValue}>{booking.note || booking.service || '-'}</Text>
                            {booking.duration && (
                                <Text style={styles.infoSubValue}>{booking.duration}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <User size={20} color={colors.yellow} />
                            <Text style={styles.infoLabel}>{t('bookingInformation.staff')}</Text>
                        </View>
                        <Text style={styles.infoValue}>{booking.staff || '-'}</Text>
                    </View>
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
    infoValueRight: {
        alignItems: 'flex-end',
        flexShrink: 0,
        marginLeft: 12,
    },
    infoSubValue: {
        fontSize: 12,
        color: colors.placeholderTextColor,
        marginTop: 4,
    },
    emptyText: {
        fontSize: 16,
        color: colors.placeholderTextColor,
        textAlign: 'center',
        marginTop: 32,
    },
});

export default BookingInformationComponent;