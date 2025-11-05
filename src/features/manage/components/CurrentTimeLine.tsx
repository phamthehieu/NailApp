import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

type CurrentTimeLineProps = {
    scheduleHeight: number;
    timeSlotWidth: number;
    hours: number;
    minutes: number;
    type: 'start' | 'end' | 'now';
    baseHourOffset?: number;
};

const CurrentTimeLine = ({ scheduleHeight, timeSlotWidth, hours, minutes, type, baseHourOffset = 0 }: CurrentTimeLineProps) => {
    const [position, setPosition] = useState(0);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        updatePosition();

        const interval = setInterval(updatePosition, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        updatePosition();
    }, [hours, minutes, timeSlotWidth, baseHourOffset]);

    const updatePosition = () => {
        const minutesPercentage = minutes / 60;
        const adjustedHours = hours - baseHourOffset;
        const currentPosition = (adjustedHours * timeSlotWidth) + (minutesPercentage * timeSlotWidth);

        setPosition(currentPosition);

        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const period = hours >= 12 ? 'PM' : 'AM';
        setCurrentTime(`${formattedHours}:${formattedMinutes} ${period}`);
    };

    return (
        <View
            style={[
                styles.currentTimeContainer,
                {
                    left: position,
                }
            ]}
        >
            <View style={[styles.timeBox, { backgroundColor: type === 'start' ? 'green' : type === 'end' ? 'red' : 'blue' }]}>
                <Text style={styles.timeText}>{currentTime}</Text>
            </View>
            <View
                style={[
                    styles.currentTimeLine,
                    {
                        height: scheduleHeight,
                        backgroundColor: type === 'start' ? 'green' : type === 'end' ? 'red' : 'blue',
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    currentTimeContainer: {
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    timeBox: {
        backgroundColor: 'red',
        marginLeft: -30,
        width: 60,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 2,
    },
    timeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    currentTimeLine: {
        width: 2,
        backgroundColor: 'red',
    },
});

export default CurrentTimeLine;