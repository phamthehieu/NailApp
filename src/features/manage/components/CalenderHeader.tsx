import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, ChevronDown, X } from "lucide-react-native";
import { Colors, useAppTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@/shared/ui/DatePicker';

type Props = {
    selectedDate: Date;
    onChange: (date: Date) => void;
};

const CalendarHeader = ({ selectedDate, onChange }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isSmall = width < 420; // phone screens
    const styles = $styles(colors, isSmall);
    const iconSize = isSmall ? 16 : 18;
    const [viewMode, setViewMode] = useState<'Ngày' | 'Tuần' | 'Tháng'>('Ngày');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [tempMonth, setTempMonth] = useState<number>(selectedDate.getMonth());
    const [tempYear, setTempYear] = useState<number>(selectedDate.getFullYear());
    const [tempWeekIndex, setTempWeekIndex] = useState<number>(0);

    const viewModeOptions = useMemo(() => (
        [
            { label: t('calenderHeader.day'), value: 'Ngày' },
            { label: t('calenderHeader.week'), value: 'Tuần' },
            { label: t('calenderHeader.month'), value: 'Tháng' },
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
        return `${isToday(date) ? t('calenderHeader.today') + ', ' : ''}${base}`;
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
        // Tháng
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
        // Tháng
        const startMonth = getStartOfMonth(selectedDate);
        startMonth.setMonth(startMonth.getMonth() + 1);
        onChange(startMonth);
    };

    const formatSelectedLabel = (date: Date) => {
        if (viewMode === 'Ngày') {
            return formatVNDate(date);
        }
        if (viewMode === 'Tuần') {
            const start = getStartOfWeek(date);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            const d1 = start.getDate();
            const d2 = end.getDate();
            const m2 = end.getMonth() + 1;
            const y2 = end.getFullYear();
            return `${d1} -${d2}/${m2}/${y2}`;
        }
        // Tháng
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${t('calenderHeader.month')} ${month}/${year}`;
    };

    const openPicker = () => {
        // khởi tạo state tạm theo ngày hiện tại
        setTempMonth(selectedDate.getMonth());
        setTempYear(selectedDate.getFullYear());
        setIsPickerVisible(true);
    };

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay(); // 0=Sun ... 6=Sat
        const diff = day === 0 ? -6 : 1 - day; // start on Monday
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getStartOfMonth = (date: Date) => {
        const d = new Date(date.getFullYear(), date.getMonth(), 1);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const formatWeekRange = (start: Date, end: Date) => {
        const d1 = start.getDate();
        const d2 = end.getDate();
        const m2 = end.getMonth() + 1;
        const y2 = end.getFullYear();
        return `${d1} -${d2}/${m2}/${y2}`;
    };

    const getWeeksOfMonth = (year: number, monthIndex: number) => {
        const firstOfMonth = new Date(year, monthIndex, 1);
        const lastOfMonth = new Date(year, monthIndex + 1, 0);
        // bắt đầu từ thứ 2 của tuần chứa ngày 1
        let start = getStartOfWeek(firstOfMonth);
        const weeks: { start: Date; end: Date; label: string }[] = [];
        let idx = 1;
        while (start <= lastOfMonth || (start.getMonth() === monthIndex && start <= new Date(year, monthIndex + 1, 6))) {
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            const inMonth = start.getMonth() === monthIndex || end.getMonth() === monthIndex;
            if (inMonth) {
                weeks.push({ start: new Date(start), end, label: formatWeekRange(start, end) });
                idx += 1;
            }
            start = new Date(start);
            start.setDate(start.getDate() + 7);
        }
        return weeks;
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
                                    placeholder={t('calenderHeader.searchPlaceholder') || 'Search...'}
                                    onChangeText={(text) => {
                                        console.log(text);
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
                            placeholder={t('calenderHeader.searchPlaceholder') || 'Search...'}
                            onChangeText={(text) => {
                                console.log(text);
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
                                onChange={(item: { label: string; value: 'Ngày' | 'Tuần' | 'Tháng' }) => setViewMode(item.value)}
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
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    visible={isPickerVisible}
                    onChange={(d) => {
                        onChange(d);
                        setIsPickerVisible(false);
                    }}
                    onClose={() => setIsPickerVisible(false)}
                    title={t('calenderHeader.title')}
                    confirmText={t('calenderHeader.confirm')}
                    cancelText={t('calenderHeader.cancel')}
                    allowFutureDates={true}
                    allowPastDates={true}
                />
            )}

            {viewMode === 'Tuần' && (
                <Modal
                    animationType="fade"
                    transparent
                    visible={isPickerVisible}
                    onRequestClose={() => setIsPickerVisible(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>{t('calenderHeader.selectWeek')}</Text>

                            {/* Tháng và Tuần xếp ngang */}
                            <View style={styles.pickersRow}>
                                <View style={styles.pickerColumn}>
                                    <Text style={styles.columnTitle}>{t('calenderHeader.month')}</Text>
                                    <ScrollView>
                                        {Array.from({ length: 12 }).map((_, m) => {
                                            const selected = m === tempMonth;
                                            return (
                                                <TouchableOpacity
                                                    key={`wm-${m}`}
                                                    style={[styles.optionItem, selected && styles.optionSelected]}
                                                    onPress={() => setTempMonth(m)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{t('calenderHeader.month')} {m + 1}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                                <View style={styles.pickerColumn}>
                                    <Text style={styles.columnTitle}>{t('calenderHeader.week')}</Text>
                                    <ScrollView>
                                        {getWeeksOfMonth(selectedDate.getFullYear(), tempMonth).map((w, i) => {
                                            const selected = i === tempWeekIndex;
                                            return (
                                                <TouchableOpacity
                                                    key={`${w.label}-${i}`}
                                                    style={[styles.optionItem, selected && styles.optionSelected]}
                                                    onPress={() => setTempWeekIndex(i)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{w.label}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setIsPickerVisible(false)}>
                                    <Text style={styles.actionText}>{t('calenderHeader.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.okButton]}
                                    onPress={() => {
                                        const weeks = getWeeksOfMonth(selectedDate.getFullYear(), tempMonth);
                                        const chosen = weeks[Math.max(0, Math.min(tempWeekIndex, weeks.length - 1))];
                                        onChange(new Date(chosen.start));
                                        setIsPickerVisible(false);
                                    }}
                                >
                                    <Text style={[styles.actionText, styles.okText]}>{t('calenderHeader.confirm')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {viewMode === 'Tháng' && (
                <Modal
                    animationType="fade"
                    transparent
                    visible={isPickerVisible}
                    onRequestClose={() => setIsPickerVisible(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>{t('calenderHeader.selectMonth')}</Text>
                            <View style={styles.pickersRow}>
                                <View style={styles.pickerColumn}>
                                    <Text style={styles.columnTitle}>{t('calenderHeader.month')}</Text>
                                    <ScrollView>
                                        {Array.from({ length: 12 }).map((_, m) => {
                                            const selected = m === tempMonth;
                                            return (
                                                <TouchableOpacity
                                                    key={`m-${m}`}
                                                    style={[styles.optionItem, selected && styles.optionSelected]}
                                                    onPress={() => setTempMonth(m)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{t('calenderHeader.month')} {m + 1}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                                <View style={styles.pickerColumn}>
                                    <Text style={styles.columnTitle}>{t('calenderHeader.year') || 'Year'}</Text>
                                    <ScrollView>
                                        {Array.from({ length: 11 }).map((_, i) => {
                                            const y = selectedDate.getFullYear() - 5 + i;
                                            const selected = y === tempYear;
                                            return (
                                                <TouchableOpacity
                                                    key={`y-${y}`}
                                                    style={[styles.optionItem, selected && styles.optionSelected]}
                                                    onPress={() => setTempYear(y)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{y}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setIsPickerVisible(false)}>
                                    <Text style={styles.actionText}>{t('calenderHeader.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.okButton]}
                                    onPress={() => {
                                        onChange(new Date(tempYear, tempMonth, 1));
                                        setIsPickerVisible(false);
                                    }}
                                >
                                    <Text style={[styles.actionText, styles.okText]}>{t('calenderHeader.confirm')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
            borderRadius: 6,
            backgroundColor: colors.card,
            minWidth: 300,
            flexShrink: 1,
        },
        searchBoxActive: {
            height: isSmall ? 40 : 42,
            borderRadius: 8,
        },
        searchPlaceholder: {
            color: colors.text,
            fontSize: isSmall ? 12 : 13,
        },
        monthYearText: {
            fontSize: isSmall ? 16 : 18,
            fontWeight: '600',
            color: colors.text,
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
        daysContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingHorizontal: isSmall ? 6 : 8,
        },
        dayItem: {
            alignItems: 'center',
            justifyContent: 'center',
            width: isSmall ? 36 : 40,
            height: isSmall ? 48 : 55,
            paddingVertical: isSmall ? 6 : 8,
            borderRadius: isSmall ? 16 : 20,
        },
        selectedItem: {
            backgroundColor: colors.yellow,
        },
        dayText: {
            fontSize: isSmall ? 12 : 13,
            color: colors.text,
            marginBottom: 4,
        },
        dateText: {
            fontSize: isSmall ? 14 : 16,
            fontWeight: '600',
            color: colors.text,
        },
        todayOutline: {
            borderWidth: 1,
            borderColor: colors.yellow,
        },
        modalBackdrop: {
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isSmall ? 12 : 16,
        },
        modalContainer: {
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: isSmall ? 12 : 16,
            borderWidth: 0.4,
            borderColor: colors.border,
        },
        modalTitle: {
            fontSize: isSmall ? 14 : 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: isSmall ? 10 : 12,
            textAlign: 'center',
        },
        pickersRow: {
            flexDirection: 'row',
            gap: isSmall ? 8 : 12,
        },
        pickerColumn: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            maxHeight: isSmall ? 200 : 240,
            overflow: 'hidden',
        },
        columnTitle: {
            padding: isSmall ? 6 : 8,
            fontSize: isSmall ? 12 : 14,
            fontWeight: '600',
            color: colors.text,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            textAlign: 'center',
        },
        optionItem: {
            paddingVertical: isSmall ? 8 : 10,
            paddingHorizontal: isSmall ? 10 : 12,
        },
        optionSelected: {
            backgroundColor: colors.yellow,
        },
        optionText: {
            fontSize: isSmall ? 12 : 14,
            color: colors.text,
            textAlign: 'center',
        },
        optionTextSelected: {
            color: colors.text,
            fontWeight: '700',
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: isSmall ? 10 : 12,
            gap: isSmall ? 6 : 8,
        },
        actionButton: {
            paddingVertical: isSmall ? 8 : 10,
            paddingHorizontal: isSmall ? 12 : 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cancelButton: {
            backgroundColor: colors.card,
        },
        okButton: {
            backgroundColor: colors.yellow,
            borderColor: colors.yellow,
        },
        actionText: {
            color: colors.text,
            fontWeight: '600',
        },
        okText: {
            color: colors.text,
        },
    });
};

export default CalendarHeader;