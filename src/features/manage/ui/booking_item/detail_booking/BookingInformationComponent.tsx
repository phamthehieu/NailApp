import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { User, Phone, Calendar, Clock, Info } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { TextFieldLabel } from "@/shared/ui/Text";
import { scheduleItemsList } from "@/features/manage/data/scheduleItems";
import { useAppSelector } from "@/app/store";

interface BookingInformationComponentProps {
    bookingId?: number | string;
}

const BookingInformationComponent = ({ bookingId }: BookingInformationComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const { detailBookingItem } = useAppSelector((state) => state.booking);

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

    if (!detailBookingItem) {
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
                        <TextFieldLabel style={styles.infoValue}>{detailBookingItem.customer.name || '-'}</TextFieldLabel>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Phone size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.phone')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>{detailBookingItem.customer.phoneNumber || '-'}</TextFieldLabel>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <TextFieldLabel style={styles.sectionTitle}>{t('bookingInformation.bookingInfo')}</TextFieldLabel>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Calendar size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.bookingDate')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>{detailBookingItem.bookingDate ? formatDate(detailBookingItem.bookingDate) : '-'}</TextFieldLabel>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Clock size={20} color={colors.yellow} />
                            <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.bookingTime')}</TextFieldLabel>
                        </View>
                        <TextFieldLabel style={styles.infoValue}>
                            {detailBookingItem.bookingHours ? formatTime(detailBookingItem.bookingHours) : '-'}
                        </TextFieldLabel>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <TextFieldLabel style={styles.sectionTitle}>{t('bookingInformation.serviceInfo')}</TextFieldLabel>
                {detailBookingItem.services.map((service, index) => (
                    <View key={service.id} style={[styles.card, {marginBottom: 16}]}>
                        <>
                            <View key={index} style={styles.infoRow}>
                                <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.serviceName')}</TextFieldLabel>
                                <TextFieldLabel style={styles.infoValue}>{service.serviceName || '-'}</TextFieldLabel>
                            </View>
                            <View style={styles.infoRow}>
                                <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.price')}</TextFieldLabel>
                                <TextFieldLabel style={styles.infoValue}>{service.price || '-'}</TextFieldLabel>
                            </View>
                            <View style={styles.infoRow}>
                                <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.serviceTime')}</TextFieldLabel>
                                <TextFieldLabel style={styles.infoValue}>{service.serviceTime || '-'} {t('bookingInformation.minutes')}</TextFieldLabel>
                            </View>
                            <View style={styles.infoRow}>
                                <TextFieldLabel style={styles.infoLabel}>{t('bookingInformation.staff')}</TextFieldLabel>
                                <TextFieldLabel style={styles.infoValue}>{service.staff?.displayName || '-'}</TextFieldLabel>
                            </View>
                        </>
                    </View>
                ))}

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