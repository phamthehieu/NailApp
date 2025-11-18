import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from "react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { X, ChevronDown } from "lucide-react-native";
import { Dropdown } from "react-native-element-dropdown";
import ServiceListComponent, { ServiceItem } from "../booking_item/booking_editor/components/ServiceListComponent";
import { useAppSelector } from "@/app/store";
import { EditBookingRequest } from "../../api/types";
import { alertService } from "@/services/alertService";
import { useBookingForm } from "../../hooks/useBookingForm";


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
    const { detailBookingItem } = useAppSelector((state) => state.booking);
    const { putCheckinBooking, getListBookingManager } = useBookingForm();

    const [dataBookingEdit, setDataBookingEdit] = useState<EditBookingRequest>();

    const validateDataBookingEdit = useCallback(() => {
        if (!dataBookingEdit?.services || dataBookingEdit.services.length === 0) {
            alertService.showAlert({
                title: t('checkinBooking.validationError'),
                message: t('checkinBooking.noServiceError'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
        return true;
    }, [dataBookingEdit]);

    const handleConfirm = async () => {
        if (!validateDataBookingEdit()) {
            return;
        }

        if (!dataBookingEdit) {
            alertService.showAlert({
                title: t('checkinBooking.errorTitle'),
                message: t('checkinBooking.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return;
        }
        console.log("dataBookingEdit", dataBookingEdit);
        const response = await putCheckinBooking(dataBookingEdit);
        if (response) {
            alertService.showAlert({
                title: t('checkinBooking.successTitle'),
                message: t('checkinBooking.successMessage'),
                typeAlert: 'Confirm',
                onConfirm: () => {
                    getListBookingManager();
                    onClose();
                },
            });
        } else {
            alertService.showAlert({
                title: t('checkinBooking.errorTitle'),
                message: t('checkinBooking.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        }
    };

    useEffect(() => {
        if (detailBookingItem) {
            setDataBookingEdit({
                id: detailBookingItem.id,
                status: detailBookingItem.status,
                services: detailBookingItem.services.map((service) => ({
                    serviceId: service.id ?? 0,
                    staffId: service.staff?.id ?? null,
                    serviceTime: service.serviceTime,
                })),
            });
        }
    }, [detailBookingItem]);


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
                            services={dataBookingEdit?.services?.map((service) => ({ serviceId: service?.serviceId ?? 0, staffId: service?.staffId ?? null, serviceTime: service?.serviceTime ?? 0 })) || []}
                            onChange={(services) =>
                                setDataBookingEdit((prev) => (prev ? { ...prev, services } : prev))
                            }
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 2,
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
        padding: 6,
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