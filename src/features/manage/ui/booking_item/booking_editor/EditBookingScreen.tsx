    import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
    import { TextFieldLabel } from "@/shared/ui/Text";
    import { RootScreenProps } from "@/app/navigation/types";
    import { Paths } from "@/app/navigation/paths";
    import { Colors, useAppTheme } from "@/shared/theme";
    import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
    import { ArrowLeft, ChevronDown } from "lucide-react-native";
    import MHeader from "@/shared/ui/MHeader";
    import StatusBarComponent from "@/shared/ui/StatusBar";
    import { useTranslation } from "react-i18next";
    import { TextField } from "@/shared/ui/TextField";
    import { useRef, useState, useMemo, useEffect, useCallback } from "react";
    import ServiceListComponent, { ServiceItem } from "./components/ServiceListComponent";
    import PeriodicSettingsComponent, { PeriodicSettings } from "./components/PeriodicSettingsComponent";
    import { Dropdown } from "react-native-element-dropdown";
    import { Button } from "@/shared/ui/Button";
    import { useAppSelector } from "@/app/store";
    import { EditBookingRequest } from "@/features/manage/api/types";
    import { useEditBookingForm } from "@/features/manage/hooks/useEditBookingForm";
    import { useBookingForm } from "@/features/manage/hooks/useBookingForm";
    import { alertService } from "@/services/alertService";
    import Loader from "@/shared/ui/Loader";

    const EditBookingScreen = ({ navigation }: RootScreenProps<Paths.EditBooking>) => {
        const { theme: { colors } } = useAppTheme();
        const styles = $styles(colors);
        const { t } = useTranslation();
        const insets = useSafeAreaInsets();
        const scrollRef = useRef<ScrollView>(null);

        const {getListService} = useEditBookingForm();
        const {putEditBooking, loading} = useBookingForm();

        const [dataBookingEdit, setDataBookingEdit] = useState<EditBookingRequest>();

        const { detailBookingItem, listBookingStatus } = useAppSelector((state) => state.booking);

        const statusOptions = Array.isArray(listBookingStatus)
            ? listBookingStatus.map((item) => ({ label: item.name, value: item.id }))
            : listBookingStatus?.items?.map((item) => ({ label: item.name, value: item.id })) ?? [];

        const validateDataBookingEdit = useCallback(() => {
            if (!dataBookingEdit?.services || dataBookingEdit.services.length === 0) {
                alertService.showAlert({
                    title: t('editBooking.validationError'),
                    message: t('editBooking.noServiceError'),
                    typeAlert: 'Error',
                    onConfirm: () => {},
                });
                return false;
            }
            return true;
        }, [dataBookingEdit]);

        const handleEditBooking = useCallback(async () => {
            if (!validateDataBookingEdit()) {
                return;
            }

            if (!dataBookingEdit) {
                alertService.showAlert({
                    title: t('editBooking.errorTitle'),
                    message: t('editBooking.errorMessage'),
                    typeAlert: 'Error',
                    onConfirm: () => {},
                });
                return;
            }
            console.log("dataBookingEdit", dataBookingEdit);
            const response = await putEditBooking(dataBookingEdit);
            if (response) {
                alertService.showAlert({
                    title: t('editBooking.successTitle'),
                    message: t('editBooking.successMessage'),
                    typeAlert: 'Confirm',
                    onConfirm: () => {
                        navigation.goBack();
                    },
                });
            } else {
                alertService.showAlert({
                    title: t('editBooking.errorTitle'),
                    message: t('editBooking.errorMessage'),
                    typeAlert: 'Error',
                    onConfirm: () => {},
                });
            }
        }, [dataBookingEdit, putEditBooking]);

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

        useEffect(() => {
            getListService();
        }, [navigation]);

        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <StatusBarComponent backgroundColor={colors.yellow} />

                <MHeader
                    label={t('editBooking.title')}
                    showIconLeft={true}
                    iconLeft={<ArrowLeft size={24} color={colors.background} />}
                    onBack={() => navigation.goBack()}
                    bgColor={colors.yellow}
                />

                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
                >
                    <ScrollView
                        ref={scrollRef}
                        style={styles.container}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets={true}
                        keyboardDismissMode="on-drag"
                    >


                        <View style={styles.formGroup}>

                            <View style={styles.customerInfoContainer}>
                                <TextField
                                    label={t('editBooking.customerInfo')}
                                    placeholder={t('editBooking.customerInfoPlaceholder')}
                                    value={`${detailBookingItem?.customer?.name} - ${detailBookingItem?.customer?.phoneNumber}`}
                                    editable={false}
                                    style={{height: 40}}
                                />
                            </View>

                            <View style={styles.customerInfoContainer}>
                                <TextField
                                    label={t('editBooking.status')}
                                    placeholder={t('editBooking.statusPlaceholder')}
                                    value={`${statusOptions?.find((item) => item.value === dataBookingEdit?.status)?.label}`}
                                    editable={false}
                                    style={{height: 40}}
                                />
                            </View>

                            <ServiceListComponent
                                services={dataBookingEdit?.services?.map((service) => ({ serviceId: service?.serviceId ?? 0, staffId: service?.staffId ?? null, serviceTime: service?.serviceTime ?? 0 })) || []}
                                onChange={(services) =>
                                    setDataBookingEdit((prev) => (prev ? { ...prev, services } : prev))
                                }
                            />

                            {/* <PeriodicSettingsComponent
                                isPeriodic={isPeriodic}
                                onPeriodicChange={setIsPeriodic}
                                settings={periodicSettings}
                                onSettingsChange={setPeriodicSettings}
                            /> */}

                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={styles.footer}>
                    <Button
                        text={t('editBooking.back')}
                        onPress={() => navigation.goBack()}
                        style={styles.footerButton}
                    />
                    <Button
                        text={t('editBooking.edit')}
                        onPress={handleEditBooking}
                        style={[styles.footerButton, styles.footerButtonPrimary]}
                    />
                </View>

                <Loader loading={loading} />

            </SafeAreaView>
        )
    }

    const $styles = (colors: Colors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        formGroup: {
            marginTop: 16,
            gap: 20,
            marginBottom: 180,
        },
        keyboardAvoidingView: {
            flex: 1,
            padding: 8,
        },
        scrollContent: {
            paddingBottom: 24,
        },
        dobRow: {
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 12,
            marginTop: 12,
            flexWrap: "nowrap",
        },
        colDob: {
            flex: 1,
            minWidth: 0,
            marginHorizontal: 12,
        },
        labelRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
        },
        labelText: {
            fontSize: 14,
            fontWeight: "500",
        },
        requiredMark: {
            fontSize: 14,
            color: colors.error,
            marginLeft: 4,
        },
        dropdown: {
            height: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            backgroundColor: colors.card,
        },
        dropdownContainer: {
            borderRadius: 12,
            borderColor: colors.border,
            backgroundColor: colors.card,
        },
        dropdownItem: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
            paddingVertical: 12,
        },
        dropdownSelectedText: {
            fontSize: 16,
            color: colors.text,
        },
        footer: {
            flexDirection: "row",
            gap: 12,
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
        },
        footerButton: {
            flex: 1,
            minHeight: 48,
        },
        footerButtonPrimary: {
            backgroundColor: colors.yellow,
            borderColor: colors.yellow,
        },
        dropdownItemContainer: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            color: colors.text,
        },
        customerInfoContainer: {
            marginHorizontal: 12,
        },
    });

    export default EditBookingScreen;