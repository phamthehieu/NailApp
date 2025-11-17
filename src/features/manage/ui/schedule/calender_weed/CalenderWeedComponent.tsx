import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { timeSlots } from '../../../data/TimeSlots';
import { ScheduleItem } from '../../../data/scheduleItems';
import { isWorkingHours, getScheduleBlocksForHour } from '../../../api/schedule';
import { Colors, useAppTheme } from '@/shared/theme';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import CurrentTimeLine from '../calender_day/CurrentTimeLine';
import { TextFieldLabel } from '@/shared/ui/Text';
import { useSelector } from 'react-redux';
import { RootState, useAppSelector } from '@/app/store';
import { BookingManagerItem } from '../../../api/types';

type Props = {
    selectedDate: Date;
    dateRange?: { start: Date; end: Date } | null;
    onPressScheduleItem: (item: any) => void;
    selectedUserId: number;
    setSelectedUserId: (userId: number) => void;
};

type DayInfo = {
    date: Date;
    label: string;
};

const CalenderWeedComponent = ({ selectedDate, dateRange, onPressScheduleItem, selectedUserId, setSelectedUserId }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const { listStaff } = useSelector((state: RootState) => state.staff);
    const listBookingManagerByRange = useAppSelector((state) => state.booking.listBookingManagerByRange);
    const timeScrollRef = useRef<ScrollView>(null);
    const headerScrollRef = useRef<ScrollView>(null);
    const bodyScrollRef = useRef<ScrollView>(null);

    const timeSlotWidth = 200;
    const minVisibleHour = 0;
    const maxVisibleHour = 23;
    const displayTimeSlots = useMemo(() => {
        return timeSlots.filter(slot => {
            const h = parseInt(slot.time.substring(0, 2));
            return h >= minVisibleHour && h <= maxVisibleHour;
        });
    }, []);

    const isTablet = useIsTablet();

    const styles = $styles(colors, timeSlotWidth, isTablet);


    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const formatDayLabel = (date: Date) => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${dayName}, ${day}/${month}/${year}`;
    };

    const selectedDays = useMemo(() => {
        const days: DayInfo[] = [];

        if (dateRange) {
            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateRange.end);
            end.setHours(0, 0, 0, 0);

            const currentDay = new Date(start);
            while (currentDay <= end) {
                days.push({
                    date: new Date(currentDay),
                    label: formatDayLabel(currentDay)
                });
                currentDay.setDate(currentDay.getDate() + 1);
            }
        } else {
            const startOfCurrentWeek = getStartOfWeek(selectedDate);

            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(startOfCurrentWeek);
                currentDay.setDate(startOfCurrentWeek.getDate() + i);
                currentDay.setHours(0, 0, 0, 0);

                days.push({
                    date: new Date(currentDay),
                    label: formatDayLabel(currentDay)
                });
            }
        }

        return days;
    }, [selectedDate, dateRange]);


    const isSameDay = (date1: Date, date2: Date): boolean => {
        if (!date1 || !date2) return false;
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const renderScheduleItem = (userId: string, timeSlot: string, day: Date) => {
        const itemsForDay = convertedScheduleItems.filter(item =>
            item.date && isSameDay(item.date, day)
        );

        const blocks = getScheduleBlocksForHour(itemsForDay, userId, timeSlot);

        return blocks.map(({ item, index, heightInPixels }) => {
            const startHours = parseInt(item.startTime.substring(0, 2));
            const startMinutes = parseInt(item.startTime.substring(2, 4));
            const endHours = parseInt(item.endTime.substring(0, 2));
            const endMinutes = parseInt(item.endTime.substring(2, 4));

            const startDecimal = startHours + startMinutes / 60;
            const endDecimal = endHours + endMinutes / 60;
            const duration = endDecimal - startDecimal;
            const widthInPixels = duration * timeSlotWidth;

            const slotHour = parseInt(timeSlot.substring(0, 2));
            const slotMinutes = parseInt(timeSlot.substring(2, 4));
            const slotDecimal = slotHour + slotMinutes / 60;
            const leftPosition = (startDecimal - slotDecimal) * timeSlotWidth;

            const showTitle = widthInPixels >= 28 && heightInPixels >= 18;
            const showTime = widthInPixels >= 56 && heightInPixels >= 22;

            return (
                <Pressable
                    onPress={() => {
                        onPressScheduleItem(item);
                    }}
                    key={`${userId}-${item.id}-${index}-${timeSlot}`}
                    style={[
                        styles.scheduleItem,
                        {
                            width: widthInPixels,
                            left: leftPosition,
                            backgroundColor: item.color,
                            borderLeftColor: item.borderColor,
                            marginLeft: index * 5,
                            zIndex: 10 - index,
                        }
                    ]}
                >
                    {showTitle && (
                        <TextFieldLabel style={[
                            styles.scheduleItemTitle,
                            widthInPixels < 40 && styles.smallScheduleItemTitle
                        ]} numberOfLines={1} ellipsizeMode="tail">
                            {item.title}
                        </TextFieldLabel>
                    )}
                    {showTime && (
                        <TextFieldLabel style={styles.scheduleItemTime} numberOfLines={1} ellipsizeMode="clip">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </TextFieldLabel>
                    )}
                </Pressable>
            );
        });
    };

    const formatTime = (time24h: string) => {
        const hours = parseInt(time24h.substring(0, 2));
        const minutes = time24h.substring(2, 4);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes} ${period}`;
    };

    const renderQuarterHourLines = () => {
        return (
            <>
                <View style={[styles.quarterHourLine, { left: '25%' }]} />
                <View style={[styles.quarterHourLine, { left: '50%' }]} />
                <View style={[styles.quarterHourLine, { left: '75%' }]} />
            </>
        );
    };

    const renderItem = (item: any) => {
        return (
            <View style={styles.dropdownItemContainer}>
                <TextFieldLabel allowFontScaling={false} style={styles.dropdownSelectedText}>
                    {item.label}
                </TextFieldLabel>
            </View>
        );
    };

    const convertedScheduleItems = useMemo(() => {
        const items: ScheduleItem[] = [];

        listBookingManagerByRange.forEach((booking: BookingManagerItem) => {
            if (!booking.services || booking.services.length === 0) return;

            const bookingDate = new Date(booking.bookingDate);
            bookingDate.setHours(0, 0, 0, 0);

            const bookingHoursParts = booking.bookingHours.split(':');
            const bookingHour = parseInt(bookingHoursParts[0]);
            const bookingMinute = parseInt(bookingHoursParts[1]);

            const baseDate = new Date(bookingDate);
            baseDate.setHours(bookingHour, bookingMinute, 0, 0);

            let accumulatedMinutes = 0;

            booking.services.forEach((service, serviceIndex) => {
                if (!service.staff || !service.staff.id) return;

                const serviceStartDate = new Date(baseDate.getTime() + accumulatedMinutes * 60 * 1000);
                const serviceStartHour = serviceStartDate.getHours();
                const serviceStartMinute = serviceStartDate.getMinutes();
                const startTimeHHmm = `${String(serviceStartHour).padStart(2, '0')}${String(serviceStartMinute).padStart(2, '0')}`;

                const serviceEndDate = new Date(serviceStartDate.getTime() + service.serviceTime * 60 * 1000);
                const serviceEndHour = serviceEndDate.getHours();
                const serviceEndMinute = serviceEndDate.getMinutes();
                const endTimeHHmm = `${String(serviceEndHour).padStart(2, '0')}${String(serviceEndMinute).padStart(2, '0')}`;

                accumulatedMinutes += service.serviceTime;

                const getColorByStatus = (status: number) => {
                    switch (status) {
                        case 1: // CheckIn
                            return { color: '#E1F5FE', borderColor: '#4FC3F7' };
                        case 2: // Có thể là status khác
                            return { color: '#E8F5E9', borderColor: '#66BB6A' };
                        default:
                            return { color: '#FFF3E0', borderColor: '#FFB74D' };
                    }
                };

                const { color, borderColor } = getColorByStatus(booking.status);

                const itemId = `${booking.id}-${service.id}-${serviceIndex}`;
                items.push({
                    id: itemId,
                    userId: service.staff.id.toString(),
                    startTime: startTimeHHmm,
                    endTime: endTimeHHmm,
                    title: service.serviceName || 'Dịch vụ',
                    color,
                    borderColor,
                    date: new Date(bookingDate),
                });
            });
        });

        return items;
    }, [listBookingManagerByRange]);
    return (
        <View style={styles.mainContainer}>
            <View style={styles.fixedUserColumn}>
                <View style={styles.userColumnHeader}>
                    <Dropdown
                        data={listStaff.map(user => ({
                            label: user.displayName,
                            value: user.id.toString()
                        }))}
                        labelField="label"
                        valueField="value"
                        value={selectedUserId.toString()}
                        onChange={(item) => {
                            setSelectedUserId(parseInt(item.value));
                        }}
                        style={styles.dropdown}
                        containerStyle={styles.dropdownContainer}
                        itemContainerStyle={styles.dropdownItemContainer}
                        selectedTextStyle={styles.dropdownSelectedText}
                        placeholderStyle={styles.dropdownPlaceholder}
                        activeColor={colors.backgroundDisabled}
                        itemTextStyle={{ color: colors.text }}
                        showsVerticalScrollIndicator={false}
                        selectedTextProps={{ allowFontScaling: false }}
                        renderItem={renderItem}
                    />
                </View>
                <ScrollView
                    ref={timeScrollRef}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    pointerEvents="none"
                >
                    <View style={styles.userColumnContent}>
                        {selectedDays.map((day, index) => (
                            <View key={`day-${index}`} style={styles.userColumnRow}>
                                <TextFieldLabel style={styles.weekLabel}>{day.label}</TextFieldLabel>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.scrollableContent}>
                <View style={styles.fixedHeader}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={headerScrollRef}
                        scrollEventThrottle={16}
                        scrollEnabled={false}
                        pointerEvents="none"
                    >
                        <View style={styles.headerRow}>
                            {displayTimeSlots.map((slot) => (
                                <View key={slot.time} style={styles.timeHeaderCell}>
                                    <TextFieldLabel style={styles.timeText}>{slot.label}</TextFieldLabel>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 80 }}
                    scrollEventThrottle={16}
                    onScroll={(event) => {
                        if (timeScrollRef.current) {
                            timeScrollRef.current.scrollTo({
                                y: event.nativeEvent.contentOffset.y,
                                animated: false
                            });
                        }
                    }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        ref={bodyScrollRef}
                        scrollEventThrottle={16}
                        onScroll={(event) => {
                            if (headerScrollRef.current) {
                                headerScrollRef.current.scrollTo({
                                    x: event.nativeEvent.contentOffset.x,
                                    animated: false
                                });
                            }
                        }}
                    >
                        <View style={styles.container}>
                            <View style={styles.userRowsContainer}>
                                {/* <CurrentTimeLine scheduleHeight={selectedDays.length * 100} timeSlotWidth={timeSlotWidth} hours={hoursStart} minutes={minutesStart} type={'start'} baseHourOffset={minVisibleHour} /> */}
                                {/* <CurrentTimeLine scheduleHeight={selectedDays.length * 100} timeSlotWidth={timeSlotWidth} hours={hoursNow} minutes={minutesNow} type={'now'} /> */}
                                {/* <CurrentTimeLine scheduleHeight={selectedDays.length * 100} timeSlotWidth={timeSlotWidth} hours={hoursEnd} minutes={minutesEnd} type={'end'} baseHourOffset={minVisibleHour} /> */}
                                {selectedDays.map((day, dayIndex) => (
                                    <View key={`day-row-${dayIndex}`} style={styles.userRow}>
                                        {displayTimeSlots.map((slot) => {
                                            const slotHour = parseInt(slot.time.substring(0, 2));
                                            const slotMinutes = parseInt(slot.time.substring(2, 4));
                                            // const working = isWorkingHours(slot.time, hoursStart, minutesStart, hoursEnd, minutesEnd);

                                            return (
                                                <View
                                                    key={`${slot.time}-day-${dayIndex}`}
                                                    style={[
                                                        styles.scheduleCell,
                                                        // !working && styles.nonWorkingHoursCell
                                                    ]}
                                                >
                                                    {renderQuarterHourLines()}
                                                    {renderScheduleItem(selectedUserId.toString(), slot.time, day.date)}

                                                    {/* {slotHour === hoursStart && slotMinutes === 0 && minutesStart > 0 && (
                                                        <View style={[
                                                            styles.partialOverlay,
                                                            {
                                                                width: (minutesStart / 60) * timeSlotWidth,
                                                                backgroundColor: colors.bottomColor,
                                                                opacity: 0.8
                                                            }
                                                        ]} />
                                                    )}

                                                    {slotHour === hoursEnd && slotMinutes === 0 && minutesEnd < 60 && (
                                                        <View style={[
                                                            styles.partialOverlay,
                                                            {
                                                                left: (minutesEnd / 60) * timeSlotWidth,
                                                                width: ((60 - minutesEnd) / 60) * timeSlotWidth,
                                                                backgroundColor: colors.bottomColor,
                                                                opacity: 0.8
                                                            }
                                                        ]} />
                                                    )} */}
                                                </View>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>
        </View>
    );
};

const $styles = (colors: Colors, timeSlotWidth: number, isTablet: boolean) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fixedUserColumn: {
        width: isTablet ? 180 : 120,
        backgroundColor: colors.background,
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        zIndex: 1000,
    },
    userColumnHeader: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        paddingHorizontal: 8,
    },
    dropdown: {
        width: '100%',
        height: 40,
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.borderTable,
        color: colors.text,
    },
    dropdownContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.background,
        marginTop: 4,
        color: colors.text,
    },
    dropdownItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: colors.text,
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: colors.text,
    },
    userColumnContent: {
        position: 'relative',
    },
    userColumnRow: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
    },
    scrollableContent: {
        flex: 1,
        position: 'relative',
    },
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: colors.backgroundTable,
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
    },
    container: {
        borderLeftWidth: 1,
        borderTopWidth: 1,
        borderColor: colors.borderTable,
    },
    headerRow: {
        flexDirection: 'row',
        height: 80,
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        zIndex: 100,
    },
    timeHeaderCell: {
        width: timeSlotWidth,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
    },
    userRowsContainer: {
        position: 'relative',
    },
    userRow: {
        flexDirection: 'row',
        height: 100,
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
    },
    timeText: {
        fontSize: 16,
        color: colors.text,
    },
    userText: {
        fontSize: 16,
        color: colors.text,
    },
    weekLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        textAlign: 'center',
    },
    scheduleCell: {
        width: timeSlotWidth,
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        position: 'relative',
    },
    nonWorkingHoursCell: {
        backgroundColor: colors.backgroundDisabled,
        opacity: 0.8
    },
    partialOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 10
    },
    quarterHourLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        borderRightWidth: 1,
        borderRightColor: colors.borderTable,
        borderStyle: 'dashed',
        opacity: 0.5
    },
    scheduleItem: {
        margin: 2,
        padding: 4,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#4FC3F7',
        backgroundColor: '#E1F5FE',
        overflow: 'hidden',
        zIndex: 10,
        position: 'absolute',
        top: 0,
        bottom: 0,
    },
    scheduleItemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333'
    },
    scheduleItemTime: {
        fontSize: 11,
        color: colors.black,
        marginTop: 4
    },
    smallScheduleItemTitle: {
        fontSize: 10,
        lineHeight: 11,
        marginTop: 1,
        paddingVertical: 1
    }
});

export default CalenderWeedComponent;