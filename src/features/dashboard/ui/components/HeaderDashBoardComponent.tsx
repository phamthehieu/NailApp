import { Colors, useAppTheme } from "@/shared/theme";
import { Pressable, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon, ChevronLeft, ChevronRight, LayoutGrid, List, Plus, Search, X } from "lucide-react-native";
import { useWindowDimensions } from "react-native";
import { TextField } from "@/shared/ui/TextField";
import { CalendarWeekPickerModal } from "@/shared/ui/CalendarPickers";
import type { DashBoardHookResult } from "../../hooks/useDashBoardHook";
import { Paths } from "@/app/navigation/paths";

const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const isSameDay = (a: Date, b: Date) => {
    return a.toDateString() === b.toDateString();
};

interface HeaderDashBoardComponentProps {
    dashboardHook: DashBoardHookResult;
    viewMode: 'list' | 'grid';
    setViewMode: (mode: 'list' | 'grid') => void;
    onBookPress: () => void;
}

const HeaderDashBoardComponent = ({ dashboardHook, viewMode, setViewMode, onBookPress }: HeaderDashBoardComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => $styles(colors, width), [colors, width]);
    const { listStaff } = useSelector((state: RootState) => state.staff);
    const { t, i18n } = useTranslation();
    const textInputRef = useRef<TextInput>(null);
    const currentLanguage = i18n.language;
    const {
        getListBookingByDashBoard,
        dateFrom,
        dateTo,
        bookingDate,
        setDateFrom,
        setDateTo,
        setBookingDate,
        search,
        setSearch,
        staffId,
        setStaffId,
    } = dashboardHook;
    const [listDropdown, setListDropdown] = useState<{ label: string; value: string | null }[]>([]);
    const [committedRange, setCommittedRange] = useState<{ start: Date; end: Date } | null>(() => {
        const now = new Date();
        const start = getStartOfDay(now);
        return { start, end: now };
    });
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const renderItem = (item: any) => {
        return (
            <View style={styles.item}>
                <TextFieldLabel>{item.label}</TextFieldLabel>
            </View>
        )
    }

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const formatSelectedLabel = (date: Date) => {
        const formatRange = (start: Date, end: Date) => {
            const sameDay = start.toDateString() === end.toDateString();
            if (sameDay) {
                const d = start.getDate();
                const m = start.getMonth() + 1;
                const y = start.getFullYear();
                return `${d}/${m}/${y}`;
            }
            const d1 = start.getDate();
            const d2 = end.getDate();
            const m2 = end.getMonth() + 1;
            const y2 = end.getFullYear();
            return `${d1} -${d2}/${m2}/${y2}`;
        };

        if (committedRange) {
            return formatRange(committedRange.start, committedRange.end);
        }

        const start = getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return formatRange(start, end);
    };

    useEffect(() => {
        setListDropdown([
            { label: t('dashboard.allStaff'), value: null },
            ...listStaff.map(user => ({
                label: user.displayName,
                value: user.id.toString()
            }))
        ]);
        setStaffId(null);
    }, [listStaff, t]);

    const handlePrevDate = () => {
        if (committedRange) {
            const newStart = new Date(committedRange.start);
            newStart.setDate(newStart.getDate() - 1);
            setCommittedRange({
                start: newStart,
                end: committedRange.end,
            });
            return;
        }

        const newSelectedDate = new Date(selectedDate);
        newSelectedDate.setDate(newSelectedDate.getDate() - 7);
        setSelectedDate(newSelectedDate);
    };

    const handleNextDate = () => {
        if (committedRange) {
            const newEnd = new Date(committedRange.end);
            newEnd.setDate(newEnd.getDate() + 1);
            setCommittedRange({
                start: committedRange.start,
                end: newEnd,
            });
            return;
        }

        const newSelectedDate = new Date(selectedDate);
        newSelectedDate.setDate(newSelectedDate.getDate() + 7);
        setSelectedDate(newSelectedDate);
    };

    const getEndOfDay = (date: Date) => {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    };

    useEffect(() => {
        if (committedRange) {
            if (isSameDay(committedRange.start, committedRange.end)) {
                setDateFrom(null);
                setDateTo(null);
                setBookingDate(getStartOfDay(committedRange.start));
                return;
            }
            setBookingDate(null);
            setDateFrom(getStartOfDay(committedRange.start));
            setDateTo(getEndOfDay(committedRange.end));
            return;
        }
        setDateFrom(null);
        setDateTo(null);
        setBookingDate(getStartOfDay(selectedDate));
    }, [committedRange, selectedDate, setBookingDate, setDateFrom, setDateTo]);

    useEffect(() => {
        getListBookingByDashBoard();
    }, [staffId, search, dateFrom, dateTo, bookingDate]);

    return (
        <>
            <View style={styles.container}>
                <Dropdown
                    data={listDropdown}
                    labelField="label"
                    valueField="value"
                    value={staffId === null ? null : staffId.toString()}
                    onChange={(item) => {
                        setStaffId(item.value === null ? null : parseInt(item.value));
                    }}
                    placeholder={t('dashboard.allStaff')}
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    itemContainerStyle={styles.dropdownItemContainer}
                    selectedTextStyle={styles.dropdownSelectedText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    activeColor={colors.backgroundDisabled}
                    itemTextStyle={{ color: colors.text }}
                    showsVerticalScrollIndicator={false}
                    selectedTextProps={{ allowFontScaling: false }}
                    renderItem={renderItem}
                />

                <View style={styles.dateControls}>

                    <Pressable onPress={handlePrevDate} style={styles.iconButton}>
                        <ChevronLeft size={14} color={colors.text} />
                    </Pressable>

                    <TouchableOpacity onPress={() => { setIsPickerVisible(true) }} style={styles.dateButton} activeOpacity={0.8}>
                        <TextFieldLabel style={styles.dateButtonText}>{formatSelectedLabel(selectedDate)}</TextFieldLabel>
                        <CalendarIcon size={14} color={colors.text} />
                    </TouchableOpacity>

                    <Pressable onPress={handleNextDate} style={styles.iconButton}>
                        <ChevronRight size={14} color={colors.text} />
                    </Pressable>

                </View>

                <Pressable
                    style={styles.bookButton}
                    onPress={onBookPress}
                >
                    <Plus size={18} color={colors.white} />
                    <TextFieldLabel style={styles.bookButtonText}>{t('calenderDashboard.calenderTab.book')}</TextFieldLabel>
                </Pressable>

            </View>

            <View style={styles.searchRow}>
                <View style={styles.searchInputWrapper}>
                    <TextField
                        value={search ?? ''}
                        LeftAccessory={(props) => <Search size={16} color={props.editable ? colors.text : colors.placeholderTextColor} />}
                        placeholder={t('dashboard.searchPlaceholder') || 'Search...'}
                        onChangeText={(text) => {
                            setSearch(text || undefined);
                        }}
                        inputWrapperStyle={styles.searchInput}
                        ref={textInputRef}
                        RightAccessory={() => (
                            search ? (
                                <TouchableOpacity onPress={() => {
                                    setSearch(undefined);
                                    textInputRef.current?.blur();
                                }} style={styles.iconButton}>
                                    <X size={16} color={colors.text} />
                                </TouchableOpacity>
                            ) : null
                        )}
                    />
                </View>

                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewToggleOption, viewMode === 'list' && styles.viewToggleOptionActive]}
                        onPress={() => setViewMode('list')}
                        activeOpacity={0.8}
                    >
                        <List size={18} color={viewMode === 'list' ? colors.yellow : colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewToggleOption, viewMode === 'grid' && styles.viewToggleOptionActive]}
                        onPress={() => setViewMode('grid')}
                        activeOpacity={0.8}
                    >
                        <LayoutGrid size={18} color={viewMode === 'grid' ? colors.yellow : colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
            <CalendarWeekPickerModal
                visible={isPickerVisible}
                selectedDate={selectedDate}
                committedRange={committedRange}
                locale={currentLanguage === 'en' ? 'en-US' : 'vi-VN'}
                rangeOnly
                onClose={() => setIsPickerVisible(false)}
                onConfirmWeek={(startDate) => {
                    setSelectedDate(startDate);
                    setCommittedRange(null);
                }}
                onConfirmRange={(range) => {
                    setCommittedRange(range);
                }}
                onClearRange={() => {
                    const now = new Date();
                    setCommittedRange({ start: getStartOfDay(now), end: now });
                    setSelectedDate(now);
                }}
            />
        </>
    )
};

const $styles = (colors: Colors, width: number) => {
    const isTablet = width >= 768;
    const isCompact = width < 560;

    return StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: isCompact ? 'column' : 'row',
            alignItems: isCompact ? 'stretch' : 'center',
            justifyContent: isCompact ? 'flex-start' : 'center',
            paddingHorizontal: 16,
            marginBottom: 6,
            paddingVertical: 12,
            gap: isCompact ? 12 : 16,
            flexWrap: isTablet ? 'nowrap' : 'wrap',
        },
        item: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            color: colors.text,
        },
        dropdown: {
            flex: isCompact ? undefined : 1,
            height: 40,
            backgroundColor: colors.background,
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.borderTable,
            color: colors.text,
            width: isCompact ? '100%' : undefined,
        },
        dropdownContainer: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.borderTable,
            backgroundColor: colors.background,
            marginTop: 4,
            color: colors.text,
        },
        dropdownItemContainer: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            color: colors.text,
        },
        dropdownSelectedText: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        dropdownPlaceholder: {
            fontSize: 14,
            color: colors.text,
        },
        dateControls: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: isCompact ? '100%' : undefined,
        },
        iconButton: {
            padding: 8,
            borderRadius: 6,
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            minHeight: 32,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            backgroundColor: colors.card,
            flexGrow: isCompact ? 1 : 0,
            justifyContent: 'center',
        },
        dateButtonText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: '600',
        },
        bookButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.yellow,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 20,
            gap: 6,
            alignSelf: isCompact ? 'stretch' : 'auto',
            justifyContent: 'center',
        },
        bookButtonText: {
            color: colors.white,
            fontSize: 14,
            fontWeight: '600',
        },
        searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 8,
        },
        searchInput: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            height: 48,
        },
        searchInputWrapper: {
            flex: 1,
        },
        viewToggle: {
            flexDirection: 'row',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            height: 48,
        },
        viewToggleOption: {
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
        },
        viewToggleOptionActive: {
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
};
export default HeaderDashBoardComponent;