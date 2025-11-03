import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from "lucide-react-native";
import { useAppTheme } from '../theme';

interface IProps {
    label?: string;
    onBack?: () => void;
    showConfig?: boolean;
    viewType?: 'grid' | 'list';
    changeViewType?: () => void;
    iconRight?: React.ReactNode;
    onPressIconRight?: () => void;
    isFilter?: boolean;
    showiconLeft?: boolean;
    showIconRight?: boolean;
    bgColor?: string;
    widthIconRight?: number;
}

export default function MHeader({
    label,
    onBack,
    iconRight,
    onPressIconRight,
    showiconLeft,
    showIconRight,
    bgColor,
    widthIconRight = 40,
}: IProps) {
    ;
    const { theme: { colors }} = useAppTheme();

    return (
            <View style={[styles.header, {backgroundColor: bgColor}]}>
                {showiconLeft &&
                    <TouchableOpacity style={styles.iconLeft} onPress={onBack}>
                        <ArrowLeft size={24} color={colors.background} />
                    </TouchableOpacity>
                }
                <Text style={[styles.label, { color: colors.background }]}>{label}</Text>
                {showIconRight && (
                    <TouchableOpacity style={[styles.iconRight, { width: widthIconRight }]} onPress={onPressIconRight}>
                        {iconRight}
                    </TouchableOpacity>
                )}
            </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 60,
    },
    iconLeft: {
        width: 40,
        height: 40,
        position: 'absolute',
        left: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    iconRight: {
        width: 40,
        height: 40,
        position: 'absolute',
        right: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    filterRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
