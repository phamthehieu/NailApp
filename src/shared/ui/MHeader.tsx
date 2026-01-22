import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useAppTheme } from '../theme';
import { TextFieldLabel } from './Text';
import { TextField } from './TextField';
import { useTranslation } from 'react-i18next';

interface IProps {
    label?: string;
    onBack?: () => void;
    showConfig?: boolean;
    viewType?: 'grid' | 'list';
    changeViewType?: () => void;
    iconRight?: React.ReactNode;
    iconLeft?: React.ReactNode;
    onPressIconRight?: () => void;
    isFilter?: boolean;
    showIconLeft?: boolean;
    showIconRight?: boolean;
    bgColor?: string;
    widthIconRight?: number;
    // Search options
    enableSearch?: boolean;
    searchPlaceholder?: string;
    onChangeSearchText?: (text: string) => void;
    onSubmitSearch?: (text: string) => void;
    // Status badge
    status?: string;
    statusColor?: string;
    statusBgColor?: string;
}

export default function MHeader({
    label,
    onBack,
    iconRight,
    iconLeft,
    onPressIconRight,
    showIconLeft,
    showIconRight,
    bgColor,
    widthIconRight = 40,
    enableSearch = false,
    searchPlaceholder = 'Search...',
    onChangeSearchText,
    onSubmitSearch,
    status,
    statusColor,
    statusBgColor,
}: IProps) {
    const { t } = useTranslation();
    const { theme: { colors }} = useAppTheme();
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const searchAnim = React.useRef(new Animated.Value(0)).current;
    const iconScale = React.useRef(new Animated.Value(1)).current;

    const rightIconsCount = (enableSearch ? 1 : 0) + (showIconRight ? 1 : 0);
    const searchContainerWidth = (rightIconsCount === 2 && showIconLeft) ? '60%' : (rightIconsCount === 2 && !showIconLeft) ? '70%' : rightIconsCount === 1 ? '80%' : '90%';
    const rightIconsWidthPx = rightIconsCount * 40;

    const statusBadgeWidth = status ? 120 : 0;
    const iconLeftPadding = showIconLeft ? 48 : 16;
    const iconRightPadding = status ? statusBadgeWidth + 16 : (showIconRight || enableSearch ? rightIconsWidthPx + 16 : 16);

    React.useEffect(() => {
        Animated.timing(searchAnim, {
            toValue: isSearching ? 1 : 0,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [isSearching, searchAnim]);

    return (
            <View style={[styles.header, {backgroundColor: bgColor}]}>
                {showIconLeft &&
                    <TouchableOpacity style={styles.iconLeft} onPress={onBack}>
                        {iconLeft || <ArrowLeft size={24} color={colors.background} />}
                    </TouchableOpacity>
                }

                {(
                    <>
                        <Animated.View style={[styles.searchInputContainer, { width: searchContainerWidth,  marginRight: showIconLeft ? 40 : 0 }, {
                            opacity: searchAnim,
                            transform: [
                                { translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) },
                                { translateX: showIconLeft ? 0 : -rightIconsWidthPx / 2 }
                            ]
                        }]} pointerEvents={isSearching ? 'auto' : 'none'}>
                            <TextField
                                value={searchText}
                                onChangeText={(t) => {
                                    setSearchText(t);
                                    onChangeSearchText && onChangeSearchText(t);
                                }}
                                onSubmitEditing={() => onSubmitSearch && onSubmitSearch(searchText)}
                                placeholder={searchPlaceholder}
                                placeholderTextColor={'#9E9E9E'}
                                style={[styles.searchInput, { color: colors.background, borderColor: colors.background }]}
                                autoFocus={isSearching}
                                returnKeyType="search"
                            />
                        </Animated.View>

                        <Animated.Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[
                                styles.label,
                                { color: colors.background },
                                {
                                    position: 'absolute',
                                    left: iconLeftPadding,
                                    right: iconRightPadding,
                                    opacity: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                                    transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }]
                                }
                            ]}
                        >
                            {label}
                        </Animated.Text>
                    </>
                )}

                {(showIconRight || enableSearch || status) && (
                    <View style={[styles.iconRight, {
                        width: status ? Math.max(120, widthIconRight) : Math.max(widthIconRight, enableSearch && showIconRight ? 80 : widthIconRight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexShrink: 1,
                    }]}>
                        {status && (
                            <View style={[styles.statusBadge, {
                                backgroundColor: statusBgColor || colors.yellow,
                                borderColor: status == t("bookingStatusLabel.waitingCheckin") ? colors.white : statusColor || colors.yellow,
                                borderWidth: 1,
                            }]}>
                                <TextFieldLabel
                                    style={[styles.statusText, { color: status == t("bookingStatusLabel.waitingCheckin") ? colors.white : statusColor || colors.yellow, fontSize: status == t("bookingStatusLabel.checkedIn") ? 10 : 13 }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {status}
                                </TextFieldLabel>
                            </View>
                        )}
                        {enableSearch && (
                            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                                <TouchableOpacity
                                    onPress={() => setIsSearching((v) => !v)}
                                    onPressIn={() => {
                                        Animated.spring(iconScale, { toValue: 0.92, useNativeDriver: true, friction: 5, tension: 120 }).start();
                                    }}
                                    onPressOut={() => {
                                        Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }).start();
                                    }}
                                    style={styles.rightIconBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    {isSearching ? <X size={22} color={colors.background} /> : <Search size={22} color={colors.background} />}
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                        {showIconRight && (
                            <TouchableOpacity onPress={onPressIconRight} style={styles.rightIconBtn}>
                                {iconRight}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
    );
}

const styles = StyleSheet.create({
    header: {
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
        flexDirection: 'row',
        zIndex: 20,
    },
    rightIconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    searchInputContainer: {
        width: '70%',
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    filterRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 0,
        minWidth: 100,
        maxWidth: 200,
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});
