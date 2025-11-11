import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { scheduleItemsWeek } from '../../../data/scheduleItems';
import { users } from '../../../data/users';
import { Colors, useAppTheme } from '@/shared/theme';
import { useIsTablet } from '@/shared/lib/useIsTablet';

type Props = {
    selectedDate: Date;
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

const CalenderMonthComponent = ({ selectedDate }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const isTablet = useIsTablet();
    const { width: screenWidth } = useWindowDimensions();
    const styles = $styles(colors, isTablet);
    const headerScrollRef = useRef<ScrollView>(null);
    const bodyScrollRef = useRef<ScrollView>(null);

    const MIN_CELL_WIDTH = 120;
    const NUM_COLUMNS = 7;
    const MIN_TOTAL_WIDTH = MIN_CELL_WIDTH * NUM_COLUMNS; // 840px
    const needsHorizontalScroll = screenWidth < MIN_TOTAL_WIDTH;

    const formatUserName = (fullName: string): string => {
        const parts = fullName.split(' ');
        if (parts.length === 1) return parts[0];

        const initials = parts.slice(0, -1).map(p => p[0]?.toUpperCase() || '').join('.');
        const lastName = parts[parts.length - 1];
        return `${initials}.${lastName}`;
    };

    const formatTime = (time24h: string): string => {
        const hours = time24h.substring(0, 2);
        const minutes = time24h.substring(2, 4);
        return `${hours}:${minutes}`;
    };

    const isSameDay = (date1: Date, date2: Date): boolean => {
        if (!date1 || !date2) return false;
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
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
        while (currentDate <= endDate) {
            const dateCopy = new Date(currentDate);
            dateCopy.setHours(0, 0, 0, 0);

            const dayEvents = scheduleItemsWeek
                .filter(item => item.date && isSameDay(item.date, dateCopy))
                .map(item => {
                    const user = users.find(u => u.id === item.userId);
                    return {
                        id: item.id,
                        userId: item.userId,
                        title: item.title,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        color: item.color,
                        borderColor: item.borderColor,
                        userName: user ? formatUserName(user.name) : '',
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
    }, [selectedDate]);

    const weeks = useMemo(() => {
        const result: CalendarDay[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7));
        }
        return result;
    }, [calendarDays]);

    const renderEvent = (event: CalendarDay['events'][0], index: number) => {
        const timeText = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
        const displayText = `${event.userName} ${timeText}`;

        return (
            <View
                key={`${event.id}-${index}`}
                style={[
                    styles.eventBlock,
                    {
                        backgroundColor: event.color,
                        borderLeftColor: event.borderColor,
                    }
                ]}
            >
                <Text style={styles.eventText} numberOfLines={1}>
                    {displayText}
                </Text>
            </View>
        );
    };

    const handleBodyScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        headerScrollRef.current?.scrollTo({ x: offsetX, animated: false });
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((dayName, index) => (
                <View key={index} style={[
                    styles.headerCell,
                    needsHorizontalScroll ? styles.headerCellScrollable : styles.headerCellFlex
                ]}>
                    <Text style={styles.headerText}>{dayName}</Text>
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
                            <Text
                                style={[
                                    styles.dayNumber,
                                    !day.isCurrentMonth && styles.dayNumberOtherMonth,
                                    day.isToday && styles.dayNumberToday,
                                ]}
                            >
                                {day.dayNumber}
                            </Text>

                            <View style={styles.eventsContainer}>
                                {day.events.slice(0, 3).map((event, eventIndex) =>
                                    renderEvent(event, eventIndex)
                                )}
                                {day.events.length > 3 && (
                                    <Text style={styles.moreEventsText}>
                                        +{day.events.length - 3} sự kiện
                                    </Text>
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
        minWidth: 120,
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
        minHeight: 120,
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
    },
    dayCell: {
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        padding: 6,
        minHeight: 120,
    },
    dayCellScrollable: {
        minWidth: 120,
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

