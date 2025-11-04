import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Animated, Easing } from 'react-native';
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useAppTheme } from '../theme';

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
}: IProps) {
    ;
    const { theme: { colors }} = useAppTheme();
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const searchAnim = React.useRef(new Animated.Value(0)).current;
    const iconScale = React.useRef(new Animated.Value(1)).current;

    const rightIconsCount = (enableSearch ? 1 : 0) + (showIconRight ? 1 : 0);
    const searchContainerWidth = (rightIconsCount === 2 && showIconLeft) ? '60%' : (rightIconsCount === 2 && !showIconLeft) ? '70%' : rightIconsCount === 1 ? '80%' : '90%';
    const rightIconsWidthPx = rightIconsCount * 40;

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
                            <TextInput
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
                            numberOfLines={1}
                            style={[
                                styles.label,
                                { color: colors.background },
                                {
                                    position: 'absolute',
                                    opacity: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                                    transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }]
                                }
                            ]}
                        >
                            {label}
                        </Animated.Text>
                    </>
                )}

                {(showIconRight || enableSearch) && (
                    <View style={[styles.iconRight, { width: Math.max(widthIconRight, enableSearch && showIconRight ? 80 : widthIconRight) }]}> 
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
});
