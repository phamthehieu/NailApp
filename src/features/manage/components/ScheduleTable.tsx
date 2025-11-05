import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import UserAvatar from './UserAvatar';
import CurrentTimeLine from './CurrentTimeLine';
import { users } from '../data/users';
import { timeSlots } from '../data/TimeSlots';
import { getHours, getMinutes } from 'date-fns';
import { scheduleItems } from '../data/scheduleItems';
import { formatTime, isWorkingHours, getScheduleBlocksForHour } from '../api/schedule';
import { Colors, useAppTheme } from '@/shared/theme';
import { useIsTablet } from '@/shared/lib/useIsTablet';

type Props = {
    selectedDate: Date;
};

const ScheduleTable = ({ selectedDate: _selectedDate }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const timeScrollRef = useRef<ScrollView>(null);
    const headerScrollRef = useRef<ScrollView>(null);
    const bodyScrollRef = useRef<ScrollView>(null);
    const [hoursStart, setHoursStart] = useState(8);
    const [minutesStart, setMinutesStart] = useState(15);
    const [hoursEnd, setHoursEnd] = useState(22);
    const [minutesEnd, setMinutesEnd] = useState(30);
    const timeSlotWidth = 200;
    const minVisibleHour = 7;
    const maxVisibleHour = 23;
    const displayTimeSlots = useMemo(() => {
        return timeSlots.filter(slot => {
            const h = parseInt(slot.time.substring(0, 2));
            return h >= minVisibleHour && h <= maxVisibleHour;
        });
    }, []);

    const isTablet = useIsTablet();

    const styles = $styles(colors, timeSlotWidth, isTablet);


    const renderScheduleItem = (userId: string, timeSlot: string) => {
        const blocks = getScheduleBlocksForHour(scheduleItems, userId, timeSlot);

        return blocks.map(({ item, index, heightInPixels }) => {
            const startHours = parseInt(item.startTime.substring(0, 2));
            const startMinutes = parseInt(item.startTime.substring(2, 4));
            const endHours = parseInt(item.endTime.substring(0, 2));
            const endMinutes = parseInt(item.endTime.substring(2, 4));

            const startDecimal = startHours + startMinutes / 60;
            const endDecimal = endHours + endMinutes / 60;
            const duration = endDecimal - startDecimal;
            const widthInPixels = duration * timeSlotWidth;

            // Tính vị trí left dựa trên startTime
            const slotHour = parseInt(timeSlot.substring(0, 2));
            const slotMinutes = parseInt(timeSlot.substring(2, 4));
            const slotDecimal = slotHour + slotMinutes / 60;
            const leftPosition = (startDecimal - slotDecimal) * timeSlotWidth;

            const showTitle = widthInPixels >= 28 && heightInPixels >= 18;
            const showTime = widthInPixels >= 56 && heightInPixels >= 22;

            return (
                <View
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
                        <Text style={[
                            styles.scheduleItemTitle,
                            widthInPixels < 40 && styles.smallScheduleItemTitle
                        ]} numberOfLines={1} ellipsizeMode="tail">
                            {item.title}
                        </Text>
                    )}
                    {showTime && (
                        <Text style={styles.scheduleItemTime} numberOfLines={1} ellipsizeMode="clip">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </Text>
                    )}
                </View>
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

    return (
        <View style={styles.mainContainer}>
            {/* Fixed User Column */}
            <View style={styles.fixedUserColumn}>
                <View style={styles.userColumnHeader}>
                    <Text style={styles.userText}></Text>
                </View>
                <ScrollView
                    ref={timeScrollRef}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    pointerEvents="none"
                >
                    <View style={styles.userColumnContent}>
                        {users.map((user) => (
                            <View key={user.id} style={styles.userColumnRow}>
                                <UserAvatar user={user} />
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
                                    <Text style={styles.timeText}>{slot.label}</Text>
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
                            // Đồng bộ scroll ngang giữa header và body
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
                                <CurrentTimeLine scheduleHeight={users.length * 100} timeSlotWidth={timeSlotWidth} hours={hoursStart} minutes={minutesStart} type={'start'} baseHourOffset={minVisibleHour} />
                                {/* <CurrentTimeLine scheduleHeight={users.length * 100} timeSlotWidth={timeSlotWidth} hours={hoursNow} minutes={minutesNow} type={'now'} /> */}
                                <CurrentTimeLine scheduleHeight={users.length * 100} timeSlotWidth={timeSlotWidth} hours={hoursEnd} minutes={minutesEnd} type={'end'} baseHourOffset={minVisibleHour} />
                                {users.map((user) => (
                                    <View key={user.id} style={styles.userRow}>
                                        {displayTimeSlots.map((slot) => {
                                            const slotHour = parseInt(slot.time.substring(0, 2));
                                            const slotMinutes = parseInt(slot.time.substring(2, 4));
                                            const working = isWorkingHours(slot.time, hoursStart, minutesStart, hoursEnd, minutesEnd);

                                            return (
                                                <View
                                                    key={`${slot.time}-${user.id}`}
                                                    style={[
                                                        styles.scheduleCell,
                                                        !working && styles.nonWorkingHoursCell
                                                    ]}
                                                >
                                                    {renderQuarterHourLines()}
                                                    {renderScheduleItem(user.id, slot.time)}

                                                    {slotHour === hoursStart && slotMinutes === 0 && minutesStart > 0 && (
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
                                                    )}
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

export default ScheduleTable;