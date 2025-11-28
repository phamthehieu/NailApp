import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ArrowLeft, Info, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, useAppTheme } from "@/shared/theme";
import { RootScreenProps } from "@/app/navigation/types";
import { Paths } from "@/app/navigation/paths";
import StatusBarComponent from "@/shared/ui/StatusBar";
import MHeader from "@/shared/ui/MHeader";
import { Button } from "@/shared/ui/Button";
import CustomerInformationComponent, { CustomerState } from "./CustomerInformationComponent";
import BookingInformationComponent, { BookingInformationData } from "./BookingInformationComponent";
import { TextFieldLabel } from "@/shared/ui/Text";
import { useEditBookingForm } from "@/features/manage/hooks/useEditBookingForm";
import Loader from "@/shared/ui/Loader";
import { RootState, useAppSelector } from "@/app/store";
import { alertService } from "@/services/alertService";
import { CreateBookingRequest } from "@/features/manage/api/types";
import { useBookingForm } from "@/features/manage/hooks/useBookingForm";

const AddNewBookingScreen = ({ navigation }: RootScreenProps<Paths.AddNewBooking>) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const { getListBookingSetting, loading, getListService, getListBookingFrequency, postCreateUserBooking, postCreateBooking, getListStaffManager } = useEditBookingForm();
    const listBookingSetting = useAppSelector((state: RootState) => state.editBooking.listBookingSetting);

    const steps = useMemo(() => ([
        { label: t('bookingInformation.customerInfo'), icon: UserRound },
        { label: t('bookingInformation.bookingInfo'), icon: Info },
    ]), [t]);

    const [activeStep, setActiveStep] = useState(0);

    const [customerData, setCustomerData] = useState<CustomerState>({
        name: "",
        phone: "",
        email: "",
        note: "",
        dob: null,
        id: null,
        avatarUrl: null,
    });

    const [bookingData, setBookingData] = useState<BookingInformationData>();

    const normalizeBookingHours = (time?: string | null) => {
        if (!time) return null;
        const parts = time.split(':').map((part) => part.padStart(2, '0'));
        const [hours = '00', minutes = '00', seconds = '00'] = parts;
        return `${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
        getListStaffManager();
        getListBookingSetting();
        getListService();
        getListBookingFrequency();
    }, []);

    const validateBookingData = () => {
        if (!bookingData?.bookingDate || !bookingData?.bookingHours) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.requiredFields'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }

        const now = new Date();
        let minDateTime = new Date(now);
        if (listBookingSetting) {
            const leadTimeDays = listBookingSetting.appointmentLeadTimeDays ?? 0;
            const leadTimeHours = listBookingSetting.appointmentLeadTimeHours ?? 0;
            const leadTimeMins = listBookingSetting.appointmentLeadTimeMins ?? 0;

            minDateTime.setDate(minDateTime.getDate() + leadTimeDays);
            minDateTime.setHours(minDateTime.getHours() + leadTimeHours);
            minDateTime.setMinutes(minDateTime.getMinutes() + leadTimeMins);
            minDateTime.setSeconds(0, 0);
        }

        const bookingDate = bookingData.bookingDate;
        const bookingHoursParts = bookingData.bookingHours.split(':');
        if (bookingHoursParts.length < 2) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.invalidTime'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }

        const bookingDateTime = new Date(bookingDate);
        bookingDateTime.setHours(
            parseInt(bookingHoursParts[0], 10),
            parseInt(bookingHoursParts[1], 10),
            bookingHoursParts.length > 2 ? parseInt(bookingHoursParts[2], 10) : 0,
            0
        );

        // if (bookingDateTime < minDateTime) {
        //     const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-AU';
        //     const minDateStr = minDateTime.toLocaleDateString(locale, {
        //         year: 'numeric',
        //         month: '2-digit',
        //         day: '2-digit',
        //     });
        //     const minTimeStr = `${minDateTime.getHours().toString().padStart(2, '0')}:${minDateTime.getMinutes().toString().padStart(2, '0')}`;

        //     alertService.showAlert({
        //         title: t('addNewBooking.validationError'),
        //         message: t('addNewBooking.minimumTimeError', {
        //             date: minDateStr,
        //             time: minTimeStr,
        //         }),
        //         typeAlert: 'Error',
        //         onConfirm: () => { },
        //     });
        //     return false;
        // }

        if (!bookingData?.services || bookingData.services.length === 0) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.noServiceError'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }

        // Kiểm tra xem có service nào trùng serviceId không
        const serviceIds = bookingData.services.map(service => service.serviceId).filter(id => id > 0);
        const uniqueServiceIds = new Set(serviceIds);
        if (serviceIds.length !== uniqueServiceIds.size) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.duplicateServiceError', { defaultValue: 'Không được phép chọn dịch vụ trùng nhau' }),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }

        const invalidService = bookingData.services.find(
            (service) => !service.serviceId || service.serviceId === 0 || !service.serviceTime || service.serviceTime === 0
        );

        if (invalidService) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.invalidServiceError'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }

        if (bookingData.frequency.frequencyType !== null && (!bookingData.frequency.fromDate || !bookingData.frequency.endDate)) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.repeatValueError'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }

        return true;
    }

    const validateCustomerData = () => {
        if (!customerData.name) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.nameError'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }
        if (!customerData.phone) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.phoneError'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }
        if (!customerData.dob) {
            alertService.showAlert({
                title: t('addNewBooking.validationError'),
                message: t('addNewBooking.dobError'),
                typeAlert: 'Error',
                onConfirm: () => { },
            });
            return false;
        }
        return true;
    }

    const handleButtonPress = async () => {
        if (activeStep === 0) {
            if (!validateCustomerData()) {
                return;
            }
            setActiveStep(1);
            return;
        }

        if (activeStep === 1) {
            if (!validateBookingData()) {
                return;
            }
            if (!validateCustomerData()) {
                alertService.showAlert({
                    title: t('addNewBooking.validationError'),
                    message: t('addNewBooking.customerInfoError'),
                    typeAlert: 'Error',
                });
                setActiveStep(0);
                return;
            }

            let formData: CreateBookingRequest;

            if (customerData.id === null) {
                const dataUserBooking = {
                    id: 0,
                    code: "",
                    name: customerData.name,
                    phoneNumber: customerData.phone,
                    email: customerData.email,
                    dateOfBirth: customerData.dob?.getDate() ? customerData.dob.getDate() : 0,
                    monthOfBirth: customerData.dob?.getMonth() ? customerData.dob.getMonth() + 1 : 0,
                    yearOfBirth: null,
                    gender: null,
                    systemCatalogId: null,
                    address: "",
                    description: "",
                    staffNote: "",
                    dayBirth: customerData.dob?.getDate() || 0,
                    monthBirth: customerData.dob?.getMonth() ? customerData.dob.getMonth() + 1 : 0,
                    password: "",
                }
                const response = await postCreateUserBooking(dataUserBooking);
                if (response) {
                    const formatDateString = (date?: Date | null) => {
                        if (!date) return null;
                        const tzOffset = date.getTimezoneOffset() * 60000;
                        return new Date(date.getTime() - tzOffset).toISOString();
                    };
                    const servicesPayload = (bookingData?.services ?? []).map((service) => ({
                        serviceId: service.serviceId,
                        staffId: service.staffId ?? null,
                        serviceTime: service.serviceTime,
                        servicePrice: service.servicePrice,
                        promotionId: service.promotionId ?? null,
                    }));

                    const frequencyPayload = {
                        frequencyType: bookingData?.frequency?.frequencyType ?? null,
                        fromDate: formatDateString(bookingData?.frequency?.fromDate ?? null),
                        endDate: formatDateString(bookingData?.frequency?.endDate ?? null),
                    }

                    formData = {
                        bookingDate: formatDateString(bookingData?.bookingDate ?? null),
                        bookingHours: normalizeBookingHours(bookingData?.bookingHours),
                        status: 0,
                        description: bookingData?.description ?? null,
                        services: servicesPayload ?? null,
                        frequency: bookingData?.frequency?.frequencyType ? frequencyPayload : null,
                        customer: {
                            id: response.id ?? null,
                            name: customerData.name ?? null,
                        }
                    }

                    const responseBooking = await postCreateBooking(formData);
                    if (responseBooking) {
                        alertService.showAlert({
                            title: t('addNewBooking.success'),
                            message: t('addNewBooking.bookingCreatedSuccessfully'),
                            typeAlert: 'Confirm',
                            onConfirm: () => {
                                navigation.goBack();
                            },
                        });
                    } else {
                        alertService.showAlert({
                            title: t('addNewBooking.validationError'),
                            message: t('addNewBooking.errorCreateBooking'),
                            typeAlert: 'Error',
                            onConfirm: () => {
                                setActiveStep(0);
                            },
                        });
                        return;
                    }
                } else {
                    alertService.showAlert({
                        title: t('addNewBooking.validationError'),
                        message: t('addNewBooking.errorCreateUserBooking'),
                        typeAlert: 'Error',
                    });
                    return;
                }
            } else {
                const formatDateString = (date?: Date | null) => {
                    if (!date) return null;
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    return new Date(date.getTime() - tzOffset).toISOString();
                };
                const servicesPayload = (bookingData?.services ?? []).map((service) => ({
                    serviceId: service.serviceId,
                    staffId: service.staffId ?? null,
                    serviceTime: service.serviceTime,
                    servicePrice: service.servicePrice,
                    promotionId: service.promotionId ?? null,
                }));

                const frequencyPayload = {
                    frequencyType: bookingData?.frequency?.frequencyType ?? null,
                    fromDate: formatDateString(bookingData?.frequency?.fromDate ?? null),
                    endDate: formatDateString(bookingData?.frequency?.endDate ?? null),
                }

                formData = {
                    bookingDate: formatDateString(bookingData?.bookingDate ?? null),
                    bookingHours: normalizeBookingHours(bookingData?.bookingHours),
                    status: 0,
                    description: bookingData?.description ?? null,
                    services: servicesPayload ?? null,
                    frequency: bookingData?.frequency?.frequencyType ? frequencyPayload : null,
                    customer: {
                        id: customerData.id ?? null,
                        name: customerData.name ?? null,
                    }
                }
                const responseBooking = await postCreateBooking(formData);
                if (responseBooking) {
                    alertService.showAlert({
                        title: t('addNewBooking.success'),
                        message: t('addNewBooking.bookingCreatedSuccessfully'),
                        typeAlert: 'Confirm',
                        onConfirm: () => {
                            navigation.goBack();
                        },
                    });
                } else {
                    alertService.showAlert({
                        title: t('addNewBooking.validationError'),
                        message: t('addNewBooking.errorCreateBooking'),
                        typeAlert: 'Error',
                        onConfirm: () => {
                            setActiveStep(0);
                        },
                    });
                    return;
                }
            }
        }
    }

    const handleBackPress = () => {
        if (activeStep === 0) {
            navigation.goBack();
        } else {
            setActiveStep((prev) => Math.max(0, prev - 1));
        }
    }
    return (

        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('addNewBooking.title')}
                showIconLeft={true}
                iconLeft={<ArrowLeft size={24} color={colors.background} />}
                onBack={() => navigation.goBack()}
                bgColor={colors.yellow}
            />

            <View style={styles.stepperOuter}>

                <View style={styles.stepperContainer}>

                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep;

                        return (
                            <React.Fragment key={step.label}>
                                <Pressable
                                    style={styles.stepItem}
                                // onPress={() => setActiveStep(index)}
                                >
                                    <View style={[
                                        styles.stepCircle,
                                        (isActive || isCompleted) ? styles.stepCircleActive : styles.stepCircleInactive,
                                    ]}>
                                        <IconComponent
                                            size={16}
                                            color={(isActive || isCompleted) ? colors.background : colors.border}
                                        />
                                    </View>
                                    <TextFieldLabel
                                        style={[
                                            styles.stepLabel,
                                            isActive ? styles.stepLabelActive : styles.stepLabelInactive,
                                        ]}
                                    >
                                        {step.label}
                                    </TextFieldLabel>
                                </Pressable>
                                {index !== steps.length - 1 && (
                                    <View style={[
                                        styles.stepDivider,
                                        isCompleted ? styles.stepDividerActive : styles.stepDividerInactive,
                                    ]} />
                                )}
                            </React.Fragment>
                        );
                    })}

                </View>

            </View>

            <View style={styles.content}>

                {activeStep === 0 ? (
                    <CustomerInformationComponent
                        value={customerData}
                        onChange={setCustomerData}
                    />
                ) : (
                    <BookingInformationComponent
                        value={bookingData ? {
                            ...bookingData,
                            customer: {
                                id: customerData.id ?? 0,
                                name: customerData.name || "",
                            },
                        } : {
                            bookingDate: null,
                            bookingHours: null,
                            status: 0,
                            description: "",
                            services: [],
                            frequency: {
                                frequencyType: null,
                                fromDate: null,
                                endDate: null,
                            },
                            customer: {
                                id: customerData.id ?? 0,
                                name: customerData.name || "",
                            },
                        }}
                        onChange={setBookingData}
                    />
                )}

            </View>

            <View style={styles.footer}>
                <Button
                    text={t('addNewBooking.back')}
                    onPress={() => handleBackPress()}
                    style={styles.footerButton}
                />
                <Button
                    text={activeStep === steps.length - 1 ? t('addNewBooking.done') : t('addNewBooking.next')}
                    onPress={() => handleButtonPress()}
                    style={[styles.footerButton, styles.footerButtonPrimary]}
                    pressedTextStyle={{ color: colors.black }}
                    textStyle={{ color: colors.black }}
                />
            </View>

            <Loader loading={loading} />
        </SafeAreaView>
    );
};

const $styles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    stepperOuter: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    stepperContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        alignSelf: "center",
        width: "100%",
        maxWidth: 520,
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    stepCircleActive: {
        backgroundColor: colors.yellow,
        borderColor: colors.yellow,
    },
    stepCircleInactive: {
        backgroundColor: colors.background,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.border,
    },
    stepLabelActive: {
        color: colors.yellow,
    },
    stepLabelInactive: {
        color: colors.border,
    },
    stepDivider: {
        flex: 1,
        height: 1,
    },
    stepDividerActive: {
        backgroundColor: colors.yellow,
    },
    stepDividerInactive: {
        backgroundColor: colors.border,
    },
    content: {
        flex: 1,
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
});

export default AddNewBookingScreen;