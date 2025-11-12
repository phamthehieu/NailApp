import React from "react";
import { StyleSheet, View, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from "react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { X, ChevronDown } from "lucide-react-native";
import { Dropdown } from "react-native-element-dropdown";

export type ServiceItem = {
    id: number | string;
    name: string;
    duration: string;
    staff?: string;
};

interface BookingConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    services?: ServiceItem[];
    onStaffChange?: (serviceId: number | string, staff: string) => void;
    staffOptions?: Array<{ label: string; value: string }>;
}

const BookingConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    services = [
        { id: 1, name: "Gỡ sơn gel", duration: "30 phút", staff: "" },
        {id: 2, name: "Sơn gel", duration: "30 phút", staff: "" },
        {id: 3, name: "Đắp bột", duration: "30 phút", staff: "" },
        {id: 4, name: "Chăm sóc móng", duration: "30 phút", staff: "" },
        {id: 5, name: "Chăm sóc móng", duration: "30 phút", staff: "" },
        {id: 6, name: "Chăm sóc móng", duration: "30 phút", staff: "" },
        {id: 7, name: "Chăm sóc móng", duration: "30 phút", staff: "" },
        {id: 8, name: "Chăm sóc móng", duration: "30 phút", staff: "" },
        {id: 9, name: "Chăm sóc móng", duration: "30 phút", staff: "" },
    ],
    onStaffChange,
    staffOptions = [
        { label: "An", value: "an" },
        { label: "Bình", value: "binh" },
        { label: "Chi", value: "chi" },
    ],
}: BookingConfirmationModalProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
    };

    const handleStaffChange = (serviceId: number | string, staff: string) => {
        onStaffChange?.(serviceId, staff);
    };

    const renderItem = (item: any) => {
        return (
            <View style={styles.dropdownItemContainer}>
                <TextFieldLabel allowFontScaling={false} style={styles.dropdownSelectedText}>
                    {item.label}
                </TextFieldLabel>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdropTouchable} />
                </TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                    <View style={styles.header}>
                        <TextFieldLabel style={styles.title}>{t('bookingConfirmation.title')}</TextFieldLabel>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TextFieldLabel style={styles.subtitle}>
                        {t('bookingConfirmation.subtitle')}
                    </TextFieldLabel>

                    <ScrollView 
                        style={styles.servicesContainer}
                        contentContainerStyle={styles.servicesContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        bounces={true}
                        scrollEventThrottle={16}
                    >
                        {services.map((service, index) => (
                            <View 
                                key={service.id} 
                                style={[
                                    styles.serviceItem,
                                    index === services.length - 1 && styles.serviceItemLast
                                ]}
                            >
                                <View style={styles.fieldBlock}>
                                    <TextFieldLabel style={styles.fieldLabel}>
                                        {t('bookingConfirmation.service')} {services.length > 1 ? `${index + 1}` : ''}
                                    </TextFieldLabel>
                                    <View style={styles.readOnlyField}>
                                        <TextFieldLabel style={styles.readOnlyText}>{service.name}</TextFieldLabel>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.col, { marginRight: 8 }]}>
                                        <TextFieldLabel style={styles.fieldLabel}>{t('bookingConfirmation.duration')}</TextFieldLabel>
                                        <View style={styles.readOnlyField}>
                                            <TextFieldLabel style={styles.readOnlyText}>{service.duration}</TextFieldLabel>
                                        </View>
                                    </View>
                                    <View style={[styles.col, { marginLeft: 8 }]}>
                                        <TextFieldLabel style={styles.fieldLabel}>{t('bookingConfirmation.staff')}</TextFieldLabel>
                                        <Dropdown
                                            data={staffOptions}
                                            labelField="label"
                                            valueField="value"
                                            value={service.staff}
                                            onChange={(item) => handleStaffChange(service.id, item.value)}
                                            style={styles.dropdown}
                                            containerStyle={styles.dropdownContainer}
                                            itemContainerStyle={styles.dropdownItem}
                                            selectedTextStyle={styles.dropdownSelectedText}
                                            showsVerticalScrollIndicator={false}
                                            itemTextStyle={{ color: colors.text }}
                                            placeholderStyle={styles.dropdownPlaceholder}
                                            placeholder={t('bookingConfirmation.staffPlaceholder')}
                                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                            maxHeight={220}
                                            activeColor={colors.backgroundDisabled}
                                            selectedTextProps={{ allowFontScaling: false }}
                                            renderItem={renderItem}
                                            />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.closeButtonAction} onPress={onClose}>
                            <TextFieldLabel style={styles.closeButtonText}>{t('bookingConfirmation.close')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.yellow }]}
                            onPress={handleConfirm}
                        >
                            <TextFieldLabel style={styles.confirmButtonText}>{t('bookingConfirmation.confirm')}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const $styles = (colors: Colors) => StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 16,
    },
    backdropTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalCard: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 0.3,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholderTextColor,
        marginBottom: 20,
    },
    servicesContainer: {
        maxHeight: 400,
        marginBottom: 20,
    },
    servicesContent: {
        paddingRight: 4,
    },
    serviceItem: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    serviceItemLast: {
        borderBottomWidth: 0,
        marginBottom: 0,
    },
    fieldBlock: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    col: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    readOnlyField: {
        height: 44,
        backgroundColor: colors.backgroundDisabled,
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    readOnlyText: {
        fontSize: 14,
        color: colors.text,
    },
    dropdown: {
        height: 44,
        backgroundColor: colors.card,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dropdownContainer: {
        backgroundColor: colors.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: colors.text,
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: colors.placeholderTextColor,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    closeButtonAction: {
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 8,
        backgroundColor: colors.backgroundDisabled,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    confirmButton: {
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.black,
    },
    dropdownItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: colors.text,
    },
});

export default BookingConfirmationModal;