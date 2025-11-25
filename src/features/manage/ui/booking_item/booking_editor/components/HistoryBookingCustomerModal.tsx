import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";
import { X } from "lucide-react-native";
import Modal from "@/shared/ui/Modal";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/store";
import { HistoryBookingItem } from "@/features/manage/api/types";

interface HistoryBookingCustomerModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const HistoryBookingCustomerModal = ({ isVisible, onClose }: HistoryBookingCustomerModalProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = useMemo(() => $styles(colors), [colors]);
    const { t } = useTranslation();
    const { historyBookingItem } = useAppSelector((state) => state.booking);

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onHide={onClose}
            contentStyle={styles.modalWrapper}
        >
            <View style={styles.card}>
                <View style={styles.header}>
                    <View>
                        <TextFieldLabel style={styles.title}>{t('historyBooking.serviceHistory')}</TextFieldLabel>
                        <TextFieldLabel style={styles.subtitle}>{t('historyBooking.viewAllServiceHistory')}</TextFieldLabel>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={8}>
                        <X size={18} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tableHeader}>
                    <TextFieldLabel style={[styles.headerText, styles.colIndex]}>{t('historyBooking.index')}</TextFieldLabel>
                    <TextFieldLabel style={[styles.headerText, styles.colService]}>{t('historyBooking.service')}</TextFieldLabel>
                    <TextFieldLabel style={[styles.headerText, styles.colTime]}>{t('historyBooking.time')}</TextFieldLabel>
                    <TextFieldLabel style={[styles.headerText, styles.colStaff]}>{t('historyBooking.employee')}</TextFieldLabel>
                </View>

                <ScrollView style={styles.tableBody} bounces={false}>
                    {historyBookingItem?.items.map((item: HistoryBookingItem, index: number) => {
                        const rowKey = item.id !== undefined && item.id !== null ? `${item.id}-${index}` : `history-item-${index}`;
                        return (
                        <View key={rowKey} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                            <TextFieldLabel style={[styles.cellText, styles.colIndex]}>{index + 1}</TextFieldLabel>
                            <TextFieldLabel style={[styles.cellText, styles.colService]} numberOfLines={2}>
                                {item.serviceName}
                            </TextFieldLabel>
                            <View style={[styles.colTime, styles.cellTime]}>
                                <TextFieldLabel style={styles.cellText}>{formatDate(item.dateUsed)}</TextFieldLabel>
                            </View>
                            <TextFieldLabel style={[styles.cellText, styles.colStaff]} numberOfLines={2}>
                                {item.staff?.displayName}
                            </TextFieldLabel>
                        </View>
                    )})}
                </ScrollView>
            </View>
        </Modal>
    );
};

const formatDate = (value: string) => {
    try {
        const date = new Date(value);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return value;
    }
};

const $styles = (colors: Colors) =>
    StyleSheet.create({
        modalWrapper: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
        },
        card: {
            width: "100%",
            maxWidth: 520,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
        },
        title: {
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
        },
        subtitle: {
            marginTop: 6,
            color: colors.placeholderTextColor,
            fontSize: 14,
        },
        closeButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.backgroundDisabled,
        },
        tableHeader: {
            flexDirection: "row",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: colors.borderTable,
        },
        headerText: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
        },
        tableBody: {
            marginTop: 8,
            maxHeight: 320,
        },
        tableRow: {
            flexDirection: "row",
            paddingVertical: 14,
            paddingHorizontal: 16,
            alignItems: "center",
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
        },
        tableRowAlt: {
            backgroundColor: colors.backgroundDisabled,
        },
        colIndex: {
            width: 50,
        },
        colService: {
            flex: 1.3,
        },
        colTime: {
            flex: 1.1,
        },
        colStaff: {
            flex: 1.2,
            textAlign: "right",
        },
        cellText: {
            color: colors.text,
            fontSize: 14,
        },
        cellSubText: {
            color: colors.placeholderTextColor,
            fontSize: 13,
            marginTop: 4,
        },
        cellTime: {
            justifyContent: "center",
        },
    });

export default HistoryBookingCustomerModal;