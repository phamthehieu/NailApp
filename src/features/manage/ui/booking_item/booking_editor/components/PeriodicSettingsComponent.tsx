import { Pressable, StyleSheet, Switch, View, useWindowDimensions } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import { RootState, useAppSelector } from "@/app/store";
import { TextField } from "@/shared/ui/TextField";
import { formatDate } from "@/shared/lib/formatDate";
import DateTimePicker from "@/shared/ui/DatePicker";

export type PeriodicSettings = {
    frequencyType: number | null;
    fromDate: Date | null;
    toDate: Date | null;
    onChangeFrequencyType: (frequencyType: number | null) => void;
    onChangeFromDate: (fromDate: Date | null) => void;
    onChangeToDate: (toDate: Date | null) => void;
};


const PeriodicSettingsComponent = ({
    frequencyType,
    fromDate,
    toDate,
    onChangeFrequencyType,
    onChangeFromDate,
    onChangeToDate,
}: PeriodicSettings) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const { t } = useTranslation();
    const listBookingFrequency = useAppSelector((state: RootState) => state.editBooking.listBookingFrequency);
    const [isPeriodic, setIsPeriodic] = useState(frequencyType !== null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    useEffect(() => {
        setIsPeriodic(frequencyType !== null);
    }, [frequencyType]);
    const repeatByOptions = useMemo(() =>
        listBookingFrequency?.map((item) => ({ label: item.name, value: item.id.toString() })) || [],
        [listBookingFrequency]
    );

    const parseFromDate = useCallback((): Date => {
        if (!fromDate) return new Date();
        return fromDate;
    }, [fromDate]);

    const handleConfirmFromDate = useCallback((date: Date) => {
        onChangeFromDate(date);
        setShowFromDatePicker(false);
    }, [onChangeFromDate]);

    const handleCloseFromDatePicker = useCallback(() => {
        setShowFromDatePicker(false);
    }, []);

    const parseToDate = useCallback((): Date => {
        if (!toDate) return new Date();
        return toDate;
    }, [toDate]);

    const handleConfirmToDate = useCallback((date: Date) => {
        onChangeToDate(date);
        setShowToDatePicker(false);
    }, [onChangeToDate]);

    const handleCloseToDatePicker = useCallback(() => {
        setShowToDatePicker(false);
    }, []);

    const renderItem = (item: any) => {
        return (
            <View style={styles.dropdownItemContainer}>
                <TextFieldLabel allowFontScaling={false} style={styles.dropdownSelectedText}>
                    {item.label}
                </TextFieldLabel>
            </View>
        );
    };

    const handlePeriodicToggle = useCallback((value: boolean) => {
        setIsPeriodic(value);
        if (!value) {
            onChangeFrequencyType(null);
            onChangeFromDate(null);
            onChangeToDate(null);
        }
    }, [onChangeFrequencyType, onChangeFromDate, onChangeToDate]);

    return (
        <View>
            <Pressable style={styles.row} onPress={() => handlePeriodicToggle(!isPeriodic)}>
                <Switch
                    value={isPeriodic}
                    onValueChange={handlePeriodicToggle}
                    thumbColor={isPeriodic ? colors.yellow : colors.primary}
                    trackColor={{ true: colors.yellow + "55", false: colors.border }}
                />
                <TextFieldLabel text={t('bookingInformation.isPeriodic')} style={styles.periodicText} />
            </Pressable>

            {isPeriodic && (
                <View style={isWide ? styles.rowWithGap : styles.columnWithGap}>
                    <View style={isWide ? styles.dropdownField : styles.dropdownFieldColumn}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.repeatBy')} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Dropdown
                            data={repeatByOptions}
                            labelField="label"
                            valueField="value"
                            value={frequencyType?.toString() || ''}
                            onChange={({ value }) => onChangeFrequencyType(parseInt(value as string))}
                            style={styles.dropdown}
                            showsVerticalScrollIndicator={false}
                            containerStyle={styles.dropdownContainer}
                            itemContainerStyle={styles.dropdownItem}
                            selectedTextStyle={styles.dropdownSelectedText}
                            itemTextStyle={{ color: colors.text }}
                            placeholderStyle={styles.dropdownSelectedText}
                            placeholder={t('bookingInformation.repeatByPlaceholder')}
                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                            maxHeight={220}
                            activeColor={colors.backgroundDisabled}
                            selectedTextProps={{ allowFontScaling: false }}
                            renderItem={renderItem}
                        />
                    </View>

                    <View style={isWide ? styles.dropdownField : styles.dropdownFieldColumn}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.repeatValue')} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Pressable
                            onPress={() => setShowFromDatePicker(true)}
                        >
                            <TextField
                                required={true}
                                readOnly
                                editable={false}
                                placeholder={t('bookingInformation.bookingDatePlaceholder')}
                                value={fromDate ? formatDate(fromDate.toISOString()) : ''}
                                style={{ height: 48 }}
                                RightAccessory={() => (
                                    <View style={styles.accessory}>
                                        <Calendar size={18} color={colors.text} />
                                    </View>
                                )}
                            />
                        </Pressable>
                    </View>

                    <View style={isWide ? styles.dropdownField : styles.dropdownFieldColumn}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.endDate')} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Pressable
                            onPress={() => setShowToDatePicker(true)}
                        >
                            <TextField
                                required={true}
                                readOnly
                                editable={false}
                                placeholder={t('bookingInformation.bookingDatePlaceholder')}
                                value={toDate ? formatDate(toDate.toISOString()) : ''}
                                style={{ height: 48 }}
                                RightAccessory={() => (
                                    <View style={styles.accessory}>
                                        <Calendar size={18} color={colors.text} />
                                    </View>
                                )}
                            />
                        </Pressable>
                    </View>
                </View>
            )}

            <DateTimePicker
                mode="date"
                value={parseFromDate()}
                visible={showFromDatePicker}
                minimumDate={new Date()}
                onChange={handleConfirmFromDate}
                onClose={handleCloseFromDatePicker}
                allowFutureDates
                allowPastDates
                autoCloseOnConfirm={false}
            />

            <DateTimePicker
                mode="date"
                value={parseToDate()}
                visible={showToDatePicker}
                minimumDate={fromDate ? fromDate : new Date()}
                onChange={handleConfirmToDate}
                onClose={handleCloseToDatePicker}
                autoCloseOnConfirm={false}
            />
        </View>
    );
};

const $styles = (colors: Colors, isWide: boolean) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    rowWithGap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginHorizontal: 12,
        marginTop: 12,
    },
    columnWithGap: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 12,
        marginHorizontal: 12,
        marginTop: 12,
    },
    dropdownField: {
        flex: 1,
        marginBottom: 6,
    },
    dropdownFieldColumn: {
        width: '100%',
        marginBottom: 6,
    },
    periodicText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 8,
    },
    dropdown: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    dropdownContainer: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    dropdownItem: {
        borderBottomWidth: 0,
    },
    dropdownSelectedText: {
        color: colors.text,
        fontSize: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    requiredMark: {
        fontSize: 14,
        color: colors.error,
        marginLeft: 4,
    },
    dropdownItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: colors.text,
    },
    accessory: {
        padding: 8,
    },
});

export default PeriodicSettingsComponent;

