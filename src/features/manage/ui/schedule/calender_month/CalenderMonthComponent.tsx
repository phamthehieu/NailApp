import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { Colors, useAppTheme } from '@/shared/theme';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { TextFieldLabel } from '@/shared/ui/Text';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/store';

type Props = {
    selectedDate: Date;
    onPressScheduleItem: (item: any) => void;
};

type CalendarDay = {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: Array<{
        id: string;
        userId: string;
        title: string;
        startTime: string;
        endTime: string;
        color: string;
        borderColor: string;
        userName: string;
    }>;
};

const CalenderMonthComponent = ({ selectedDate, onPressScheduleItem }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const { t } = useTranslation();
    const isTablet = useIsTablet();
    const { width: screenWidth } = useWindowDimensions();
    const styles = $styles(colors, isTablet);
    const headerScrollRef = useRef<ScrollView>(null);
    const bodyScrollRef = useRef<ScrollView>(null);
    const listBookingManagerByRange = useAppSelector((state) => state.booking.listBookingManagerByRange);

    const MIN_CELL_WIDTH = 120;
    const NUM_COLUMNS = 7;
    const MIN_TOTAL_WIDTH = MIN_CELL_WIDTH * NUM_COLUMNS;
    const needsHorizontalScroll = screenWidth < MIN_TOTAL_WIDTH;

    const formatUserName = (fullName: string): string => {
        const parts = fullName.split(' ');
        if (parts.length === 1) return parts[0];

        const initials = parts.slice(0, -1).map(p => p[0]?.toUpperCase() || '').join('.');
        const lastName = parts[parts.length - 1];
        return `${initials}.${lastName}`;
    };

    const normalizeTimeParts = (time?: string) => {
        if (!time) {
            return { hours: 0, minutes: 0 };
        }

        if (time.includes(':')) {
            const [hourPart = '0', minutePart = '0'] = time.split(':');
            return {
                hours: Number(hourPart) || 0,
                minutes: Number(minutePart) || 0,
            };
        }

        const sanitized = time.replace(/[^\d]/g, '');
        const hours = Number(sanitized.substring(0, 2)) || 0;
        const minutes = Number(sanitized.substring(2, 4)) || 0;

        return { hours, minutes };
    };

    const formatTime = (time24h: string): string => {
        if (!time24h) return '';
        const { hours, minutes } = normalizeTimeParts(time24h);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const addMinutesToTime = (time24h: string, minutesToAdd: number): string => {
        if (!time24h) return '';
        const { hours, minutes } = normalizeTimeParts(time24h);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + minutesToAdd);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const isSameDay = (date1: Date, date2: Date): boolean => {
        if (!date1 || !date2) return false;
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0:
                return colors.blue;
            case 1:
                return colors.yellow;
            case 2:
                return colors.purple;
            case 3:
                return colors.green;
            default:
                return colors.borderTable;
        }
    };

    const calendarDays = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDate = new Date(firstDay);
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - diff);

        const endDate = new Date(lastDay);
        const endDayOfWeek = endDate.getDay();
        const endDiff = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
        endDate.setDate(endDate.getDate() + endDiff);

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentDate = new Date(startDate);
        const bookings = Array.isArray(listBookingManagerByRange) ? listBookingManagerByRange : [];

        while (currentDate <= endDate) {
            const dateCopy = new Date(currentDate);
            dateCopy.setHours(0, 0, 0, 0);

            const dayEvents = bookings
                .filter(item => item.bookingDate && isSameDay(new Date(item.bookingDate), dateCopy))
                .map(item => {
                    const totalServiceMinutes = item.services?.reduce((total, service) => total + (service.serviceTime || 0), 0) || 0;
                    const color = getStatusColor(item.status);
                    return {
                        id: String(item.id ?? item.code),
                        userId: String(item.customer?.id ?? ''),
                        title: item.code,
                        startTime: item.bookingHours || '',
                        endTime: totalServiceMinutes > 0 ? addMinutesToTime(item.bookingHours, totalServiceMinutes) : item.bookingHours || '',
                        color,
                        borderColor: color,
                        userName: formatUserName(item.customer?.name || ''),
                    };
                });

            days.push({
                date: dateCopy,
                dayNumber: currentDate.getDate(),
                isCurrentMonth: currentDate.getMonth() === month,
                isToday: isSameDay(dateCopy, today),
                events: dayEvents,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    }, [selectedDate, listBookingManagerByRange, colors]);

    const weeks = useMemo(() => {
        const result: CalendarDay[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7));
        }
        return result;
    }, [calendarDays]);

    const renderEvent = (event: CalendarDay['events'][0], index: number) => {
        const formattedStart = formatTime(event.startTime);
        const formattedEnd = formatTime(event.endTime);
        const timeText = [formattedStart, formattedEnd].filter(Boolean).join(' - ');
        const displayText = timeText ? `${event.userName} ${timeText}`.trim() : event.userName;

        return (
            <Pressable
                onPress={() => {
                    onPressScheduleItem(event);
                }}
                key={`${event.id}-${index}`}
                style={[
                    styles.eventBlock,
                    {
                        backgroundColor: event.color,
                        borderLeftColor: event.borderColor,
                    }
                ]}
            >
                <TextFieldLabel style={styles.eventText} numberOfLines={1}>
                    {displayText}
                </TextFieldLabel>
            </Pressable>
        );
    };

    const handleBodyScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        headerScrollRef.current?.scrollTo({ x: offsetX, animated: false });
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            {[t('common.monday'), t('common.tuesday'), t('common.wednesday'), t('common.thursday'), t('common.friday'), t('common.saturday'), t('common.sunday')].map((dayName, index) => (
                <View key={index} style={[
                    styles.headerCell,
                    needsHorizontalScroll ? styles.headerCellScrollable : styles.headerCellFlex
                ]}>
                    <TextFieldLabel style={styles.headerText}>{dayName}</TextFieldLabel>
                </View>
            ))}
        </View>
    );

    const renderBody = () => (
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={needsHorizontalScroll}
        >
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                    {week.map((day, dayIndex) => (
                        <View
                            key={`${day.date.getTime()}-${dayIndex}`}
                            style={[
                                styles.dayCell,
                                needsHorizontalScroll ? styles.dayCellScrollable : styles.dayCellFlex,
                                !day.isCurrentMonth && styles.dayCellOtherMonth,
                                day.isToday && styles.dayCellToday,
                            ]}
                        >
                            <TextFieldLabel
                                style={[
                                    styles.dayNumber,
                                    !day.isCurrentMonth && styles.dayNumberOtherMonth,
                                    day.isToday && styles.dayNumberToday,
                                ]}
                            >
                                {day.dayNumber}
                            </TextFieldLabel>

                            <View style={styles.eventsContainer}>
                                {day.events.slice(0, 3).map((event, eventIndex) =>
                                    renderEvent(event, eventIndex)
                                )}
                                {day.events.length > 3 && (
                                    <TextFieldLabel style={styles.moreEventsText}>
                                        +{day.events.length - 3} {t('common.events')}
                                    </TextFieldLabel>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );

    if (needsHorizontalScroll) {
        return (
            <View style={styles.container}>
                <ScrollView
                    ref={headerScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    style={styles.headerScrollView}
                    contentContainerStyle={styles.headerScrollContent}
                >
                    {renderHeader()}
                </ScrollView>

                <ScrollView
                    ref={bodyScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    onScroll={handleBodyScroll}
                    scrollEventThrottle={16}
                    style={styles.bodyHorizontalScrollView}
                    nestedScrollEnabled={true}
                >
                    {renderBody()}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.headerScrollView, styles.headerRowContainer]}>
                {renderHeader()}
            </View>
            {renderBody()}
        </View>
    );
};

const $styles = (colors: Colors, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerScrollView: {
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
        maxHeight: isTablet ? 80 : 60,
    },
    headerScrollContent: {
        flexDirection: 'row',
    },
    headerRowContainer: {
        backgroundColor: colors.backgroundTable,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundTable,
    },
    headerCell: {
        paddingVertical: isTablet ? 12 : 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderColor: colors.borderTable,
    },
    headerCellScrollable: {
        minWidth: 160,
    },
    headerCellFlex: {
        flex: 1,
    },
    headerText: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: '600',
        color: colors.text,
    },
    bodyHorizontalScrollView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    weekRow: {
        flexDirection: 'row',
        minHeight: 160,
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
    },
    dayCell: {
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        padding: 6,
        minHeight: 160,
        maxWidth: 160,
        height: isTablet ? 160 : 140,
        overflow: 'hidden',
    },
    dayCellScrollable: {
        minWidth: 160,
    },
    dayCellFlex: {
        flex: 1,
    },
    dayCellOtherMonth: {
        backgroundColor: colors.background,
        opacity: 0.5,
    },
    dayCellToday: {
        backgroundColor: colors.yellow + '20',
    },
    dayNumber: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    dayNumberOtherMonth: {
        color: colors.text,
        opacity: 0.5,
    },
    dayNumberToday: {
        color: colors.yellow,
        fontWeight: '700',
    },
    eventsContainer: {
        flex: 1,
        gap: 2,
    },
    eventBlock: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        borderLeftWidth: 3,
        marginBottom: 2,
        minHeight: 20,
        justifyContent: 'center',
    },
    eventText: {
        fontSize: isTablet ? 11 : 10,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    moreEventsText: {
        fontSize: isTablet ? 10 : 9,
        color: colors.text,
        opacity: 0.7,
        fontStyle: 'italic',
        marginTop: 2,
    },
});

export default CalenderMonthComponent;

