import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import UserAvatar from './UserAvatar';
import CurrentTimeLine from './CurrentTimeLine';
import { users } from '../data/users';
import { timeSlots } from '../data/TimeSlots';
import { getHours, getMinutes } from 'date-fns';
import { scheduleItems } from '../data/scheduleItems';
import { formatTime, isWorkingHours, getScheduleBlocksForHour } from '../api/schedule';
import { Colors, useAppTheme } from '@/shared/theme';

type Props = {
    selectedDate: Date;
};

const ScheduleTable = ({ selectedDate: _selectedDate }: Props) => {
    const { theme: { colors } } = useAppTheme();
    const timeScrollRef = useRef<ScrollView>(null);
    const contentScrollRef = useRef<ScrollView>(null);
    const [tableWidth, setTableWidth] = useState(0);
    const [hoursStart, setHoursStart] = useState(8);
    const [minutesStart, setMinutesStart] = useState(15);
    const [hoursEnd, setHoursEnd] = useState(22);
    const [minutesEnd, setMinutesEnd] = useState(30);
    const scheduleContentWidth = users.length * 180;

    const styles = $styles(colors);


    const renderScheduleItem = (userId: string, timeSlot: string) => {
        const blocks = getScheduleBlocksForHour(scheduleItems, userId, timeSlot);

        return blocks.map(({ item, index, heightInPixels }) => (
            <View
                key={`${item.id}-${index}`}
                style={[
                    styles.scheduleItem,
                    {
                        height: heightInPixels,
                        backgroundColor: item.color,
                        borderLeftColor: item.borderColor,
                        marginTop: index * 5,
                        zIndex: 10 - index,
                    }
                ]}
            >
                <Text style={[
                    styles.scheduleItemTitle,
                    heightInPixels < 40 && styles.smallScheduleItemTitle
                ]}>
                    {item.title}
                </Text>
                {heightInPixels >= 40 && (
                    <Text style={styles.scheduleItemTime}>
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Text>
                )}
            </View>
        ));
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
                <View style={[styles.quarterHourLine, { top: '25%' }]} />
                <View style={[styles.quarterHourLine, { top: '50%' }]} />
                <View style={[styles.quarterHourLine, { top: '75%' }]} />
            </>
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Fixed Time Column */}
            <View style={styles.fixedTimeColumn}>
                <View style={styles.timeColumnHeader}>
                    <Text style={styles.timeText}></Text>
                </View>
                <ScrollView
                    ref={timeScrollRef}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    pointerEvents="none"
                >
                    <View style={styles.timeColumnContent}>
                        {timeSlots.map((slot) => (
                            <View key={slot.time} style={styles.timeColumnRow}>
                                <Text style={styles.timeText}>{slot.label}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.scrollableContent}>
                    <View style={styles.fixedHeader}>
                        <View style={styles.headerRow}>
                            {users.map((user) => (
                                <View key={user.id} style={styles.userCell}>
                                    <UserAvatar user={user} />
                                </View>
                            ))}
                        </View>
                    </View>

                    <ScrollView
                        ref={contentScrollRef}
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
                        <View
                            style={styles.container}
                            onLayout={(event) => {
                                setTableWidth(event.nativeEvent.layout.width);
                            }}
                        >
                            <View style={styles.timeRowsContainer}>
                                <CurrentTimeLine scheduleWidth={scheduleContentWidth} timeSlotHeight={100} hours={hoursStart} minutes={minutesStart} type={'start'} />
                                {/* <CurrentTimeLine scheduleWidth={scheduleContentWidth} timeSlotHeight={100} hours={hoursNow} minutes={minutesNow} type={'now'} /> */}
                                <CurrentTimeLine scheduleWidth={scheduleContentWidth} timeSlotHeight={100} hours={hoursEnd} minutes={minutesEnd} type={'end'} />
                                {timeSlots.map((slot) => (
                                    <View key={slot.time} style={styles.timeRow}>
                                        {users.map((user) => {
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
                                                                height: (minutesStart / 60) * 100,
                                                                backgroundColor: colors.bottomColor,
                                                                opacity: 0.8
                                                            }
                                                        ]} />
                                                    )}

                                                    {slotHour === hoursEnd && slotMinutes === 0 && minutesEnd < 60 && (
                                                        <View style={[
                                                            styles.partialOverlay,
                                                            {
                                                                top: (minutesEnd / 60) * 100,
                                                                height: ((60 - minutesEnd) / 60) * 100,
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
                </View>
            </ScrollView>
        </View>
    );
};

const $styles = (colors: Colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fixedTimeColumn: {
        width: 70,
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
    },
    timeColumnContent: {
        position: 'relative',
    },
    timeColumnRow: {
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
    timeRowsContainer: {
        position: 'relative',
    },
    timeRow: {
        flexDirection: 'row',
        height: 100,
        borderBottomWidth: 1,
        borderColor: colors.borderTable,
    },
    timeCell: {
        width: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
    },
    timeText: {
        fontSize: 16,
        color: colors.text,
    },
    userCell: {
        width: 180,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: colors.borderTable,
        backgroundColor: colors.backgroundTable,
    },
    scheduleCell: {
        width: 180,
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
        zIndex: 10
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