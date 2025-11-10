import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, ChevronDown, X } from "lucide-react-native";
import { Colors, useAppTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';
import { Dropdown } from 'react-native-element-dropdown';
import { CalendarDayPickerModal, CalendarWeekPickerModal, CalendarMonthPickerModal } from '@/shared/ui/CalendarPickers';

type Props = {
    selectedDate: Date;
    onChange: (date: Date) => void;
    onChangeRange?: (range: { start: Date; end: Date } | null) => void;
    viewMode?: 'Ngày' | 'Tuần' | 'Tháng';
    onViewModeChange?: (mode: 'Ngày' | 'Tuần' | 'Tháng') => void;
};

const CalendarHeader = ({ selectedDate, onChange, onChangeRange, viewMode: propViewMode, onViewModeChange }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const { width } = useWindowDimensions();
    const isSmall = width < 420; // phone screens
    const styles = $styles(colors, isSmall);
    const iconSize = isSmall ? 16 : 18;
    const [internalViewMode, setInternalViewMode] = useState<'Ngày' | 'Tuần' | 'Tháng'>('Ngày');
    const viewMode = propViewMode ?? internalViewMode;
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [committedRange, setCommittedRange] = useState<{ start: Date; end: Date } | null>(null);

    const viewModeOptions = useMemo(() => (
        [
            { label: t('calenderDashboard.calenderHeader.day'), value: 'Ngày' },
            { label: t('calenderDashboard.calenderHeader.week'), value: 'Tuần' },
            { label: t('calenderDashboard.calenderHeader.month'), value: 'Tháng' },
        ]
    ), []);


    const isToday = (date: Date) => {
        const now = new Date();
        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        );
    };

    const formatVNDate = (date: Date) => {
        const base = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
        return `${isToday(date) ? t('calenderDashboard.calenderHeader.today') + ', ' : ''}${base}`;
    };

    const goPrev = () => {
        if (viewMode === 'Ngày') {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            onChange(d);
            return;
        }
        if (viewMode === 'Tuần') {
            const start = getStartOfWeek(selectedDate);
            start.setDate(start.getDate() - 7);
            onChange(start);
            return;
        }
        const startMonth = getStartOfMonth(selectedDate);
        startMonth.setMonth(startMonth.getMonth() - 1);
        onChange(startMonth);
    };

    const goNext = () => {
        if (viewMode === 'Ngày') {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            onChange(d);
            return;
        }
        if (viewMode === 'Tuần') {
            const start = getStartOfWeek(selectedDate);
            start.setDate(start.getDate() + 7);
            onChange(start);
            return;
        }
        const startMonth = getStartOfMonth(selectedDate);
        startMonth.setMonth(startMonth.getMonth() + 1);
        onChange(startMonth);
    };

    const formatSelectedLabel = (date: Date) => {
        if (viewMode === 'Ngày') {
            return formatVNDate(date);
        }
        if (viewMode === 'Tuần') {
            if (committedRange) {
                const d1 = committedRange.start.getDate();
                const d2 = committedRange.end.getDate();
                const m2 = committedRange.end.getMonth() + 1;
                const y2 = committedRange.end.getFullYear();
                return `${d1} -${d2}/${m2}/${y2}`;
            }
            const start = getStartOfWeek(date);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            const d1 = start.getDate();
            const d2 = end.getDate();
            const m2 = end.getMonth() + 1;
            const y2 = end.getFullYear();
            return `${d1} -${d2}/${m2}/${y2}`;
        }
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${t('calenderDashboard.calenderHeader.month')} ${month}/${year}`;
    };

    const openPicker = () => {
        setIsPickerVisible(true);
    };

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getStartOfMonth = (date: Date) => {
        const d = new Date(date.getFullYear(), date.getMonth(), 1);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerRow}>

                    {isSmall ? (
                        isSearchActive ? (
                            <>
                                <TouchableOpacity onPress={() => setIsSearchActive(false)} style={styles.iconButton}>
                                    <X size={iconSize} color={colors.text} />
                                </TouchableOpacity>
                                <TextField
                                    autoFocus
                                    LeftAccessory={(props) => <Search size={isSmall ? 18 : 16} color={props.editable ? colors.text : colors.placeholderTextColor} />}
                                    placeholder={t('calenderDashboard.calenderHeader.searchPlaceholder') || 'Search...'}
                                    onChangeText={(text) => {
                                    }}
                                    inputWrapperStyle={[styles.searchBox]}
                                />
                            </>
                        ) : (
                            <TouchableOpacity style={styles.searchBoxContainer} activeOpacity={0.7} onPress={() => setIsSearchActive(true)}>
                                <Search size={16} color={colors.text} />
                            </TouchableOpacity>
                        )
                    ) : (
                        <TextField
                            LeftAccessory={(props) => <Search size={isSmall ? 18 : 16} color={props.editable ? colors.text : colors.placeholderTextColor} />}
                            placeholder={t('calenderDashboard.calenderHeader.searchPlaceholder') || 'Search...'}
                            onChangeText={(text) => {
                            }}
                            inputWrapperStyle={styles.searchBox}
                        />
                    )}

                    {!(isSmall && isSearchActive) && (
                        <>
                            <View style={{ flex: 1 }} />

                            <TouchableOpacity onPress={goPrev} style={styles.iconButton}>
                                <ChevronLeft size={iconSize} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={openPicker} style={styles.dateButton} activeOpacity={0.8}>
                                <Text style={styles.dateButtonText}>{formatSelectedLabel(selectedDate)}</Text>
                                <CalendarIcon size={isSmall ? 14 : 16} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goNext} style={styles.iconButton}>
                                <ChevronRight size={iconSize} color={colors.text} />
                            </TouchableOpacity>

                            <Dropdown
                                data={viewModeOptions}
                                labelField="label"
                                valueField="value"
                                value={viewMode}
                                onChange={(item: { label: string; value: 'Ngày' | 'Tuần' | 'Tháng' }) => {
                                    if (viewMode === 'Tuần' && item.value !== 'Tuần') {
                                        setCommittedRange(null);
                                    }
                                    if (item.value === 'Tuần') {
                                        setCommittedRange(null);
                                    }
                                    if (onViewModeChange) {
                                        onViewModeChange(item.value);
                                    } else {
                                        setInternalViewMode(item.value);
                                    }
                                }}
                                style={styles.viewModeButton}
                                selectedTextStyle={styles.viewModeText}
                                placeholder={viewMode}
                                placeholderStyle={styles.viewModeText}
                                itemTextStyle={{ color: colors.text }}
                                containerStyle={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                                activeColor={colors.background}
                                renderRightIcon={() => (
                                    <ChevronDown size={isSmall ? 12 : 14} color={colors.text} />
                                )}
                            />
                        </>
                    )}
                </View>
            </View>

            {viewMode === 'Ngày' && (
                <CalendarDayPickerModal
                    visible={isPickerVisible}
                    selectedDate={selectedDate}
                    locale={currentLanguage === 'en' ? 'en-US' : 'vi-VN'}
                    onClose={() => setIsPickerVisible(false)}
                    onConfirm={(date) => {
                        onChange(date);
                    }}
                />
            )}

            {viewMode === 'Tuần' && (
                <CalendarWeekPickerModal
                    visible={isPickerVisible}
                    selectedDate={selectedDate}
                    committedRange={committedRange}
                    locale={currentLanguage === 'en' ? 'en-US' : 'vi-VN'}
                    onClose={() => setIsPickerVisible(false)}
                    onConfirmWeek={(startDate) => {
                        onChange(startDate);
                        onChangeRange?.(null);
                        setCommittedRange(null);
                    }}
                    onConfirmRange={(range) => {
                        onChangeRange?.(range);
                        setCommittedRange(range);
                    }}
                    onClearRange={() => {
                        onChangeRange?.(null);
                        setCommittedRange(null);
                    }}
                />
            )}

            {viewMode === 'Tháng' && (
                <CalendarMonthPickerModal
                    visible={isPickerVisible}
                    selectedDate={selectedDate}
                    locale={currentLanguage === 'en' ? 'en-US' : 'vi-VN'}
                    onClose={() => setIsPickerVisible(false)}
                    onConfirm={(date) => {
                        onChange(date);
                    }}
                />
            )}

        </>
    );
};

const $styles = (colors: Colors, isSmall: boolean) => {
    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            paddingBottom: isSmall ? 6 : 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: isSmall ? 10 : 16,
            marginBottom: isSmall ? 6 : 10,
            paddingVertical: isSmall ? 6 : 8,
            gap: isSmall ? 10 : 16,
            height: 60,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 0,
            marginBottom: 0,
            paddingVertical: 0,
            gap: isSmall ? 10 : 16,
        },
        searchBoxContainer: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            backgroundColor: colors.card,
            paddingHorizontal: isSmall ? 10 : 16,
            paddingVertical: isSmall ? 6 : 8,
            marginRight: isSmall ? -20 : 0,
        },
        searchBox: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            backgroundColor: colors.card,
            minWidth: isSmall ? 300 : 600,
            flexShrink: 1,
        },
        searchPlaceholder: {
            color: colors.text,
            fontSize: isSmall ? 12 : 13,
        },
        iconButton: {
            padding: isSmall ? 6 : 8,
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: isSmall ? 6 : 8,
            paddingHorizontal: isSmall ? 10 : 12,
            height: isSmall ? 32 : 34,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            backgroundColor: colors.card,
        },
        dateButtonText: {
            color: colors.text,
            fontSize: isSmall ? 12 : 13,
            fontWeight: '600',
        },
        viewModeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: isSmall ? 10 : 12,
            height: isSmall ? 32 : 34,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            backgroundColor: colors.card,
            width: isSmall ? 80 : 120,
        },
        viewModeText: {
            color: colors.text,
            fontSize: isSmall ? 12 : 13,
            fontWeight: '600',
        },
    });
};

export default CalendarHeader;