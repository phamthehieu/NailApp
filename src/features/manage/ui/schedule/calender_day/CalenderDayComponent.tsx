import React, { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import UserAvatar from './UserAvatar';
import CurrentTimeLine from './CurrentTimeLine';
import { users } from '../../../data/users';
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
import { useTranslation } from 'react-i18next';

type Props = {
    selectedDate: Date;
    onPressScheduleItem: (item: any) => void;
};

const CalenderDayComponent = ({ selectedDate: _selectedDate, onPressScheduleItem }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const { getListStaff, getListBookingHour } = useStaffForm();
    const { t } = useTranslation();
    const listBookingManagerByDate = useAppSelector((state) => state.booking.listBookingManagerByDate);
    const timeScrollRef = useRef<ScrollView>(null);
    const headerScrollRef = useRef<ScrollView>(null);
    const bodyScrollRef = useRef<ScrollView>(null);
    const verticalScrollRef = useRef<ScrollView>(null);
    const { listStaff, listBookingHour } = useSelector((state: RootState) => state.staff);
    const timeSlotWidth = 200;
    const [hideStaffWithoutWorkingHours, setHideStaffWithoutWorkingHours] = useState(false);

    const getDayOfWeek = (date: Date): string => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const getWorkingHoursForStaff = useCallback((staffId: number, dayOfWeek: string) => {
        const bookingHour = listBookingHour.find(
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
    }, [listBookingHour]);

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

    const { minVisibleHour, maxVisibleHour } = useMemo(() => {
        if (filteredListStaff.length === 0 || listBookingHour.length === 0) {
            return { minVisibleHour: 0, maxVisibleHour: 23 };
        }

        let minHour = 24;
        let maxHour = 0;
        let hasAnyWorkingHours = false;

        filteredListStaff.forEach(staff => {
            const workingHours = getWorkingHoursForStaff(staff.id, dayOfWeek);
            if (workingHours) {
                hasAnyWorkingHours = true;
                const startHour = workingHours.startHour;
                const endHour = workingHours.endHour;

                if (startHour < minHour) minHour = startHour;
                if (endHour > maxHour) maxHour = endHour;
            }
        });

        if (!hasAnyWorkingHours) {
            return { minVisibleHour: 0, maxVisibleHour: 23 };
        }

        const paddingHour = 1;
        const finalMinHour = Math.max(0, minHour - paddingHour);
        const finalMaxHour = Math.min(23, maxHour + paddingHour);

        return { minVisibleHour: finalMinHour, maxVisibleHour: finalMaxHour };
    }, [filteredListStaff, listBookingHour, dayOfWeek, getWorkingHoursForStaff]);

    const displayTimeSlots = useMemo(() => {
        return timeSlots.filter(slot => {
            const h = parseInt(slot.time.substring(0, 2));
            return h >= minVisibleHour && h <= maxVisibleHour;
        });
    }, [minVisibleHour, maxVisibleHour]);

    const isTablet = useIsTablet();

    const styles = $styles(colors, timeSlotWidth, isTablet);

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
            const widthInPixels = duration * timeSlotWidth;

            const slotHour = parseInt(timeSlot.substring(0, 2));
            const slotMinutes = parseInt(timeSlot.substring(2, 4));
            const slotDecimal = slotHour + slotMinutes / 60;
            const leftPosition = (startDecimal - slotDecimal) * timeSlotWidth;

            const showTitle = widthInPixels >= 28 && heightInPixels >= 18;
            const showTime = widthInPixels >= 56 && heightInPixels >= 22;

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
                <View style={[styles.quarterHourLine, { left: '25%' }]} />
                <View style={[styles.quarterHourLine, { left: '50%' }]} />
                <View style={[styles.quarterHourLine, { left: '75%' }]} />
            </>
        );
    };

    useEffect(() => {
        getListStaff();
        // getListBookingHour();
    }, []);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.fixedUserColumn}>

                <Pressable onPress={() => setHideStaffWithoutWorkingHours(!hideStaffWithoutWorkingHours)} style={styles.userColumnHeader}>

                    <View style={styles.filterContainer}>

                        <Switch
                            value={hideStaffWithoutWorkingHours}
                            onValueChange={setHideStaffWithoutWorkingHours}
                            trackColor={{ false: colors.backgroundDisabled, true: colors.yellow + '80' }}
                            thumbColor={hideStaffWithoutWorkingHours ? colors.yellow : colors.primary}
                            ios_backgroundColor={colors.backgroundDisabled}
                        />

                        {isTablet ? <TextFieldLabel style={styles.filterLabel} numberOfLines={1} ellipsizeMode="tail">{t('calenderDashboard.calenderHeader.hideStaffWithoutWorkingHours')}</TextFieldLabel> : null}

                    </View>

                </Pressable>

                <ScrollView
                    ref={timeScrollRef}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    pointerEvents="none"
                >

                    <View style={styles.userColumnContent}>

                        {filteredListStaff.map((staff) => (

                            <View key={staff.id} style={styles.userColumnRow}>

                                <UserAvatar listStaff={staff} />

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
                            <View style={styles.userRowsContainer}>
                                {filteredListStaff.map((staff, index) => {
                                    const staffWorkingHours = getWorkingHoursForStaff(staff.id, dayOfWeek);
                                    const hasWorkingHours = staffWorkingHours !== null;
                                    const staffHoursStart = staffWorkingHours?.startHour ?? 0;
                                    const staffMinutesStart = staffWorkingHours?.startMinute ?? 0;
                                    const staffHoursEnd = staffWorkingHours?.endHour ?? 0;
                                    const staffMinutesEnd = staffWorkingHours?.endMinute ?? 0;

                                    const staffTopPosition = index * 100;

                                    return (
                                        <React.Fragment key={staff.id}>
                                            {hasWorkingHours && (
                                                <>
                                                    <View style={[styles.timeLineWrapper, { top: staffTopPosition }]}>
                                                        <CurrentTimeLine
                                                            scheduleHeight={80}
                                                            timeSlotWidth={timeSlotWidth}
                                                            hours={staffHoursStart}
                                                            minutes={staffMinutesStart}
                                                            type={'start'}
                                                            baseHourOffset={minVisibleHour}
                                                        />
                                                    </View>
                                                    <View style={[styles.timeLineWrapper, { top: staffTopPosition }]}>
                                                        <CurrentTimeLine
                                                            scheduleHeight={80}
                                                            timeSlotWidth={timeSlotWidth}
                                                            hours={staffHoursEnd}
                                                            minutes={staffMinutesEnd}
                                                            type={'end'}
                                                            baseHourOffset={minVisibleHour}
                                                        />
                                                    </View>
                                                </>
                                            )}
                                            <View style={styles.userRow}>
                                                {displayTimeSlots.map((slot) => {
                                                    const slotHour = parseInt(slot.time.substring(0, 2));
                                                    const slotMinutes = parseInt(slot.time.substring(2, 4));

                                                    // const working = hasWorkingHours
                                                    //     ? isWorkingHours(slot.time, staffHoursStart, staffMinutesStart, staffHoursEnd, staffMinutesEnd)
                                                    //     : false;

                                                    return (
                                                        <View
                                                            key={`${slot.time}-${staff.id}`}
                                                            style={[
                                                                styles.scheduleCell,
                                                                // !working && styles.nonWorkingHoursCell
                                                            ]}
                                                        >
                                                            {renderQuarterHourLines()}
                                                            {renderScheduleItem(staff.id.toString(), slot.time)}

                                                            {hasWorkingHours && slotHour === staffHoursStart && slotMinutes === 0 && staffMinutesStart > 0 && (
                                                                <View style={[
                                                                    styles.partialOverlay,
                                                                    {
                                                                        width: (staffMinutesStart / 60) * timeSlotWidth,
                                                                        backgroundColor: colors.bottomColor,
                                                                        opacity: 0.8
                                                                    }
                                                                ]} />
                                                            )}

                                                            {hasWorkingHours && slotHour === staffHoursEnd && slotMinutes === 0 && staffMinutesEnd < 60 && (
                                                                <View style={[
                                                                    styles.partialOverlay,
                                                                    {
                                                                        left: (staffMinutesEnd / 60) * timeSlotWidth,
                                                                        width: ((60 - staffMinutesEnd) / 60) * timeSlotWidth,
                                                                        backgroundColor: colors.bottomColor,
                                                                        opacity: 0.8
                                                                    }
                                                                ]} />
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </React.Fragment>
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

const $styles = (colors: Colors, timeSlotWidth: number, isTablet: boolean) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fixedUserColumn: {
        width: isTablet ? 180 : 80,
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
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterLabel: {
        fontSize: 12,
        color: colors.text,
        marginLeft: 8,
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
    timeLineWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 500,
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

export default CalenderDayComponent;