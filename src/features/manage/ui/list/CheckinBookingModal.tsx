import React, { useState } from "react";
import { StyleSheet, View, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from "react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { X, ChevronDown } from "lucide-react-native";
import { Dropdown } from "react-native-element-dropdown";
import ServiceListComponent, { ServiceItem } from "../booking_item/booking_editor/components/ServiceListComponent";


interface CheckinBookingModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CheckinBookingModal = ({
    visible,
    onClose,
    onConfirm,
}: CheckinBookingModalProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
        { id: 1, name: "remove_gel", duration: "30", staff: "", anyEmployee: false },
        { id: 2, name: "gel_polish", duration: "45", staff: "", anyEmployee: false },
    ]);
    const handleConfirm = () => {
        onConfirm();
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
                        <TextFieldLabel style={styles.title}>{t('checkinBooking.title')}</TextFieldLabel>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TextFieldLabel style={styles.subtitle}>
                        {t('checkinBooking.subtitle')}
                    </TextFieldLabel>

                    <ScrollView style={styles.servicesContainer} contentContainerStyle={styles.servicesContent} showsVerticalScrollIndicator={false}>
                        <ServiceListComponent
                            services={serviceItems}
                            onChange={setServiceItems}
                        />
                    </ScrollView>


                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.closeButtonAction} onPress={onClose}>
                            <TextFieldLabel style={styles.closeButtonText}>{t('checkinBooking.close')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.yellow }]}
                            onPress={handleConfirm}
                        >
                            <TextFieldLabel style={styles.confirmButtonText}>{t('checkinBooking.confirm')}</TextFieldLabel  >
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)' ,
        padding: 4,
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
});

export default CheckinBookingModal;