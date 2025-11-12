import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/shared/ui/Text";
import { RootScreenProps } from "@/app/navigation/types";
import { Paths } from "@/app/navigation/paths";
import { Colors, useAppTheme } from "@/shared/theme";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import MHeader from "@/shared/ui/MHeader";
import StatusBarComponent from "@/shared/ui/StatusBar";
import { useTranslation } from "react-i18next";
import { TextField } from "@/shared/ui/TextField";
import { useRef, useState, useMemo } from "react";
import ServiceListComponent, { ServiceItem } from "./components/ServiceListComponent";
import PeriodicSettingsComponent, { PeriodicSettings } from "./components/PeriodicSettingsComponent";
import { Dropdown } from "react-native-element-dropdown";
import { Button } from "@/shared/ui/Button";

type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed';

const EditBookingScreen = ({ route, navigation }: RootScreenProps<Paths.EditBooking>) => {
    const { bookingId } = route.params;
    const initialValue: any = {
        services: [],
        isPeriodic: true,
        status: 'pending' as BookingStatus,
    };
    const { theme: { colors } } = useAppTheme();
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>(initialValue.services);
    const [isPeriodic, setIsPeriodic] = useState(initialValue.isPeriodic);
    const [bookingStatus, setBookingStatus] = useState<BookingStatus>(initialValue.status);
    const [periodicSettings, setPeriodicSettings] = useState<PeriodicSettings>({
        repeatBy: initialValue.periodicSettings?.repeatBy || "",
        repeatValue: initialValue.periodicSettings?.repeatValue || "",
        endDate: initialValue.periodicSettings?.endDate || "",
    });
    const styles = $styles(colors);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);

    const statusOptions = useMemo(() => [
        { label: t('editBooking.statusOptions.pending'), value: 'pending' as BookingStatus },
        { label: t('editBooking.statusOptions.confirmed'), value: 'confirmed' as BookingStatus },
        { label: t('editBooking.statusOptions.paid'), value: 'paid' as BookingStatus },
        { label: t('editBooking.statusOptions.completed'), value: 'completed' as BookingStatus },
    ], [t]);
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

                        <TextField
                            label={'Thông tin khách hàng'}
                            placeholder={'Nhập tên khách hàng (Nickname)'}
                            value={'Phạm Huyền Trang - 0986567765'}
                            editable={false}
                        />

                        <View style={styles.colDob}>
                            <View style={styles.labelRow}>
                                <Text text={t('editBooking.status')} style={styles.labelText} />
                            </View>
                            <Dropdown
                                data={statusOptions}
                                labelField="label"
                                valueField="value"
                                value={bookingStatus}
                                onChange={({ value }) => setBookingStatus(value)}
                                style={styles.dropdown}
                                containerStyle={styles.dropdownContainer}
                                itemContainerStyle={styles.dropdownItem}
                                selectedTextStyle={styles.dropdownSelectedText}
                                itemTextStyle={{ color: colors.text }}
                                placeholderStyle={styles.dropdownSelectedText}
                                showsVerticalScrollIndicator={false}
                                placeholder={t('editBooking.statusPlaceholder')}
                                renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                maxHeight={220}
                                activeColor={colors.backgroundDisabled}
                            />
                        </View>

                        <ServiceListComponent
                            services={serviceItems}
                            onChange={setServiceItems}
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
                    text={t('editBooking.save')}
                    onPress={() => navigation.goBack()}
                    style={[styles.footerButton, styles.footerButtonPrimary]}
                />
            </View>

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
        marginHorizontal: 16,
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
});

export default EditBookingScreen;