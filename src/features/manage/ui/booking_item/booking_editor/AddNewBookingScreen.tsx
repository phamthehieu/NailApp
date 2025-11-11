import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { ArrowLeft, Info, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, useAppTheme } from "@/shared/theme";
import { RootScreenProps } from "@/app/navigation/types";
import { Paths } from "@/app/navigation/paths";
import StatusBarComponent from "@/shared/ui/StatusBar";
import MHeader from "@/shared/ui/MHeader";
import { Button } from "@/shared/ui/Button";
import CustomerInformationComponent from "./CustomerInformationComponent";
import BookingInformationComponent from "./BookingInformationComponent";

const AddNewBookingScreen = ({ navigation }: RootScreenProps<Paths.AddNewBooking>) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();

    const steps = useMemo(() => ([
        { label: t('bookingInformation.customerInfo'), icon: UserRound },
        { label: t('bookingInformation.bookingInfo'), icon: Info },
    ]), [t]);

    const [activeStep, setActiveStep] = useState(0);

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
                                onPress={() => setActiveStep(index)}
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
                                <Text
                                    style={[
                                        styles.stepLabel,
                                        isActive ? styles.stepLabelActive : styles.stepLabelInactive,
                                    ]}
                                >
                                    {step.label}
                                </Text>
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
                    
                    <CustomerInformationComponent />
                ) : (
                    <BookingInformationComponent />
                )}

            </View>

            <View style={styles.footer}>
                <Button
                    text={t('addNewBooking.back')}
                    onPress={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                    style={styles.footerButton}
                />
                <Button
                    text={activeStep === steps.length - 1 ? t('addNewBooking.done') : t('addNewBooking.next')}
                    onPress={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    style={[styles.footerButton, styles.footerButtonPrimary]}
                    pressedTextStyle={{ color: colors.black }}
                    textStyle={{ color: colors.black }}
                />
            </View>
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