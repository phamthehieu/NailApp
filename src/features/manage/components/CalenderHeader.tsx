import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Colors, useAppTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

type DayData = {
    day: string;
    date: string;
    isToday: boolean;
    fullDate: Date;
};

type Props = {
    selectedDate: Date;
    onChange: (date: Date) => void;
};

const CalendarHeader = ({ selectedDate, onChange }: Props) => {
    const {theme: { colors }} = useAppTheme();
    const { t, i18n } = useTranslation();
    const styles = $styles(colors);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());
    const [tempYear, setTempYear] = useState(selectedDate.getFullYear());

    const monthScrollRef = useRef<ScrollView | null>(null);
    const yearScrollRef = useRef<ScrollView | null>(null);
    const [optionItemHeight, setOptionItemHeight] = useState<number | null>(null);


    const weekDays = useMemo<DayData[]>(() => {
        const base = new Date(selectedDate);
        const currentDay = base.getDay();
        const startOfWeek = new Date(base);
        startOfWeek.setDate(base.getDate() - currentDay);

        const days: DayData[] = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const today = new Date();
            const isToday =
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate();

            days.push({
                day: dayNames[i],
                date: date.getDate().toString(),
                isToday,
                fullDate: date,
            });
        }

        return days;
    }, [selectedDate]);


    const formatMonthYear = () => {
        const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
        return selectedDate.toLocaleDateString(i18n.language, options);
    };

    const openPicker = () => {
        setTempMonth(selectedDate.getMonth());
        setTempYear(selectedDate.getFullYear());
        setPickerVisible(true);
    };

    useEffect(() => {
        if (!pickerVisible || optionItemHeight == null) return;
        // đảm bảo nội dung đã render và measure xong
        requestAnimationFrame(() => {
            setTimeout(() => {
                const monthIndex = tempMonth;
                const baseYear = selectedDate.getFullYear() - 50;
                const yearIndex = Math.max(0, Math.min(100, tempYear - baseYear));

                const offsetMonth = Math.max(0, monthIndex) * optionItemHeight;
                const offsetYear = Math.max(0, yearIndex) * optionItemHeight;

                monthScrollRef.current?.scrollTo({ y: offsetMonth, animated: false });
                yearScrollRef.current?.scrollTo({ y: offsetYear, animated: false });
            }, 0);
        });
    }, [pickerVisible, tempMonth, tempYear, selectedDate, optionItemHeight]);

    const confirmPicker = () => {
        const day = Math.min(
            selectedDate.getDate(),
            new Date(tempYear, tempMonth + 1, 0).getDate()
        );
        onChange(new Date(tempYear, tempMonth, day));
        setPickerVisible(false);
    };

    return (
        <>
            <View style={styles.container}>

                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => onChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7))}>
                        <ChevronLeft size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openPicker}>
                        <Text style={styles.monthYearText}>{formatMonthYear()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => onChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7))}>
                        <ChevronRight size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>


                <View style={styles.daysContainer}>
                    {weekDays.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayItem,
                                (selectedDate.getDate() === item.fullDate.getDate() && selectedDate.getMonth() === item.fullDate.getMonth() && selectedDate.getFullYear() === item.fullDate.getFullYear()) && styles.selectedItem,
                                item.isToday && styles.todayOutline,
                            ]}
                            onPress={() => onChange(item.fullDate)}
                        >
                            <Text style={[styles.dayText, { color: (selectedDate.getDate() === item.fullDate.getDate() && selectedDate.getMonth() === item.fullDate.getMonth() && selectedDate.getFullYear() === item.fullDate.getFullYear()) ? colors.text : colors.text }]}>{item.day}</Text>
                            <Text style={[styles.dateText, { color: (selectedDate.getDate() === item.fullDate.getDate() && selectedDate.getMonth() === item.fullDate.getMonth() && selectedDate.getFullYear() === item.fullDate.getFullYear()) ? colors.text : colors.text }]}>{item.date}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <Modal
                visible={pickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPickerVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('bookingManage.selectMonthAndYear')}</Text>
                        <View style={styles.pickersRow}>
                            <View style={styles.pickerColumn}>
                                <Text style={styles.columnTitle}>{t('bookingManage.month')}</Text>
                                <ScrollView ref={monthScrollRef}>
                                    {Array.from({ length: 12 }).map((_, m) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.optionItem, tempMonth === m && styles.optionSelected]}
                                            onPress={() => setTempMonth(m)}
                                            onLayout={(e) => {
                                                if (optionItemHeight == null) {
                                                    setOptionItemHeight(e.nativeEvent.layout.height);
                                                }
                                            }}
                                        >
                                            <Text style={[styles.optionText, tempMonth === m && styles.optionTextSelected]}>{t('bookingManage.month')} {m + 1}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={styles.pickerColumn}>
                                <Text style={styles.columnTitle}>{t('bookingManage.year')}</Text>
                                <ScrollView ref={yearScrollRef}>
                                    {Array.from({ length: 101 }).map((_, idx) => {
                                        const year = selectedDate.getFullYear() - 50 + idx;
                                        return (
                                            <TouchableOpacity
                                                key={year}
                                                style={[styles.optionItem, tempYear === year && styles.optionSelected]}
                                                onPress={() => setTempYear(year)}
                                                onLayout={(e) => {
                                                    if (optionItemHeight == null) {
                                                        setOptionItemHeight(e.nativeEvent.layout.height);
                                                    }
                                                }}
                                            >
                                                <Text style={[styles.optionText, tempYear === year && styles.optionTextSelected]}>{year}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setPickerVisible(false)}>
                                <Text style={styles.actionText}>{t('bookingManage.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.okButton]} onPress={confirmPicker}>
                                <Text style={[styles.actionText, styles.okText]}>{t('bookingManage.done')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const $styles = (colors: Colors) => {
    return StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
        paddingVertical: 8,
        gap: 16,
    },
    monthYearText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    iconButton: {
        padding: 8,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 55,
        paddingVertical: 8,
        borderRadius: 20,
    },
    selectedItem: {
        backgroundColor: colors.yellow,
    },
    dayText: {
        fontSize: 13,
        color: colors.text,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 16,
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
        padding: 16,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 0.4,
        borderColor: colors.border,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    pickersRow: {
        flexDirection: 'row',
        gap: 12,
    },
    pickerColumn: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        maxHeight: 240,
        overflow: 'hidden',
    },
    columnTitle: {
        padding: 8,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
        textAlign: 'center',
    },
    optionItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    optionSelected: {
        backgroundColor: colors.yellow,
    },
    optionText: {
        fontSize: 14,
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
        marginTop: 12,
        gap: 8,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
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