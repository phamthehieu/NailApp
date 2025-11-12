import { Pressable, StyleSheet, Switch, View, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { ChevronDown } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { Text } from "@/shared/ui/Text";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";

export type PeriodicSettings = {
    repeatBy: string;
    repeatValue: string;
    endDate: string;
};

type PeriodicSettingsComponentProps = {
    isPeriodic: boolean;
    onPeriodicChange: (isPeriodic: boolean) => void;
    settings: PeriodicSettings;
    onSettingsChange: (settings: PeriodicSettings) => void;
    repeatByOptions?: Array<{ label: string; value: string }>;
    repeatValueOptions?: Array<{ label: string; value: string }>;
    endDateOptions?: Array<{ label: string; value: string }>;
};

const PeriodicSettingsComponent = ({
    isPeriodic,
    onPeriodicChange,
    settings,
    onSettingsChange,
    repeatByOptions: customRepeatByOptions,
    repeatValueOptions: customRepeatValueOptions,
    endDateOptions: customEndDateOptions,
}: PeriodicSettingsComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const { t } = useTranslation();

    const repeatByOptions = useMemo(() => 
        customRepeatByOptions || [
            { label: t('bookingInformation.repeatByOptions.day'), value: "day" },
            { label: t('bookingInformation.repeatByOptions.week'), value: "week" },
            { label: t('bookingInformation.repeatByOptions.month'), value: "month" },
        ],
        [customRepeatByOptions, t]
    );

    const repeatValueOptions = useMemo(() => 
        customRepeatValueOptions || (() => {
            const options = [];
            for (let i = 1; i <= 30; i++) {
                options.push({ label: i.toString(), value: i.toString() });
            }
            return options;
        })(),
        [customRepeatValueOptions]
    );

    const endDateOptions = useMemo(() => 
        customEndDateOptions || (() => {
            const options = [];
            const today = new Date();
            for (let i = 0; i < 90; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
                const label = i === 0 ? `${t('bookingInformation.today')} (${day}/${month}/${year})` : `${dayName}, ${day}/${month}/${year}`;
                options.push({ label, value: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` });
            }
            return options;
        })(),
        [customEndDateOptions, t]
    );

    const handleRepeatByChange = (value: string) => {
        onSettingsChange({
            ...settings,
            repeatBy: value,
            repeatValue: "", // Reset repeatValue when repeatBy changes
        });
    };

    const handleRepeatValueChange = (value: string) => {
        onSettingsChange({
            ...settings,
            repeatValue: value,
        });
    };

    const handleEndDateChange = (value: string) => {
        onSettingsChange({
            ...settings,
            endDate: value,
        });
    };

    return (
        <View>
            <Pressable style={styles.row} onPress={() => onPeriodicChange(!isPeriodic)}>
                <Switch
                    value={isPeriodic}
                    onValueChange={onPeriodicChange}
                    thumbColor={isPeriodic ? colors.yellow : colors.primary}
                    trackColor={{ true: colors.yellow + "55", false: colors.border }}
                />
                <Text text={t('bookingInformation.isPeriodic')} style={styles.periodicText} />
            </Pressable>

            {isPeriodic && (
                <View style={isWide ? styles.rowWithGap : styles.columnWithGap}>
                    <View style={isWide ? styles.dropdownField : styles.dropdownFieldColumn}>
                        <View style={styles.labelRow}>
                            <Text text={t('bookingInformation.repeatBy')} />
                            <Text text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Dropdown
                            data={repeatByOptions}
                            labelField="label"
                            valueField="value"
                            value={settings.repeatBy}
                            onChange={({ value }) => handleRepeatByChange(value as string)}
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
                        />
                    </View>

                    <View style={isWide ? styles.dropdownField : styles.dropdownFieldColumn}>
                        <View style={styles.labelRow}>
                            <Text text={t('bookingInformation.repeatValue')} />
                            <Text text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Dropdown
                            data={repeatValueOptions}
                            labelField="label"
                            valueField="value"
                            value={settings.repeatValue}
                            onChange={({ value }) => handleRepeatValueChange(value as string)}
                            style={styles.dropdown}
                            showsVerticalScrollIndicator={false}
                            containerStyle={styles.dropdownContainer}
                            itemContainerStyle={styles.dropdownItem}
                            selectedTextStyle={styles.dropdownSelectedText}
                            itemTextStyle={{ color: colors.text }}
                            placeholderStyle={styles.dropdownSelectedText}
                            placeholder={
                                settings.repeatBy === "day" 
                                    ? t('bookingInformation.repeatValueDayPlaceholder') 
                                    : settings.repeatBy === "week" 
                                    ? t('bookingInformation.repeatValueWeekPlaceholder') 
                                    : settings.repeatBy === "month" 
                                    ? t('bookingInformation.repeatValueMonthPlaceholder') 
                                    : t('bookingInformation.repeatValueDayPlaceholder')
                            }
                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                            maxHeight={220}
                            activeColor={colors.backgroundDisabled}
                        />
                    </View>

                    <View style={isWide ? styles.dropdownField : styles.dropdownFieldColumn}>
                        <View style={styles.labelRow}>
                            <Text text={t('bookingInformation.endDate')} />
                            <Text text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Dropdown
                            data={endDateOptions}
                            labelField="label"
                            valueField="value"
                            value={settings.endDate}
                            onChange={({ value }) => handleEndDateChange(value as string)}
                            style={styles.dropdown}
                            showsVerticalScrollIndicator={false}
                            containerStyle={styles.dropdownContainer}
                            itemContainerStyle={styles.dropdownItem}
                            selectedTextStyle={styles.dropdownSelectedText}
                            itemTextStyle={{ color: colors.text }}
                            placeholderStyle={styles.dropdownSelectedText}
                            placeholder={t('bookingInformation.endDatePlaceholder')}
                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                            maxHeight={220}
                            activeColor={colors.backgroundDisabled}
                        />
                    </View>
                </View>
            )}
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
        marginBottom: 6,
    },
    requiredMark: {
        fontSize: 14,
        color: colors.error,
        marginLeft: 4,
    },
});

export default PeriodicSettingsComponent;

