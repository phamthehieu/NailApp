import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextField } from "@/shared/ui/TextField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@/shared/ui/DatePicker";
import TimePickerModal from "@/shared/ui/TimePickerModal";
import { CalendarDayPickerModal } from "@/shared/ui/CalendarPickers";
import { useTranslation } from "react-i18next";
import ServiceListComponent, { ServiceItem } from "./components/ServiceListComponent";
import PeriodicSettingsComponent, { PeriodicSettings } from "./components/PeriodicSettingsComponent";
import { RootState, useAppSelector } from "@/app/store";

export interface BookingInformationData {
    bookingDate: Date | null;
    bookingTime: Date | null;
    services: ServiceItem[];
    note: string;
    isPeriodic: boolean;
    periodicSettings?: {
        repeatBy: string;
        repeatValue: string;
        endDate: string;
    };
}

interface BookingInformationComponentProps {
    value?: BookingInformationData;
    onChange?: (data: BookingInformationData) => void;
}

const clamp = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) { return min; }
    return Math.min(Math.max(value, min), max);
};

const parseSlotSteps = (slot?: string) => {
    const defaults = { hourStep: 1, minuteStep: 1, secondStep: 1 };
    if (!slot) { return defaults; }
    const parts = slot.split(':');
    if (parts.length !== 3) { return defaults; }
    const [hRaw, mRaw, sRaw] = parts;
    const hours = clamp(parseInt(hRaw, 10) || 0, 0, 12);
    const minutes = clamp(parseInt(mRaw, 10) || 0, 0, 60);
    const seconds = clamp(parseInt(sRaw, 10) || 0, 0, 60);
    return {
        hourStep: hours > 0 ? Math.max(1, hours) : 1,
        minuteStep: minutes > 0 ? Math.max(1, minutes) : 1,
        secondStep: seconds > 0 ? Math.max(1, seconds) : 1,
    };
};

const BookingInformationComponent = ({ value, onChange }: BookingInformationComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const insets = useSafeAreaInsets();
    const listBookingSetting = useAppSelector((state: RootState) => state.editBooking.listBookingSetting);
    const { t } = useTranslation();

    const initialValue = value || {
        bookingDate: null,
        bookingTime: null,
        services: [],
        note: "",
        isPeriodic: false,
        periodicSettings: undefined,
    };

    const [serviceItems, setServiceItems] = useState<ServiceItem[]>(initialValue.services);
    const [note, setNote] = useState(initialValue.note);
    const scrollRef = useRef<ScrollView>(null);
    const inputPositionsRef = useRef<Record<"note", number>>({
        note: 0,
    });

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isPeriodic, setIsPeriodic] = useState(initialValue.isPeriodic);
    const [periodicSettings, setPeriodicSettings] = useState<PeriodicSettings>({
        repeatBy: initialValue.periodicSettings?.repeatBy || "",
        repeatValue: initialValue.periodicSettings?.repeatValue || "",
        endDate: initialValue.periodicSettings?.endDate || "",
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialValue.bookingDate);
    const [selectedTime, setSelectedTime] = useState<Date | null>(initialValue.bookingTime);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const previousValueRef = useRef<BookingInformationData | undefined>(value);

    useMemo(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const safeScrollToInput = useCallback((key: "note") => {
        const y = inputPositionsRef.current[key] ?? 0;
        const extraOffset = Math.max(keyboardHeight, Platform.OS === "ios" ? insets.top + 56 : 0) + 24;
        const targetY = Math.max(y - extraOffset, 0);
        const delay = keyboardHeight > 0 ? 0 : 80;
        setTimeout(() => {
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ y: targetY, animated: true });
            });
        }, delay);
    }, [insets.top, keyboardHeight]);

    const formatDate = useCallback((date: Date | null): string => {
        if (!date) return "";
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }, []);

    const formatTime = useCallback((date: Date | null): string => {
        if (!date) return "";
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }, []);

    const handleDateChange = useCallback((date: Date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
    }, []);

    const handleTimeChange = useCallback((date: Date) => {
        const baseDate = selectedDate || new Date();
        const timeOnly = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            date.getHours(),
            date.getMinutes(),
            0,
            0
        );
        setSelectedTime(timeOnly);
        setShowTimePicker(false);
    }, [selectedDate]);

    useEffect(() => {
        if (value) {
            const prevValue = previousValueRef.current;
            const hasChanged = !prevValue ||
                prevValue.bookingDate !== value.bookingDate ||
                prevValue.bookingTime !== value.bookingTime ||
                prevValue.note !== value.note ||
                prevValue.isPeriodic !== value.isPeriodic ||
                JSON.stringify(prevValue.services) !== JSON.stringify(value.services) ||
                JSON.stringify(prevValue.periodicSettings) !== JSON.stringify(value.periodicSettings);

            if (hasChanged) {
                setServiceItems(value.services);
                setNote(value.note);
                setIsPeriodic(value.isPeriodic);
                setSelectedDate(value.bookingDate);
                setSelectedTime(value.bookingTime);
                if (value.periodicSettings) {
                    setPeriodicSettings({
                        repeatBy: value.periodicSettings.repeatBy,
                        repeatValue: value.periodicSettings.repeatValue,
                        endDate: value.periodicSettings.endDate,
                    });
                } else {
                    setPeriodicSettings({
                        repeatBy: "",
                        repeatValue: "",
                        endDate: "",
                    });
                }
                previousValueRef.current = value;
            }
        }
    }, [value]);

    const bookingData: BookingInformationData = useMemo(() => {
        return {
            bookingDate: selectedDate,
            bookingTime: selectedTime,
            services: serviceItems,
            note: note,
            isPeriodic: isPeriodic,
            periodicSettings: isPeriodic && periodicSettings.repeatBy && periodicSettings.repeatValue && periodicSettings.endDate ? {
                repeatBy: periodicSettings.repeatBy,
                repeatValue: periodicSettings.repeatValue,
                endDate: periodicSettings.endDate,
            } : undefined,
        };
    }, [selectedDate, selectedTime, serviceItems, note, isPeriodic, periodicSettings]);

    const bookingDateMaximum = useMemo(() => {
        if (!listBookingSetting) return undefined;
        const months = listBookingSetting.bookingTimeRangeMonths ?? 0;
        const weeks = listBookingSetting.bookingTimeRangeWeeks ?? 0;
        const days = listBookingSetting.bookingTimeRangeDays ?? 0;

        const totalDays = (months * 30) + (weeks * 7) + days;
        if (totalDays <= 0) return undefined;

        const maxDate = new Date();
        maxDate.setHours(23, 59, 59, 999);
        maxDate.setDate(maxDate.getDate() + totalDays);
        return maxDate;
    }, [listBookingSetting]);

    const timePickerSteps = useMemo(() => {
        return parseSlotSteps(listBookingSetting?.bookingSlotSize);
    }, [listBookingSetting?.bookingSlotSize]);

    useEffect(() => {
        onChange?.(bookingData);
    }, [bookingData, onChange]);

    return (
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

                    <View style={styles.row}>
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.datePicker, styles.half]}
                        >
                            <TextField
                                label={t('bookingInformation.bookingDate')}
                                required={true}
                                readOnly
                                editable={false}
                                placeholder={t('bookingInformation.bookingDatePlaceholder')}
                                value={formatDate(selectedDate)}
                                style={{ height: 48 }}
                                RightAccessory={() => (
                                    <View style={styles.accessory}>
                                        <Calendar size={18} color={colors.text} />
                                    </View>
                                )}
                            />
                        </Pressable>

                        <Pressable
                            onPress={() => setShowTimePicker(true)}
                            style={[styles.datePicker, styles.half]}
                        >
                            <TextField
                                label={t('bookingInformation.bookingTime')}
                                required={true}
                                readOnly
                                editable={false}
                                placeholder={t('bookingInformation.bookingTimePlaceholder')}
                                value={formatTime(selectedTime)}
                                style={{ height: 48 }}
                                RightAccessory={() => (
                                    <View style={styles.accessory}>
                                        <Clock size={18} color={colors.text} />
                                    </View>
                                )}
                            />
                        </Pressable>
                    </View>

                    <ServiceListComponent
                        services={serviceItems}
                        onChange={setServiceItems}
                    />

                    <View
                        style={styles.noteField}
                        onLayout={({ nativeEvent: { layout } }) => {
                            inputPositionsRef.current.note = layout.y;
                        }}
                    >
                        <TextField
                            label={t('bookingInformation.note')}
                            placeholder={t('bookingInformation.notePlaceholder')}
                            value={note}
                            onChangeText={setNote}
                            keyboardType="default"
                            returnKeyType="done"
                            multiline={true}
                            numberOfLines={4}
                            onFocus={() => safeScrollToInput("note")}
                        />
                    </View>

                    <PeriodicSettingsComponent
                        isPeriodic={isPeriodic}
                        onPeriodicChange={setIsPeriodic}
                        settings={periodicSettings}
                        onSettingsChange={setPeriodicSettings}
                    />

                </View>
            </ScrollView>

            <CalendarDayPickerModal
                visible={showDatePicker}
                selectedDate={selectedDate || new Date()}
                minimumDate={new Date()}
                maximumDate={bookingDateMaximum}
                hideOutOfRangeDates
                onConfirm={handleDateChange}
                onClose={() => setShowDatePicker(false)}
            />

            <TimePickerModal
                visible={showTimePicker}
                initialDate={selectedTime || new Date()}
                title={t('bookingInformation.bookingTimePickerTitle')}
                cancelText={t('calenderDashboard.calenderHeader.cancel')}
                confirmText={t('calenderDashboard.calenderHeader.confirm')}
                showSeconds={false}
                hourStep={timePickerSteps.hourStep}
                minuteStep={timePickerSteps.minuteStep}
                secondStep={timePickerSteps.secondStep}
                onConfirm={handleTimeChange}
                onClose={() => setShowTimePicker(false)}
            />

        </KeyboardAvoidingView>
    )
}

const $styles = (colors: Colors, isWide: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
        flex: 1,
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    formGroup: {
        gap: 20,
        marginBottom: 180,
    },
    accessory: {
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    half: {
        flex: 1,
    },
    datePicker: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
    },
    noteField: {
        marginHorizontal: 12,
        marginTop: 12,
    },
});

export default BookingInformationComponent;