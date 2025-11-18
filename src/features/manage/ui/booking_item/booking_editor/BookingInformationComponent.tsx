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
    bookingHours: string | null;
    status: number;
    description: string;
    services: ServiceItem[];
    frequency: Frequency;
    customer: Customer;
}

export interface Frequency {
    frequencyType: number | null;
    fromDate: Date | null;
    endDate: Date | null;
}

export interface Customer {
    id: number;
    name: string;
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

    const [serviceItems, setServiceItems] = useState<ServiceItem[]>();
    const [description, setDescription] = useState<string>();
    const scrollRef = useRef<ScrollView>(null);
    const inputPositionsRef = useRef<Record<"note", number>>({
        note: 0,
    });

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [frequency, setFrequency] = useState<Frequency>();
    const [selectedDate, setSelectedDate] = useState<Date | null>();
    const [selectedTime, setSelectedTime] = useState<Date | null>();
    const [bookingHoursString, setBookingHoursString] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const previousValueRef = useRef<BookingInformationData | undefined>(value);
    const onChangeRef = useRef(onChange);
    const isInitialMountRef = useRef(true);
    const lastEmittedDataRef = useRef<BookingInformationData | null>(null);
    const isUpdatingFromParentRef = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
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

    const formatTimeToString = useCallback((date: Date | null): string | null => {
        if (!date) return null;
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const parseTimeString = useCallback((timeString: string | null): Date | null => {
        if (!timeString) return null;
        const parts = timeString.split(':');
        if (parts.length < 2) return null;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parts.length > 2 ? parseInt(parts[2], 10) : 0;
        const date = new Date();
        date.setHours(hours, minutes, seconds, 0);
        return date;
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
        const timeString = formatTimeToString(timeOnly);
        setBookingHoursString(timeString);
        setShowTimePicker(false);
    }, [selectedDate, formatTimeToString]);

    const handleFrequencyTypeChange = useCallback((frequencyType: number | null) => {
        setFrequency((prev) => ({
            frequencyType,
            fromDate: prev?.fromDate || null,
            endDate: prev?.endDate || null,
        }));
    }, []);

    const handleFromDateChange = useCallback((fromDate: Date | null) => {
        setFrequency((prev) => ({
            frequencyType: prev?.frequencyType ?? null,
            fromDate,
            endDate: prev?.endDate || null,
        }));
    }, []);

    const handleToDateChange = useCallback((toDate: Date | null) => {
        setFrequency((prev) => ({
            frequencyType: prev?.frequencyType ?? null,
            fromDate: prev?.fromDate || null,
            endDate: toDate,
        }));
    }, []);

    useEffect(() => {
        if (value) {
            const prevValue = previousValueRef.current;
            const hasChanged = !prevValue ||
                prevValue.bookingDate?.getTime() !== value.bookingDate?.getTime() ||
                prevValue.bookingHours !== value.bookingHours ||
                prevValue.status !== value.status ||
                prevValue.description !== value.description ||
                JSON.stringify(prevValue.services) !== JSON.stringify(value.services) ||
                JSON.stringify(prevValue.frequency) !== JSON.stringify(value.frequency) ||
                JSON.stringify(prevValue.customer) !== JSON.stringify(value.customer);

            if (hasChanged) {
                isUpdatingFromParentRef.current = true;

                setServiceItems(value.services);
                setDescription(value.description);
                setFrequency(value.frequency);
                setSelectedDate(value.bookingDate);
                const parsedTime = parseTimeString(value.bookingHours);
                setSelectedTime(parsedTime);
                setBookingHoursString(value.bookingHours);
                previousValueRef.current = value;
                isInitialMountRef.current = false;
                lastEmittedDataRef.current = { ...value };

                requestAnimationFrame(() => {
                    isUpdatingFromParentRef.current = false;
                });
            }
        }
    }, [value, parseTimeString]);

    useEffect(() => {
        if (!onChangeRef.current) return;

        if (isInitialMountRef.current || isUpdatingFromParentRef.current) {
            if (isInitialMountRef.current) {
                isInitialMountRef.current = false;
            }
            return;
        }

        const bookingData: BookingInformationData = {
            bookingDate: selectedDate || null,
            bookingHours: bookingHoursString || null,
            status: value?.status ?? 0,
            description: description || "",
            services: serviceItems || [],
            frequency: frequency || {
                frequencyType: null,
                fromDate: null,
                endDate: null,
            },
            customer: value?.customer || {
                id: 0,
                name: "",
            },
        };

        const lastEmitted = lastEmittedDataRef.current;
        if (lastEmitted) {
            const hasChanged =
                lastEmitted.bookingDate?.getTime() !== bookingData.bookingDate?.getTime() ||
                lastEmitted.bookingHours !== bookingData.bookingHours ||
                lastEmitted.status !== bookingData.status ||
                lastEmitted.description !== bookingData.description ||
                lastEmitted.customer?.id !== bookingData.customer?.id ||
                lastEmitted.customer?.name !== bookingData.customer?.name ||
                JSON.stringify(lastEmitted.services) !== JSON.stringify(bookingData.services) ||
                JSON.stringify(lastEmitted.frequency) !== JSON.stringify(bookingData.frequency);

            if (!hasChanged) {
                return;
            }
        }

        lastEmittedDataRef.current = bookingData;
        onChangeRef.current(bookingData);
    }, [selectedDate, bookingHoursString, description, serviceItems, frequency, value?.status, value?.customer]);

    useEffect(() => {
        if (!isUpdatingFromParentRef.current && selectedTime) {
            const timeString = formatTimeToString(selectedTime);
            if (timeString !== bookingHoursString) {
                setBookingHoursString(timeString);
            }
        }
    }, [selectedTime, formatTimeToString, bookingHoursString]);

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
                                value={formatDate(selectedDate || null)}
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
                                value={formatTime(selectedTime || null)}
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
                        services={serviceItems || []}
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
                            value={description}
                            onChangeText={setDescription}
                            keyboardType="default"
                            returnKeyType="done"
                            multiline={true}
                            numberOfLines={4}
                            onFocus={() => safeScrollToInput("note")}
                        />
                    </View>

                    <PeriodicSettingsComponent
                        frequencyType={frequency?.frequencyType ?? null}
                        fromDate={frequency?.fromDate || null}
                        toDate={frequency?.endDate || null}
                        onChangeFrequencyType={handleFrequencyTypeChange}
                        onChangeFromDate={handleFromDateChange}
                        onChangeToDate={handleToDateChange}
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