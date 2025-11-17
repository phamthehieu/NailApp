import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    useWindowDimensions,
} from 'react-native';
import { TextFieldLabel } from '@/shared/ui/Text';
import { useAppTheme } from '@/shared/theme';

type Meridiem = 'AM' | 'PM';

type WheelOption<T> = {
    label: string;
    value: T;
};

export type TimePickerModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    initialDate?: Date;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    showSeconds?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
};

const ITEM_HEIGHT = 36;

const meridiemOptions: WheelOption<Meridiem>[] = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' },
];

const clampStep = (value: number, min: number, max: number) => {
    if (!value || Number.isNaN(value)) { return min; }
    return Math.min(Math.max(value, min), max);
};

const buildHourOptions = (step: number): WheelOption<number>[] => {
    const safeStep = clampStep(step, 1, 12);
    const options: WheelOption<number>[] = [];
    for (let value = 1; value <= 12; value += safeStep) {
        options.push({ label: value.toString().padStart(2, '0'), value });
    }
    if (!options.some((opt) => opt.value === 12)) {
        options.push({ label: '12', value: 12 });
    }
    return options;
};

const buildSteppedOptions = (step: number): WheelOption<number>[] => {
    const safeStep = clampStep(step, 1, 60);
    const options: WheelOption<number>[] = [];
    for (let value = 0; value < 60; value += safeStep) {
        options.push({ label: value.toString().padStart(2, '0'), value });
    }
    if (options.length === 0) {
        options.push({ label: '00', value: 0 });
    }
    return options;
};

const findClosestValue = (value: number, options: WheelOption<number>[]) => {
    if (!options.length) { return value; }
    return options.reduce((closest, option) => {
        const currentDiff = Math.abs(option.value - value);
        const closestDiff = Math.abs(closest - value);
        if (currentDiff < closestDiff) {
            return option.value;
        }
        if (currentDiff === closestDiff && option.value < closest) {
            return option.value;
        }
        return closest;
    }, options[0].value);
};

const getItemLayout = (_: ArrayLike<WheelOption<any>> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
});

const TimePickerModal: React.FC<TimePickerModalProps> = ({
    visible,
    onClose,
    onConfirm,
    initialDate,
    title = 'Set time',
    confirmText = 'Save',
    cancelText = 'Cancel',
    showSeconds = true,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
}) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isSmall = width < 420;
    const styles = useMemo(() => createStyles(colors, isSmall), [colors, isSmall]);

    const hourOptions = useMemo(() => buildHourOptions(hourStep), [hourStep]);
    const minuteOptions = useMemo(() => buildSteppedOptions(minuteStep), [minuteStep]);
    const secondOptions = useMemo(() => buildSteppedOptions(secondStep), [secondStep]);

    const hourListRef = useRef<FlatList<WheelOption<number>> | null>(null);
    const minuteListRef = useRef<FlatList<WheelOption<number>> | null>(null);
    const secondListRef = useRef<FlatList<WheelOption<number>> | null>(null);
    const meridiemListRef = useRef<FlatList<WheelOption<Meridiem>> | null>(null);

    const [selectedHour, setSelectedHour] = useState<number>(12);
    const [selectedMinute, setSelectedMinute] = useState<number>(0);
    const [selectedSecond, setSelectedSecond] = useState<number>(0);
    const [selectedMeridiem, setSelectedMeridiem] = useState<Meridiem>('AM');

    const scrollToIndex = useCallback(<T,>(
        ref: React.RefObject<FlatList<WheelOption<T>> | null>,
        options: WheelOption<T>[],
        targetValue: T,
    ) => {
        const targetIndex = Math.max(0, options.findIndex((opt) => opt.value === targetValue));
        requestAnimationFrame(() => {
            ref.current?.scrollToOffset({
                offset: targetIndex * ITEM_HEIGHT,
                animated: false,
            });
        });
    }, []);

    const hydrateFromDate = useCallback((date: Date) => {
        const hours24 = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const meridiem: Meridiem = hours24 >= 12 ? 'PM' : 'AM';
        let hour12 = hours24 % 12;
        if (hour12 === 0) {
            hour12 = 12;
        }

        const alignedHour = findClosestValue(hour12, hourOptions);
        const alignedMinute = findClosestValue(minutes, minuteOptions);
        const alignedSecond = findClosestValue(seconds, secondOptions);

        setSelectedHour(alignedHour);
        setSelectedMinute(alignedMinute);
        if (showSeconds) {
            setSelectedSecond(alignedSecond);
        } else {
            setSelectedSecond(0);
        }
        setSelectedMeridiem(meridiem);

        scrollToIndex(hourListRef, hourOptions, alignedHour);
        scrollToIndex(minuteListRef, minuteOptions, alignedMinute);
        if (showSeconds) {
            scrollToIndex(secondListRef, secondOptions, alignedSecond);
        }
        scrollToIndex(meridiemListRef, meridiemOptions, meridiem);
    }, [scrollToIndex, showSeconds, hourOptions, minuteOptions, secondOptions]);

    useEffect(() => {
        if (!visible) { return; }
        const dateToUse = initialDate ? new Date(initialDate) : new Date();
        hydrateFromDate(dateToUse);
    }, [visible, initialDate, hydrateFromDate]);

    const handleScrollEnd = useCallback(<T,>(
        e: NativeSyntheticEvent<NativeScrollEvent>,
        options: WheelOption<T>[],
        onValueChange: (val: T) => void,
    ) => {
        const { contentOffset } = e.nativeEvent;
        const rawIndex = Math.round(contentOffset.y / ITEM_HEIGHT);
        const boundedIndex = Math.min(Math.max(rawIndex, 0), options.length - 1);
        const chosen = options[boundedIndex];
        onValueChange(chosen.value);
    }, []);

    const handleConfirm = useCallback(() => {
        const base = initialDate ? new Date(initialDate) : new Date();
        let hours24 = selectedHour % 12;
        if (selectedMeridiem === 'PM' && selectedHour !== 12) {
            hours24 += 12;
        }
        if (selectedMeridiem === 'AM' && selectedHour === 12) {
            hours24 = 0;
        }
        if (selectedMeridiem === 'PM' && selectedHour === 12) {
            hours24 = 12;
        }
        const seconds = showSeconds ? selectedSecond : 0;
        base.setHours(hours24, selectedMinute, seconds, 0);
        onConfirm(base);
    }, [initialDate, onConfirm, selectedHour, selectedMeridiem, selectedMinute, selectedSecond, showSeconds]);

    if (!visible) {
        return null;
    }

    const renderWheel = <T,>(
        data: WheelOption<T>[],
        selectedValue: T,
        onValueChange: (val: T) => void,
        ref: React.RefObject<FlatList<WheelOption<T>> | null>,
    ) => (
        <View style={styles.wheelContainer}>
            <FlatList
                ref={ref}
                data={data}
                keyExtractor={(item) => String(item.value)}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                bounces={false}
                onMomentumScrollEnd={(e) => handleScrollEnd(e, data, onValueChange)}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.wheelContent}
                renderItem={({ item }) => (
                    <View style={styles.wheelItem}>
                        <TextFieldLabel style={[
                            styles.wheelText,
                            item.value === selectedValue && styles.wheelTextActive,
                        ]}
                        >
                            {item.label}
                        </TextFieldLabel>
                    </View>
                )}
            />
            <View style={styles.selectionOverlay} pointerEvents="none" />
        </View>
    );

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <View style={styles.modalContainer}>
                    <TextFieldLabel style={styles.titleText}>{title}</TextFieldLabel>
                    <View style={styles.wheelRow}>
                        {renderWheel(hourOptions, selectedHour, setSelectedHour, hourListRef)}
                        <TextFieldLabel style={styles.separator}>:</TextFieldLabel>
                        {renderWheel(minuteOptions, selectedMinute, setSelectedMinute, minuteListRef)}
                        {showSeconds && (
                            <>
                                <TextFieldLabel style={styles.separator}>:</TextFieldLabel>
                                {renderWheel(secondOptions, selectedSecond, setSelectedSecond, secondListRef)}
                            </>
                        )}
                        {renderWheel(meridiemOptions, selectedMeridiem, setSelectedMeridiem, meridiemListRef)}
                    </View>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <TextFieldLabel style={styles.buttonText}>{cancelText}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleConfirm}>
                            <TextFieldLabel style={[styles.buttonText, styles.saveButtonText]}>{confirmText}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any, isSmall: boolean) => StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: isSmall ? '92%' : 360,
        backgroundColor: '#171E16',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    titleText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 18,
    },
    wheelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelContainer: {
        width: 60,
        height: ITEM_HEIGHT * 3,
        overflow: 'hidden',
    },
    wheelContent: {
        paddingVertical: ITEM_HEIGHT,
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
    },
    wheelTextActive: {
        color: colors.text,
    },
    selectionOverlay: {
        position: 'absolute',
        top: ITEM_HEIGHT,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    separator: {
        color: '#8A8F88',
        fontSize: 24,
        fontWeight: '600',
        marginHorizontal: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    cancelButton: {
        marginRight: 10,
        borderColor: '#3C3F3A',
        backgroundColor: '#1F261E',
    },
    saveButton: {
        marginLeft: 10,
        borderColor: colors.yellow,
        backgroundColor: colors.yellow,
    },
    buttonText: {
        color: colors.text,
        fontWeight: '600',
    },
    saveButtonText: {
        color: colors.card,
    },
});

export default TimePickerModal;

