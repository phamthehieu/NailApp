import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, View, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';
import { useAppTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { TextFieldLabel } from '@/shared/ui/Text';

export type CalendarRange = { start: Date; end: Date };

type BaseModalProps = {
    visible: boolean;
    onClose: () => void;
};

export type CalendarDayPickerModalProps = BaseModalProps & {
    selectedDate: Date;
    onConfirm: (date: Date) => void;
    locale?: string;
};

export const CalendarDayPickerModal: React.FC<CalendarDayPickerModalProps> = ({
    visible,
    onClose,
    selectedDate,
    onConfirm,
    locale = 'vi-VN',
}) => {
    const { theme: { colors } } = useAppTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isSmall = width < 420;
    const styles = useMemo(() => createStyles(colors, isSmall), [colors, isSmall]);
    const iconSize = isSmall ? 16 : 18;
    const today = useMemo(() => startOfDay(new Date()), []);

    const [displayYear, setDisplayYear] = useState<number>(selectedDate.getFullYear());
    const [displayMonth, setDisplayMonth] = useState<number>(selectedDate.getMonth());
    const [tempSelectedDate, setTempSelectedDate] = useState<Date>(startOfDay(selectedDate));

    useEffect(() => {
        if (!visible) { return; }
        const normalized = startOfDay(selectedDate);
        setDisplayYear(normalized.getFullYear());
        setDisplayMonth(normalized.getMonth());
        setTempSelectedDate(normalized);
    }, [visible, selectedDate]);

    const handlePrev = useCallback(() => {
        const prev = new Date(displayYear, displayMonth - 1, 1);
        setDisplayYear(prev.getFullYear());
        setDisplayMonth(prev.getMonth());
        setTempSelectedDate((prevSelected) => {
            const base = prevSelected ?? selectedDate;
            const day = Math.min(
                base.getDate(),
                new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate(),
            );
            const candidate = startOfDay(new Date(prev.getFullYear(), prev.getMonth(), day));
            return candidate;
        });
    }, [displayYear, displayMonth, selectedDate]);

    const handleNext = useCallback(() => {
        const next = new Date(displayYear, displayMonth + 1, 1);
        setDisplayYear(next.getFullYear());
        setDisplayMonth(next.getMonth());
        setTempSelectedDate((prevSelected) => {
            const base = prevSelected ?? selectedDate;
            const day = Math.min(
                base.getDate(),
                new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate(),
            );
            const candidate = startOfDay(new Date(next.getFullYear(), next.getMonth(), day));
            return candidate;
        });
    }, [displayYear, displayMonth, selectedDate]);

    const handleConfirm = useCallback(() => {
        if (!tempSelectedDate) {
            onClose();
            return;
        }
        onConfirm(startOfDay(tempSelectedDate));
        onClose();
    }, [tempSelectedDate, onConfirm, onClose]);

    if (!visible) {
        return null;
    }

    const matrix = getMonthMatrix(displayYear, displayMonth);
    const localeToUse = locale || 'vi-VN';

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <View style={styles.weekHeaderRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={handlePrev} activeOpacity={0.7}>
                            <ChevronLeft size={iconSize} color={colors.text} />
                        </TouchableOpacity>
                        <TextFieldLabel style={styles.monthYearText}>
                            {new Intl.DateTimeFormat(localeToUse, { month: 'long', year: 'numeric' }).format(new Date(displayYear, displayMonth, 1))}
                        </TextFieldLabel>
                        <TouchableOpacity style={styles.iconButton} onPress={handleNext} activeOpacity={0.7}>
                            <ChevronRight size={iconSize} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekdayRow}>
                        {WEEKDAY_LABELS.map((d) => (
                            <TextFieldLabel key={d} style={styles.weekdayText}>{d}</TextFieldLabel>
                        ))}
                    </View>

                    <View style={styles.monthGrid}>
                        {matrix.map((d, idx) => {
                            const inMonth = d.getMonth() === displayMonth;
                            const isTodayCell = isSameDay(d, today);
                            const selected = tempSelectedDate ? isSameDay(d, tempSelectedDate) : false;
                            return (
                                <TouchableOpacity
                                    key={`single-day-${idx}`}
                                    style={[
                                        styles.dayCell,
                                        !inMonth && styles.outMonthDay,
                                        selected && styles.dayCellSelected,
                                        isTodayCell && !selected && styles.todayOutline,
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setTempSelectedDate(startOfDay(new Date(d)));
                                    }}
                                >
                                    <TextFieldLabel style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                                        {d.getDate()}
                                    </TextFieldLabel>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
                            <TextFieldLabel style={styles.actionText}>{t('calenderDashboard.calenderHeader.cancel')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.okButton]} onPress={handleConfirm}>
                            <TextFieldLabel style={[styles.actionText, styles.okText]}>{t('calenderDashboard.calenderHeader.confirm')}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export type CalendarWeekPickerModalProps = BaseModalProps & {
    selectedDate: Date;
    committedRange: CalendarRange | null;
    onConfirmWeek: (startDate: Date) => void;
    onConfirmRange: (range: CalendarRange) => void;
    onClearRange: () => void;
    locale?: string;
};

export const CalendarWeekPickerModal: React.FC<CalendarWeekPickerModalProps> = ({
    visible,
    onClose,
    selectedDate,
    committedRange,
    onConfirmWeek,
    onConfirmRange,
    onClearRange,
    locale = 'vi-VN',
}) => {
    const { theme: { colors } } = useAppTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isSmall = width < 420;
    const styles = useMemo(() => createStyles(colors, isSmall), [colors, isSmall]);
    const iconSize = isSmall ? 16 : 18;
    const today = useMemo(() => startOfDay(new Date()), []);

    const [rangeMode, setRangeMode] = useState<boolean>(false);
    const [displayYear, setDisplayYear] = useState<number>(selectedDate.getFullYear());
    const [displayMonth, setDisplayMonth] = useState<number>(selectedDate.getMonth());
    const [tempWeekIndex, setTempWeekIndex] = useState<number>(0);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

    useEffect(() => {
        if (!visible) { return; }

        const normalizedSelected = startOfDay(selectedDate);

        if (committedRange) {
            const start = startOfDay(committedRange.start);
            const end = endOfDay(committedRange.end);
            setRangeMode(true);
            setTempStartDate(start);
            setTempEndDate(end);
            setDisplayYear(start.getFullYear());
            setDisplayMonth(start.getMonth());
            const weeks = getWeeksOfMonth(start.getFullYear(), start.getMonth());
            const idx = weeks.findIndex((w) => start >= w.start && start <= w.end);
            setTempWeekIndex(idx >= 0 ? idx : 0);
            return;
        }

        setRangeMode(false);
        setDisplayYear(normalizedSelected.getFullYear());
        setDisplayMonth(normalizedSelected.getMonth());

        const weeks = getWeeksOfMonth(normalizedSelected.getFullYear(), normalizedSelected.getMonth());
        let idx = weeks.findIndex((w) => normalizedSelected >= w.start && normalizedSelected <= w.end);
        if (idx === -1) {
            idx = 0;
        }
        idx = Math.max(0, idx);
        setTempWeekIndex(idx);
        const chosen = weeks[idx];
        if (chosen) {
            setTempStartDate(new Date(chosen.start));
            setTempEndDate(new Date(chosen.end));
        } else {
            setTempStartDate(null);
            setTempEndDate(null);
        }
    }, [visible, selectedDate, committedRange]);

    const handlePrevMonth = useCallback(() => {
        const d = new Date(displayYear, displayMonth, 1);
        d.setMonth(d.getMonth() - 1);
        setDisplayYear(d.getFullYear());
        setDisplayMonth(d.getMonth());
        setTempWeekIndex(0);
        if (rangeMode) {
            setTempStartDate(null);
            setTempEndDate(null);
        }
    }, [displayYear, displayMonth, rangeMode]);

    const handleNextMonth = useCallback(() => {
        const d = new Date(displayYear, displayMonth, 1);
        d.setMonth(d.getMonth() + 1);
        setDisplayYear(d.getFullYear());
        setDisplayMonth(d.getMonth());
        setTempWeekIndex(0);
        if (rangeMode) {
            setTempStartDate(null);
            setTempEndDate(null);
        }
    }, [displayYear, displayMonth, rangeMode]);

    const handleConfirm = useCallback(() => {
        const weeks = getWeeksOfMonth(displayYear, displayMonth);
        const usedIdx = Math.min(tempWeekIndex, weeks.length - 1);
        const chosen = weeks[usedIdx];

        if (!rangeMode) {
            if (chosen) {
                onConfirmWeek(new Date(chosen.start));
            }
            onClose();
            return;
        }

        if (tempStartDate && tempEndDate) {
            const start = startOfDay(tempStartDate);
            const end = endOfDay(tempEndDate);
            onConfirmRange({ start, end });
            onClose();
            return;
        }
        if (tempStartDate) {
            const start = startOfDay(tempStartDate);
            const end = endOfDay(tempStartDate);
            onConfirmRange({ start, end });
            onClose();
            return;
        }

        if (chosen) {
            onConfirmWeek(new Date(chosen.start));
        }
        onClose();
    }, [displayYear, displayMonth, tempWeekIndex, rangeMode, tempStartDate, tempEndDate, onConfirmWeek, onConfirmRange, onClose]);

    const handleSwitchToWeek = useCallback(() => {
        setRangeMode(false);
        setTempStartDate((prev) => prev ? new Date(prev) : null);
        setTempEndDate((prev) => prev ? new Date(prev) : null);
        onClearRange();
        const weeks = getWeeksOfMonth(displayYear, displayMonth);
        let targetDate: Date;
        if (tempStartDate) {
            targetDate = tempStartDate;
        } else {
            targetDate = selectedDate;
        }
        const normalizedTarget = startOfDay(targetDate);
        let newWeekIndex = weeks.findIndex((w) => normalizedTarget >= w.start && normalizedTarget <= w.end);
        if (newWeekIndex === -1) {
            newWeekIndex = 0;
        }
        const validIndex = Math.max(0, Math.min(newWeekIndex, weeks.length - 1));
        setTempWeekIndex(validIndex);
        const chosen = weeks[validIndex];
        if (chosen) {
            setTempStartDate(new Date(chosen.start));
            setTempEndDate(new Date(chosen.end));
        }
    }, [displayYear, displayMonth, selectedDate, tempStartDate, onClearRange]);

    const handleSwitchToRange = useCallback(() => {
        setRangeMode(true);
        setTempStartDate(null);
        setTempEndDate(null);
    }, []);

    if (!visible) {
        return null;
    }

    const matrix = getMonthMatrix(displayYear, displayMonth);
    const weeks = getWeeksOfMonth(displayYear, displayMonth);
    const chosen = weeks[Math.max(0, Math.min(tempWeekIndex, weeks.length - 1))];
    const localeToUse = locale || 'vi-VN';

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <TextFieldLabel style={styles.modalTitle}>{t('calenderDashboard.calenderHeader.selectWeek')}</TextFieldLabel>
                    <View style={styles.segmentContainer}>
                        <TouchableOpacity
                            style={[styles.segmentButton, !rangeMode && styles.segmentActive]}
                            onPress={handleSwitchToWeek}
                            activeOpacity={0.7}
                        >
                            <TextFieldLabel style={[styles.segmentText, !rangeMode && styles.segmentTextActive]}>
                                {t('calenderDashboard.calenderHeader.week')}
                            </TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentButton, rangeMode && styles.segmentActive]}
                            onPress={handleSwitchToRange}
                            activeOpacity={0.7}
                        >
                            <TextFieldLabel style={[styles.segmentText, rangeMode && styles.segmentTextActive]}>
                                {t('calenderDashboard.calenderHeader.range')}
                            </TextFieldLabel>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekHeaderRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={handlePrevMonth} activeOpacity={0.7}>
                            <ChevronLeft size={iconSize} color={colors.text} />
                        </TouchableOpacity>
                        <TextFieldLabel style={styles.monthYearText}>
                            {new Intl.DateTimeFormat(localeToUse, { month: 'long', year: 'numeric' }).format(new Date(displayYear, displayMonth, 1))}
                        </TextFieldLabel>
                        <TouchableOpacity style={styles.iconButton} onPress={handleNextMonth} activeOpacity={0.7}>
                            <ChevronRight size={iconSize} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekdayRow}>
                        {WEEKDAY_LABELS.map((d) => (
                            <TextFieldLabel key={d} style={styles.weekdayText}>{d}</TextFieldLabel>
                        ))}
                    </View>

                    <View style={styles.monthGrid}>
                        {matrix.map((d, idx) => {
                            const inMonth = d.getMonth() === displayMonth;
                            const isInChosenWeek = !rangeMode && chosen && d >= chosen.start && d <= chosen.end;
                            const isTodayCell = d.getTime() === today.getTime();
                            const isInRangeSelected = rangeMode && !!(tempStartDate && tempEndDate && d >= tempStartDate && d <= tempEndDate);
                            const dNormalized = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            const startNormalized = tempStartDate ? new Date(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate()) : null;
                            const endNormalized = tempEndDate ? new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), tempEndDate.getDate()) : null;
                            const isRangeStart = rangeMode && startNormalized && dNormalized.getTime() === startNormalized.getTime();
                            const isRangeEnd = rangeMode && endNormalized && dNormalized.getTime() === endNormalized.getTime();

                            return (
                                <TouchableOpacity
                                    key={`week-day-${idx}`}
                                    style={[
                                        styles.dayCell,
                                        !inMonth && styles.outMonthDay,
                                        isInRangeSelected && styles.rangeSelected,
                                        isRangeStart && styles.rangeStart,
                                        isRangeEnd && styles.rangeEnd,
                                        !rangeMode && isInChosenWeek && styles.dayCellSelected,
                                        isTodayCell && !isInChosenWeek && styles.todayOutline,
                                        isTodayCell && isInChosenWeek && styles.todayInWeek,
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        const currentWeeks = getWeeksOfMonth(displayYear, displayMonth);
                                        const weekIdx = currentWeeks.findIndex((w) => d >= w.start && d <= w.end);
                                        if (!rangeMode) {
                                            const nextIdx = Math.max(0, weekIdx);
                                            setTempWeekIndex(nextIdx);
                                            const newChosen = currentWeeks[Math.max(0, nextIdx)];
                                            if (newChosen) {
                                                setTempStartDate(new Date(newChosen.start));
                                                setTempEndDate(new Date(newChosen.end));
                                            }
                                            return;
                                        }

                                        if (!tempStartDate) {
                                            setTempStartDate(new Date(d));
                                            setTempEndDate(null);
                                            return;
                                        }
                                        if (!tempEndDate) {
                                            if (d < tempStartDate) {
                                                setTempEndDate(new Date(tempStartDate));
                                                setTempStartDate(new Date(d));
                                            } else {
                                                setTempEndDate(new Date(d));
                                            }
                                            return;
                                        }

                                        if (d < tempStartDate) {
                                            setTempStartDate(new Date(d));
                                            return;
                                        }
                                        if (d > tempEndDate) {
                                            setTempEndDate(new Date(d));
                                            return;
                                        }
                                        setTempStartDate(new Date(d));
                                        setTempEndDate(null);
                                    }}
                                >
                                    <TextFieldLabel style={styles.dayNumber}>{d.getDate()}</TextFieldLabel>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
                            <TextFieldLabel style={styles.actionText}>{t('calenderDashboard.calenderHeader.cancel')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.okButton]} onPress={handleConfirm}>
                            <TextFieldLabel style={[styles.actionText, styles.okText]}>{t('calenderDashboard.calenderHeader.confirm')}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export type CalendarMonthPickerModalProps = BaseModalProps & {
    selectedDate: Date;
    onConfirm: (date: Date) => void;
    locale?: string;
};

export const CalendarMonthPickerModal: React.FC<CalendarMonthPickerModalProps> = ({
    visible,
    onClose,
    selectedDate,
    onConfirm,
    locale = 'vi-VN',
}) => {
    const { theme: { colors } } = useAppTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isSmall = width < 420;
    const styles = useMemo(() => createStyles(colors, isSmall), [colors, isSmall]);
    const iconSize = isSmall ? 16 : 18;

    const [displayMonth, setDisplayMonth] = useState<number>(selectedDate.getMonth());
    const [displayYear, setDisplayYear] = useState<number>(selectedDate.getFullYear());
    const [mode, setMode] = useState<'month' | 'year'>('month');

    useEffect(() => {
        if (!visible) { return; }
        setDisplayMonth(selectedDate.getMonth());
        setDisplayYear(selectedDate.getFullYear());
        setMode('month');
    }, [visible, selectedDate]);

    const handleConfirm = useCallback(() => {
        onConfirm(new Date(displayYear, displayMonth, 1));
        onClose();
    }, [displayYear, displayMonth, onConfirm, onClose]);

    if (!visible) {
        return null;
    }

    const years = useMemo(() => getYearsInRange(), []);
    const localeToUse = locale || 'vi-VN';
    const monthLabels = useMemo(() => {
        return MONTH_NAMES.map((fallback, index) => {
            try {
                return new Intl.DateTimeFormat(localeToUse, { month: 'short' }).format(new Date(2020, index, 1));
            } catch (error) {
                return fallback;
            }
        });
    }, [localeToUse]);

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <TextFieldLabel style={styles.modalTitle}>
                        {mode === 'month'
                            ? t('calenderDashboard.calenderHeader.monthPicker')
                            : t('calenderDashboard.calenderHeader.yearPicker')}
                    </TextFieldLabel>

                    {mode === 'month' ? (
                        <>
                            <View style={styles.pickerHeaderRow}>
                                <TouchableOpacity
                                    style={styles.yearDropdownButton}
                                    onPress={() => setMode('year')}
                                    activeOpacity={0.7}
                                >
                                    <TextFieldLabel style={styles.yearDropdownText}>{displayYear}</TextFieldLabel>
                                    <ChevronDown size={iconSize} color={colors.text} />
                                </TouchableOpacity>
                                <View style={styles.headerNavButtons}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => setDisplayYear(displayYear - 1)}
                                        activeOpacity={0.7}
                                    >
                                        <ChevronLeft size={iconSize} color={colors.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => setDisplayYear(displayYear + 1)}
                                        activeOpacity={0.7}
                                    >
                                        <ChevronRight size={iconSize} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.monthPickerGrid}>
                                {monthLabels.map((monthName, index) => {
                                    const selected = index === displayMonth;
                                    return (
                                        <TouchableOpacity
                                            key={`month-${index}`}
                                            style={[styles.monthYearCell, selected && styles.monthYearCellSelected]}
                                            onPress={() => setDisplayMonth(index)}
                                            activeOpacity={0.7}
                                        >
                                            <TextFieldLabel style={[styles.monthYearCellText, selected && styles.monthYearCellTextSelected]}>
                                                {monthName}
                                            </TextFieldLabel>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.pickerHeaderRow}>
                                <TouchableOpacity
                                    style={styles.yearDropdownButton}
                                    onPress={() => setMode('month')}
                                    activeOpacity={0.7}
                                >
                                    <TextFieldLabel style={styles.yearDropdownText}>
                                        {`${years[0]} - ${years[years.length - 1]}`}
                                    </TextFieldLabel>
                                    <ChevronDown size={iconSize} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{ maxHeight: isSmall ? 240 : 280 }}>
                                <View style={styles.yearPickerGrid}>
                                    {years.map((year) => {
                                        const selected = year === displayYear;
                                        return (
                                            <TouchableOpacity
                                                key={`year-${year}`}
                                                style={[styles.monthYearCell, selected && styles.monthYearCellSelected]}
                                                onPress={() => {
                                                    setDisplayYear(year);
                                                    setMode('month');
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <TextFieldLabel style={[styles.monthYearCellText, selected && styles.monthYearCellTextSelected]}>
                                                    {year}
                                                </TextFieldLabel>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </>
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
                            <TextFieldLabel style={styles.actionText}>{t('calenderDashboard.calenderHeader.cancel')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.okButton]} onPress={handleConfirm}>
                            <TextFieldLabel style={[styles.actionText, styles.okText]}>{t('calenderDashboard.calenderHeader.confirm')}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const endOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};

const isSameDay = (d1: Date, d2: Date) => (
    d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
);

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
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
    let start = getStartOfWeek(firstOfMonth);
    const weeks: { start: Date; end: Date; label: string }[] = [];
    while (start <= lastOfMonth || (start.getMonth() === monthIndex && start <= new Date(year, monthIndex + 1, 6))) {
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const inMonth = start.getMonth() === monthIndex || end.getMonth() === monthIndex;
        if (inMonth) {
            weeks.push({ start: new Date(start), end, label: formatWeekRange(start, end) });
        }
        start = new Date(start);
        start.setDate(start.getDate() + 7);
    }
    return weeks;
};

const getMonthMatrix = (year: number, monthIndex: number) => {
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const start = getStartOfWeek(firstDayOfMonth);
    const days: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
    }
    return days;
};

const getYearsInRange = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = -10; i <= 5; i += 1) {
        years.push(currentYear + i);
    }
    return years;
};

const createStyles = (colors: any, isSmall: boolean) => StyleSheet.create({
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
    weekHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isSmall ? 6 : 8,
    },
    iconButton: {
        padding: isSmall ? 6 : 8,
    },
    monthYearText: {
        fontSize: isSmall ? 16 : 18,
        fontWeight: '600',
        color: colors.text,
    },
    weekdayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: isSmall ? 6 : 8,
        marginBottom: isSmall ? 4 : 6,
    },
    weekdayText: {
        width: `${100 / 7}%`,
        textAlign: 'center',
        color: colors.text,
        fontSize: isSmall ? 11 : 12,
        fontWeight: '600',
        opacity: 0.8,
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        marginVertical: 2,
    },
    dayCellSelected: {
        backgroundColor: colors.yellow,
    },
    outMonthDay: {
        opacity: 0.4,
    },
    todayOutline: {
        borderWidth: 1,
        borderColor: colors.yellow,
    },
    todayInWeek: {
        borderWidth: 1,
        borderColor: colors.text,
    },
    disabledDay: {
        opacity: 0.35,
    },
    dayNumber: {
        color: colors.text,
        fontSize: isSmall ? 12 : 14,
        fontWeight: '600',
    },
    dayNumberSelected: {
        color: colors.card,
        fontWeight: '700',
    },
    rangeSelected: {
        backgroundColor: colors.yellow,
    },
    rangeStart: {
        borderWidth: 2,
        borderColor: colors.yellow,
    },
    rangeEnd: {
        borderWidth: 2,
        borderColor: colors.yellow,
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
    segmentContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: isSmall ? 8 : 10,
    },
    segmentButton: {
        paddingVertical: isSmall ? 6 : 8,
        paddingHorizontal: isSmall ? 10 : 12,
        backgroundColor: colors.card,
    },
    segmentActive: {
        backgroundColor: colors.yellow,
    },
    segmentText: {
        color: colors.text,
        fontSize: isSmall ? 12 : 13,
        fontWeight: '600',
    },
    segmentTextActive: {
        color: colors.text,
    },
    pickerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isSmall ? 12 : 16,
        paddingHorizontal: isSmall ? 4 : 8,
    },
    yearDropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmall ? 6 : 8,
        paddingHorizontal: isSmall ? 10 : 12,
        paddingVertical: isSmall ? 6 : 8,
    },
    yearDropdownText: {
        fontSize: isSmall ? 14 : 16,
        fontWeight: '600',
        color: colors.text,
    },
    headerNavButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
    },
    monthPickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: isSmall ? 4 : 6,
        paddingHorizontal: isSmall ? 4 : 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yearPickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: isSmall ? 6 : 8,
        paddingHorizontal: isSmall ? 4 : 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthYearCell: {
        flex: 1,
        minWidth: '20%',
        maxWidth: '25%',
        aspectRatio: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: isSmall ? 6 : 8,
    },
    monthYearCellSelected: {
        backgroundColor: colors.yellow,
        borderColor: colors.yellow,
    },
    monthYearCellText: {
        fontSize: isSmall ? 13 : 15,
        fontWeight: '600',
        color: colors.text,
    },
    monthYearCellTextSelected: {
        color: colors.text,
        fontWeight: '700',
    },
});


