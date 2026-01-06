import React, { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import UserAvatar from './UserAvatar';
import { timeSlots } from '../../../data/TimeSlots';
import { ScheduleItem } from '../../../data/scheduleItems';
import { isWorkingHours, getScheduleBlocksForHour } from '../../../api/schedule';
import { BookingManagerItem } from '../../../api/types';
import { Colors, useAppTheme } from '@/shared/theme';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { TextFieldLabel } from '@/shared/ui/Text';
import { useSelector } from 'react-redux';
import { RootState, useAppSelector } from '@/app/store';
import { useStaffForm } from '@/features/manage/hooks/useStaffForm';

type Props = {
    selectedDate: Date;
    onPressScheduleItem: (item: any) => void;
};

const CalenderDayComponent = ({ selectedDate: _selectedDate, onPressScheduleItem }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const { getListStaff } = useStaffForm();
    const listBookingManagerByDate = useAppSelector((state) => state.booking.listBookingManagerByDate);
    const timeScrollRef = useRef<ScrollView>(null);
    const headerScrollRef = useRef<ScrollView>(null);
    const bodyScrollRef = useRef<ScrollView>(null);
    const verticalScrollRef = useRef<ScrollView>(null);
    const { listStaff, listBookingHourSetting } = useSelector((state: RootState) => state.staff);
    const staffColumnWidth = 200;
    const timeSlotHeight = 80;
    const [hideStaffWithoutWorkingHours, setHideStaffWithoutWorkingHours] = useState(false);

    const getDayOfWeek = (date: Date): string => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const getWorkingHoursForStaff = useCallback((staffId: number, dayOfWeek: string) => {
        const bookingHour = listBookingHourSetting.find(
            item => item.staffId === staffId &&
                item.dayOfTheWeek === dayOfWeek &&
                item.active === true
        );

        if (!bookingHour) {
            return null;
        }

        const startTime = bookingHour.startTime;
        const endTime = bookingHour.endTime;

        const startHour = parseInt(startTime.substring(0, 2));
        const startMinute = parseInt(startTime.substring(3, 5));
        const endHour = parseInt(endTime.substring(0, 2));
        const endMinute = parseInt(endTime.substring(3, 5));

        return { startHour, startMinute, endHour, endMinute };
    }, [listBookingHourSetting]);

    const dayOfWeek = getDayOfWeek(_selectedDate);

    const filteredListStaff = useMemo(() => {
        if (!hideStaffWithoutWorkingHours) {
            return listStaff;
        }
        return listStaff.filter(staff => {
            const workingHours = getWorkingHoursForStaff(staff.id, dayOfWeek);
            return workingHours !== null;
        });
    }, [listStaff, hideStaffWithoutWorkingHours, dayOfWeek, getWorkingHoursForStaff]);

    const selectedDayWorkingRange = useMemo(() => {
        const activeEntries = listBookingHourSetting.filter(
            (item) => item.dayOfTheWeek === dayOfWeek && item.active
        );

        if (activeEntries.length === 0) {
            return null;
        }

        const parseTimeToMinutes = (time?: string) => {
            if (!time) return null;
            const [hourString, minuteString] = time.split(':');
            const hour = parseInt(hourString ?? '0', 10);
            const minute = parseInt(minuteString ?? '0', 10);
            if (Number.isNaN(hour) || Number.isNaN(minute)) {
                return null;
            }
            return hour * 60 + minute;
        };

        let minMinutes: number | null = null;
        let maxMinutes: number | null = null;

        activeEntries.forEach((entry) => {
            const startMinutes = parseTimeToMinutes(entry.startTime);
            const endMinutes = parseTimeToMinutes(entry.endTime);

            if (startMinutes !== null) {
                minMinutes = minMinutes === null ? startMinutes : Math.min(minMinutes, startMinutes);
            }

            if (endMinutes !== null) {
                maxMinutes = maxMinutes === null ? endMinutes : Math.max(maxMinutes, endMinutes);
            }
        });

        if (minMinutes === null || maxMinutes === null) {
            return null;
        }

        return {
            startHour: Math.floor(minMinutes / 60),
            startMinute: minMinutes % 60,
            endHour: Math.floor(maxMinutes / 60),
            endMinute: maxMinutes % 60
        };
    }, [listBookingHourSetting, dayOfWeek]);

    const displayTimeSlots = useMemo(() => {
        // Luôn hiển thị tất cả 24 giờ từ 0h đến 23h
        return timeSlots;
    }, []);

    const isTablet = useIsTablet();

    const styles = $styles(colors, staffColumnWidth, timeSlotHeight, isTablet);

    const totalTimeHeight = displayTimeSlots.length * timeSlotHeight;
    const hasDayWorkingHours = Boolean(selectedDayWorkingRange);
    const dayHoursStart = selectedDayWorkingRange?.startHour ?? 0;
    const dayMinutesStart = selectedDayWorkingRange?.startMinute ?? 0;
    const dayHoursEnd = selectedDayWorkingRange?.endHour ?? 0;
    const dayMinutesEnd = selectedDayWorkingRange?.endMinute ?? 0;

    const { convertedScheduleItems, bookingDataMap } = useMemo(() => {
        const items: ScheduleItem[] = [];
        const bookingMap = new Map<string, BookingManagerItem>();

        listBookingManagerByDate.forEach((booking: BookingManagerItem) => {
            if (!booking.services || booking.services.length === 0) return;

            const bookingHoursParts = booking.bookingHours.split(':');
            const bookingHour = parseInt(bookingHoursParts[0]);
            const bookingMinute = parseInt(bookingHoursParts[1]);

            const baseDate = new Date();
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
                        case 0:
                            return { color: colors.blue, borderColor: colors.blue };
                        case 1:
                            return { color: colors.yellow, borderColor: colors.yellow };
                        case 2:
                            return { color: colors.purple, borderColor: colors.purple };
                        case 3:
                            return { color: colors.red, borderColor: colors.red };
                        case 4:
                            return { color: colors.green, borderColor: colors.green };
                        default:
                            return { color: colors.blue, borderColor: colors.blue };
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
                });

                bookingMap.set(itemId, booking);
            });
        });

        return { convertedScheduleItems: items, bookingDataMap: bookingMap };
    }, [listBookingManagerByDate]);

    const renderScheduleItem = (userId: string, timeSlot: string) => {
        const blocks = getScheduleBlocksForHour(convertedScheduleItems, userId, timeSlot);
        return blocks.map(({ item, index, heightInPixels }) => {
            const startHours = parseInt(item.startTime.substring(0, 2));
            const startMinutes = parseInt(item.startTime.substring(2, 4));
            const endHours = parseInt(item.endTime.substring(0, 2));
            const endMinutes = parseInt(item.endTime.substring(2, 4));

            const startDecimal = startHours + startMinutes / 60;
            const endDecimal = endHours + endMinutes / 60;
            const duration = endDecimal - startDecimal;
            const heightInPixelsAdjusted = Math.max(duration * timeSlotHeight, 25);

            const slotHour = parseInt(timeSlot.substring(0, 2));
            const slotMinutes = parseInt(timeSlot.substring(2, 4));
            const slotDecimal = slotHour + slotMinutes / 60;
            const topPosition = (startDecimal - slotDecimal) * timeSlotHeight;

            const showTitle = heightInPixelsAdjusted >= 10;
            const showTime = heightInPixelsAdjusted >= 40;

            const originalBooking = bookingDataMap.get(item.id);

            return (
                <Pressable
                    onPress={() => {
                        onPressScheduleItem(originalBooking || item);
                    }}
                    key={`${item.id}-${index}`}
                    style={[
                        styles.scheduleItem,
                        {
                            height: heightInPixelsAdjusted,
                            top: topPosition,
                            width: staffColumnWidth - 6 - index * 6,
                            left: index * 6,
                            backgroundColor: item.color,
                            borderLeftColor: item.borderColor,
                            zIndex: 10 - index,
                        }
                    ]}
                >
                    {showTitle && (
                        <TextFieldLabel style={[
                            styles.scheduleItemTitle,
                            heightInPixelsAdjusted < 40 && styles.smallScheduleItemTitle
                        ]} numberOfLines={1} ellipsizeMode="tail">
                            {item.title} -/- {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </TextFieldLabel>
                    )}
                    {/* {showTime && (
                        <TextFieldLabel style={styles.scheduleItemTime} numberOfLines={1} ellipsizeMode="clip">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </TextFieldLabel>
                    )} */}
                </Pressable>
            );
        });
    };

    const formatTime = (time24h: string): string => {
        const hours = parseInt(time24h.substring(0, 2));
        const minutes = time24h.substring(2, 4);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes} ${period}`;
    };

    const renderQuarterHourLines = () => {
        return (
            <>
                <View style={[styles.quarterHourLine, { top: '25%' }]} />
                <View style={[styles.quarterHourLine, { top: '50%' }]} />
                <View style={[styles.quarterHourLine, { top: '75%' }]} />
            </>
        );
    };

    useEffect(() => {
        getListStaff();
    }, []);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.fixedTimeColumn}>
                <Pressable onPress={() => setHideStaffWithoutWorkingHours(!hideStaffWithoutWorkingHours)} style={styles.timeColumnHeader}>
                    <View style={styles.filterContainer} />
                </Pressable>

                <ScrollView
                    ref={timeScrollRef}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    pointerEvents="none"
                >
                    <View style={styles.timeColumnContent}>
                        {displayTimeSlots.map((slot) => (
                            <View key={slot.time} style={[styles.timeColumnRow, { height: timeSlotHeight }]}>
                                <TextFieldLabel style={styles.timeText}>{slot.label}</TextFieldLabel>
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
                            {filteredListStaff.map((staff) => (
                                <View key={staff.id} style={[styles.staffHeaderCell, { width: staffColumnWidth }]}>
                                    <UserAvatar listStaff={staff} />
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <ScrollView
                    ref={verticalScrollRef}
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
                            <View style={styles.staffColumnsContainer}>
                                {filteredListStaff.map((staff) => {
                                    const staffWorkingHours = getWorkingHoursForStaff(staff.id, dayOfWeek);
                                    const hasWorkingHours = staffWorkingHours !== null;
                                    const staffHoursStart = staffWorkingHours?.startHour ?? 0;
                                    const staffMinutesStart = staffWorkingHours?.startMinute ?? 0;
                                    const staffHoursEnd = staffWorkingHours?.endHour ?? 0;
                                    const staffMinutesEnd = staffWorkingHours?.endMinute ?? 0;

                                    return (
                                        <View key={staff.id} style={[styles.staffColumn, { width: staffColumnWidth }]}>
                                            <View style={[styles.staffColumnContent, { height: totalTimeHeight }]}>
                                                {displayTimeSlots.map((slot) => {
                                                    const slotHour = parseInt(slot.time.substring(0, 2));
                                                    const slotMinutes = parseInt(slot.time.substring(2, 4));

                                                    const working = hasDayWorkingHours
                                                        ? isWorkingHours(slot.time, dayHoursStart, dayMinutesStart, dayHoursEnd, dayMinutesEnd)
                                                        : false;

                                                    return (
                                                        <View
                                                            key={`${slot.time}-${staff.id}`}
                                                            style={[
                                                                styles.scheduleCell,
                                                                { height: timeSlotHeight },
                                                                // !working && styles.nonWorkingHoursCell
                                                            ]}
                                                        >
                                                            {renderQuarterHourLines()}
                                                            {renderScheduleItem(staff.id.toString(), slot.time)}

                                                            {/* {hasWorkingHours && slotHour === staffHoursStart && slotMinutes === 0 && staffMinutesStart > 0 && (
                                                                <View style={[
                                                                    styles.partialOverlay,
                                                                    {
                                                                        height: (staffMinutesStart / 60) * timeSlotHeight,
                                                                        backgroundColor: colors.bacgroundCalendar,
                                                                        opacity: 0.8
                                                                    }
                                                                ]} />
                                                            )}

                                                            {hasWorkingHours && slotHour === staffHoursEnd && slotMinutes === 0 && staffMinutesEnd < 60 && (
                                                                <View style={[
                                                                    styles.partialOverlay,
                                                                    {
                                                                        top: (staffMinutesEnd / 60) * timeSlotHeight,
                                                                        height: ((60 - staffMinutesEnd) / 60) * timeSlotHeight,
                                                                        backgroundColor: colors.bacgroundCalendar,
                                                                        opacity: 0.8
                                                                    }
                                                                ]} />
                                                            )} */}
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>
        </View>
    );
};

const $styles = (colors: Colors, staffColumnWidth: number, timeSlotHeight: number, isTablet: boolean) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fixedTimeColumn: {
        width: isTablet ? 120 : 90,
        backgroundColor: colors.background,
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        zIndex: 1000,
    },
    timeColumnHeader: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        paddingHorizontal: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeColumnContent: {
        position: 'relative',
    },
    timeColumnRow: {
        height: timeSlotHeight,
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
        borderTopWidth: 1,
        borderLeftWidth: 1,
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
    staffHeaderCell: {
        width: staffColumnWidth,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
    },
    staffColumnsContainer: {
        flexDirection: 'row',
    },
    staffColumn: {
        borderRightWidth: 1,
        borderColor: colors.borderTable,
    },
    staffColumnContent: {
        position: 'relative',
        borderLeftWidth: 1,
        borderColor: colors.borderTable,
        overflow: 'visible',
    },
    timeText: {
        fontSize: 16,
        color: colors.text,
    },
    scheduleCell: {
        width: staffColumnWidth,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
        position: 'relative',
        overflow: 'visible',
    },
    nonWorkingHoursCell: {
        backgroundColor: colors.bacgroundCalendar,
        opacity: 0.8
    },
    partialOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10
    },
    quarterHourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderTable,
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

export default CalenderDayComponent;

