import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

type CurrentTimeLineProps = {
    scheduleWidth: number;
    timeSlotHeight: number;
    hours: number;
    minutes: number;
    type: 'start' | 'end' | 'now';
};

const CurrentTimeLine = ({ scheduleWidth, timeSlotHeight, hours, minutes, type }: CurrentTimeLineProps) => {
    const [position, setPosition] = useState(0);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        updatePosition();

        const interval = setInterval(updatePosition, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        updatePosition();
    }, [hours, minutes, timeSlotHeight]);

    const updatePosition = () => {
        const minutesPercentage = minutes / 60;
        const currentPosition = (hours * timeSlotHeight) + (minutesPercentage * timeSlotHeight) - 10;

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
                    top: position,
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
                        width: scheduleWidth - 60,
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
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBox: {
        backgroundColor: 'red',
        width: 60,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    timeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    currentTimeLine: {
        height: 2,
        backgroundColor: 'red',
    },
});

export default CurrentTimeLine;