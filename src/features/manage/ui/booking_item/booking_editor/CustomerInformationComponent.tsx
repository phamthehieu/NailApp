import { Button, FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useMemo, useRef, useState, useCallback, useReducer, useEffect } from "react";
import { ChevronDown, ChevronUp, ClipboardClock, Eye, X } from "lucide-react-native";
import { Dropdown, IDropdownRef } from "react-native-element-dropdown";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextField } from "@/shared/ui/TextField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useEditBookingForm } from "@/features/manage/hooks/useEditBookingForm";
import { useAppSelector } from "@/app/store";
import { RootState } from "@/app/store";
import { customerInfo } from "@/features/manage/api/types";
import HistoryBookingCustomerModal from "./components/HistoryBookingCustomerModal";
import { useBookingForm } from "@/features/manage/hooks/useBookingForm";

type CustomerInformationProps = {
    showDob?: boolean;
    value?: CustomerState;
    onChange?: (state: CustomerState) => void;
};

export type CustomerState = {
    name: string;
    phone: string;
    email: string;
    note: string;
    dob: Date | null;
    id: number | null;
    avatarUrl: string | null;
};

type CustomerAction =
    | { type: "SET_FIELD"; field: keyof CustomerState; value: string | Date | number | null | string }
    | { type: "RESET"; payload?: Partial<CustomerState> };

function customerReducer(state: CustomerState, action: CustomerAction): CustomerState {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value as any };
        case "RESET":
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

const hasCustomerChanged = (prev?: CustomerState, next?: CustomerState) => {
    if (!prev && !next) return false;
    if (!prev || !next) return true;

    const prevDob = prev.dob ? prev.dob.getTime() : null;
    const nextDob = next.dob ? next.dob.getTime() : null;

    return (
        prev.name !== next.name ||
        prev.phone !== next.phone ||
        prev.email !== next.email ||
        prev.note !== next.note ||
        prev.id !== next.id ||
        prev.avatarUrl !== next.avatarUrl ||
        prevDob !== nextDob
    );
};

const getDobParts = (date: Date | null | undefined) => ({
    day: date ? date.getDate() : null,
    month: date ? date.getMonth() : null,
    year: date ? date.getFullYear() : null,
});

const CustomerInformationComponent = ({ showDob = true, value, onChange }: CustomerInformationProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { getListCustomerList } = useEditBookingForm();
    const listCustomerList = useAppSelector((state: RootState) => state.editBooking.listCustomerList);
    const scrollRef = useRef<ScrollView>(null);
    const phoneRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const dayRef = useRef<IDropdownRef>(null);
    const inputPositionsRef = useRef<Record<"name" | "phone" | "email" | "note", number>>({
        name: 0,
        phone: 0,
        email: 0,
        note: 0,
    });

    const initialState = value || {
        name: "",
        phone: "",
        email: "",
        note: "",
        dob: null,
        id: null,
        avatarUrl: null,
    };

    const [customer, dispatchCustomer] = useReducer(customerReducer, initialState);
    const { name, phone, email, note, dob } = customer;
    const [dobParts, setDobParts] = useState<{ day: number | null; month: number | null; year: number | null }>(() =>
        getDobParts(initialState.dob),
    );
    const setName = useCallback((value: string) => {
        dispatchCustomer({ type: "SET_FIELD", field: "name", value });
    }, []);
    const setPhone = useCallback((value: string) => {
        dispatchCustomer({ type: "SET_FIELD", field: "phone", value });
    }, []);
    const setEmail = useCallback((value: string) => {
        dispatchCustomer({ type: "SET_FIELD", field: "email", value });
    }, []);
    const setNote = useCallback((value: string) => {
        dispatchCustomer({ type: "SET_FIELD", field: "note", value });
    }, []);
    const setDobValue = useCallback((value: Date | null, syncParts: boolean = true) => {
        dispatchCustomer({ type: "SET_FIELD", field: "dob", value });
        if (syncParts) {
            setDobParts(getDobParts(value));
        }
    }, []);

    const [showSuggest, setShowSuggest] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const previousValueRef = useRef<CustomerState | undefined>(value);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastEmittedCustomerRef = useRef<CustomerState | undefined>(undefined);
    const syncingRef = useRef(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const { getHistoryBookingItem } = useBookingForm();
    const parseDateOfBirth = useCallback((customer: customerInfo): Date | null => {
        const currentYear = new Date().getFullYear();
        const rawDob = customer.dateOfBirth;

        if (typeof rawDob === "string" && rawDob && rawDob !== "0001-01-01T00:00:00") {
            const parsedDate = new Date(rawDob);
            if (!isNaN(parsedDate.getTime())) {
                return new Date(currentYear, parsedDate.getMonth(), parsedDate.getDate());
            }
        }

        const numericDay = typeof rawDob === "number" && rawDob > 0 ? rawDob : customer.dayBirth ?? null;
        const numericMonthSource =
            typeof customer.monthOfBirth === "number" && customer.monthOfBirth > 0
                ? customer.monthOfBirth
                : customer.monthBirth;
        const numericMonth = numericMonthSource && numericMonthSource > 0 ? numericMonthSource - 1 : null;
        const numericYear =
            typeof customer.yearOfBirth === "number" && customer.yearOfBirth > 0 ? customer.yearOfBirth : currentYear;

        if (numericDay && numericMonth !== null) {
            return new Date(numericYear, numericMonth, numericDay);
        }

        return null;
    }, []);

    const handleSelectCustomer = useCallback((item: customerInfo) => {
        const parsedDob = parseDateOfBirth(item);

        dispatchCustomer({ type: "SET_FIELD", field: "name", value: item.name || "" });
        dispatchCustomer({ type: "SET_FIELD", field: "phone", value: item.phoneNumber || "" });
        dispatchCustomer({ type: "SET_FIELD", field: "email", value: item.email || "" });
        dispatchCustomer({ type: "SET_FIELD", field: "note", value: item.description || "" });
        setDobValue(parsedDob);
        dispatchCustomer({ type: "SET_FIELD", field: "id", value: item.id });

        setShowSuggest(false);
    }, [parseDateOfBirth]);

    useEffect(() => {
        if (!value) return;
        if (!hasCustomerChanged(previousValueRef.current, value)) return;

        syncingRef.current = true;
        dispatchCustomer({ type: "RESET", payload: value });
        setDobParts(getDobParts(value.dob));
        previousValueRef.current = value;
        lastEmittedCustomerRef.current = value;
        syncingRef.current = false;
    }, [value]);

    useEffect(() => {
        if (!onChange || syncingRef.current) return;

        if (hasCustomerChanged(lastEmittedCustomerRef.current, customer)) {
            lastEmittedCustomerRef.current = customer;
            onChange(customer);
        }
    }, [customer, onChange]);

    useMemo(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const safeScrollToInput = useCallback((key: "name" | "phone" | "email" | "note") => {
        const y = inputPositionsRef.current[key] ?? 0;
        const extraOffset = Math.max(keyboardHeight, Platform.OS === "ios" ? insets.top + 56 : 0) + 24;
        const targetY = Math.max(y - extraOffset, 0);
        const delay = keyboardHeight > 0 ? 0 : 80;
        setTimeout(() => {
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ y: targetY, animated: true });
            });
        }, delay);
    }, [insets.top, keyboardHeight]);

    const selectedDay = dobParts.day;
    const selectedMonth = dobParts.month;
    const selectedYear = dobParts.year;

    const daysInMonth = useMemo(() => {
        const year = selectedYear ?? new Date().getFullYear();
        const month = selectedMonth ?? new Date().getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [selectedYear, selectedMonth]);

    const dayOptions = useMemo(
        () =>
            Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const label = day.toString().padStart(2, "0");
                return { label, value: day };
            }),
        [daysInMonth],
    );

    const monthOptions = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const label = month.toString().padStart(2, "0");
                return { label, value: month };
            }),
        [],
    );

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: { label: string; value: number }[] = [];
        for (let year = currentYear; year >= 1950; year -= 1) {
            years.push({ label: String(year), value: year });
        }
        return years;
    }, []);

    const updateDob = useCallback(
        (next: Partial<{ day: number; month: number; year: number }>) => {
            const currentDate = new Date();
            setDobParts((prev) => {
                const updated = {
                    day: next.day ?? prev.day,
                    month: next.month ?? prev.month,
                    year: next.year ?? prev.year,
                };

                if (updated.day == null || updated.month == null) {
                    setDobValue(null, false);
                    return updated;
                }

                const year =
                    updated.year ??
                    selectedYear ??
                    currentDate.getFullYear();

                const maxDay = new Date(year, updated.month + 1, 0).getDate();
                const safeDay = Math.min(updated.day, maxDay);
                const nextDate = new Date(year, updated.month, safeDay);

                setDobValue(nextDate, false);

                return { day: safeDay, month: updated.month, year };
            });
        },
        [selectedYear, setDobValue],
    );

    const rightAccessory = useMemo(() => {
        if (showSuggest) {
            return () => (
                <TouchableOpacity onPress={() => setShowSuggest(false)} style={styles.searchIconButton}>
                    <ChevronUp size={20} color={colors.text} />
                </TouchableOpacity>
            );
        } else {
            return () => (
                <TouchableOpacity onPress={() => setShowSuggest(true)} style={styles.searchIconButton}>
                    <ChevronDown size={20} color={colors.text} />
                </TouchableOpacity>
            );
        }
    }, [showSuggest]);

    const renderItem = (item: any) => {
        return (
            <View style={styles.dropdownItemContainer}>
                <TextFieldLabel allowFontScaling={false} style={styles.dropdownSelectedText}>
                    {item.label}
                </TextFieldLabel>
            </View>
        );
    };

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!name.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                getListCustomerList();
            }, 300);
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            getListCustomerList(name.trim());
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [name]);

    useEffect(() => {
        getListCustomerList();
    }, []);

    const handleShowHistory = useCallback(() => {
        setShowHistoryModal(true);
        getHistoryBookingItem(customer.id?.toString());
    }, [customer, showHistoryModal]);

    const handleCloseHistoryModal = useCallback(() => {
        setShowHistoryModal(false);
    }, [showHistoryModal]);

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
        >
            <ScrollView
                ref={scrollRef}
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="on-drag"
                nestedScrollEnabled
            >
                <View style={styles.formGroup}>

                    <View
                        style={styles.nameWrapper}
                        onLayout={({ nativeEvent: { layout } }) => {
                            inputPositionsRef.current.name = layout.y;
                        }}
                    >

                        <View style={styles.nameRow}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={customer.avatarUrl ? { uri: customer.avatarUrl } : require('@assets/images/avatar.png')}
                                    style={styles.avatar}
                                />
                            </View>

                            <View style={styles.nameInputContainer}>
                                <TextField
                                    label={t('bookingInformation.customerName')}
                                    required={true}
                                    placeholder={t('bookingInformation.customerNamePlaceholder')}
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        dispatchCustomer({ type: "SET_FIELD", field: "id", value: null });
                                        dispatchCustomer({ type: "SET_FIELD", field: "avatarUrl", value: null });
                                    }}
                                    keyboardType="default"
                                    returnKeyType="next"
                                    onFocus={() => {
                                        safeScrollToInput("name");
                                    }}
                                    onSubmitEditing={() => phoneRef.current?.focus()}
                                    RightAccessory={rightAccessory}
                                />
                            </View>

                            {customer.id &&
                                <Pressable
                                    style={({ pressed }) => [styles.historyButton, pressed && styles.historyButtonPressed]}
                                    onPress={handleShowHistory}
                                >
                                    <View style={styles.historyIconWrapper}>
                                        <ClipboardClock size={22} color={colors.text} />
                                    </View>
                                </Pressable>
                            }

                        </View>

                        {!!listCustomerList?.items.length && showSuggest && (
                                <FlatList
                                    data={listCustomerList?.items ?? []}
                                    keyboardShouldPersistTaps="handled"
                                    nestedScrollEnabled
                                    showsVerticalScrollIndicator={false}
                                    style={styles.suggestionScroll}
                                    renderItem={({ item }: { item: customerInfo }) => (
                                        <Pressable
                                            onPress={() => handleSelectCustomer(item)}
                                            style={({ pressed }) => [styles.suggestionItem, pressed && { opacity: 0.8 }]}
                                        >
                                            <TextFieldLabel text={item.name} />
                                        </Pressable>
                                    )}
                                    keyExtractor={(item: customerInfo) => `${item.id}`}
                                />

                        )}
                    </View>
                    <View style={[styles.rowInline, !isWide && !showDob && { flexWrap: "nowrap" }]}>
                        <View
                            style={styles.col}
                            onLayout={({ nativeEvent: { layout } }) => {
                                inputPositionsRef.current.phone = layout.y;
                            }}
                        >
                            <TextField
                                ref={phoneRef}
                                label={t('bookingInformation.phone')}
                                required={true}
                                placeholder={t('bookingInformation.phonePlaceholder')}
                                value={phone}
                                onChangeText={(text) => {
                                    setPhone(text);
                                    dispatchCustomer({ type: "SET_FIELD", field: "id", value: null });
                                }}
                                keyboardType="numeric"
                                returnKeyType="next"
                                onFocus={() => safeScrollToInput("phone")}
                                onSubmitEditing={() => emailRef.current?.focus()}
                            />
                        </View>

                        <View
                            style={styles.col}
                            onLayout={({ nativeEvent: { layout } }) => {
                                inputPositionsRef.current.email = layout.y;
                            }}
                        >
                            <TextField
                                ref={emailRef}
                                label={t('bookingInformation.email')}
                                placeholder={t('bookingInformation.emailPlaceholder')}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    dispatchCustomer({ type: "SET_FIELD", field: "id", value: null });
                                }}
                                keyboardType="email-address"
                                returnKeyType="next"
                                onFocus={() => safeScrollToInput("email")}
                                onSubmitEditing={() => dayRef.current?.open()}
                            />
                        </View>

                        {showDob && isWide && (
                            <>
                                <View style={styles.colSmall}>
                                    <View style={styles.labelRow}>
                                        <TextFieldLabel text={t('bookingInformation.dobDay')} style={styles.labelText} />
                                        <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                                    </View>
                                    <Dropdown
                                        data={dayOptions}
                                        labelField="label"
                                        valueField="value"
                                        value={selectedDay}
                                        onChange={({ value }) => updateDob({ day: value })}
                                        style={styles.dropdown}
                                        containerStyle={styles.dropdownContainer}
                                        itemContainerStyle={styles.dropdownItem}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        showsVerticalScrollIndicator={false}
                                        itemTextStyle={{ color: colors.text }}
                                        placeholderStyle={styles.dropdownSelectedText}
                                        placeholder={selectedDay ? undefined : ""}
                                        renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                        maxHeight={220}
                                        activeColor={colors.backgroundDisabled}
                                        selectedTextProps={{ allowFontScaling: false }}
                                        renderItem={renderItem}
                                    />
                                </View>
                                <View style={styles.colSmall}>
                                    <View style={styles.labelRow}>
                                        <TextFieldLabel text={t('bookingInformation.dobMonth')} style={styles.labelText} />
                                        <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                                    </View>
                                    <Dropdown
                                        data={monthOptions}
                                        labelField="label"
                                        valueField="value"
                                        value={selectedMonth !== null ? selectedMonth + 1 : null}
                                        onChange={({ value }) => updateDob({ month: value - 1 })}
                                        style={styles.dropdown}
                                        containerStyle={styles.dropdownContainer}
                                        itemContainerStyle={styles.dropdownItem}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        showsVerticalScrollIndicator={false}
                                        itemTextStyle={{ color: colors.text }}
                                        placeholderStyle={styles.dropdownSelectedText}
                                        placeholder={selectedMonth !== null ? undefined : ""}
                                        renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                        maxHeight={220}
                                        activeColor={colors.backgroundDisabled}
                                        selectedTextProps={{ allowFontScaling: false }}
                                        renderItem={renderItem}
                                    />
                                </View>
                                {/* <View style={styles.colSmall}>
                                    <View style={styles.labelRow}>
                                        <TextFieldLabel text={t('bookingInformation.dobYear')} style={styles.labelText} />
                                    </View>
                                    <Dropdown
                                        data={yearOptions}
                                        labelField="label"
                                        valueField="value"
                                        value={selectedYear}
                                        onChange={({ value }) => updateDob({ year: value })}
                                        style={styles.dropdown}
                                        containerStyle={styles.dropdownContainer}
                                        itemContainerStyle={styles.dropdownItem}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        showsVerticalScrollIndicator={false}
                                        itemTextStyle={{ color: colors.text }}
                                        placeholderStyle={styles.dropdownSelectedText}
                                        placeholder={selectedYear ? undefined : ""}
                                        renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                        maxHeight={250}
                                        activeColor={colors.backgroundDisabled}
                                        selectedTextProps={{ allowFontScaling: false }}
                                        renderItem={renderItem}
                                    />
                                </View> */}
                            </>
                        )}
                    </View>

                    {showDob && !isWide && (
                        <View style={styles.dobRow}>
                            <View style={styles.colDob}>
                                <View style={styles.labelRow}>
                                    <TextFieldLabel text={t('bookingInformation.dobDay')} style={styles.labelText} />
                                    <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                                </View>
                                <Dropdown
                                    data={dayOptions}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedDay}
                                    onChange={({ value }) => updateDob({ day: value })}
                                    style={styles.dropdown}
                                    containerStyle={styles.dropdownContainer}
                                    itemContainerStyle={styles.dropdownItem}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    showsVerticalScrollIndicator={false}
                                    itemTextStyle={{ color: colors.text }}
                                    placeholderStyle={styles.dropdownSelectedText}
                                    placeholder={selectedDay ? undefined : ""}
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={220}
                                    activeColor={colors.backgroundDisabled}
                                    selectedTextProps={{ allowFontScaling: false }}
                                    renderItem={renderItem}
                                />
                            </View>
                            <View style={styles.colDob}>
                                <View style={styles.labelRow}>
                                    <TextFieldLabel text={t('bookingInformation.dobMonth')} style={styles.labelText} />
                                    <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                                </View>
                                <Dropdown
                                    data={monthOptions}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedMonth !== null ? selectedMonth + 1 : null}
                                    onChange={({ value }) => updateDob({ month: value - 1 })}
                                    style={styles.dropdown}
                                    containerStyle={styles.dropdownContainer}
                                    itemContainerStyle={styles.dropdownItem}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    showsVerticalScrollIndicator={false}
                                    itemTextStyle={{ color: colors.text }}
                                    placeholderStyle={styles.dropdownSelectedText}
                                    placeholder={selectedMonth !== null ? undefined : ""}
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={220}
                                    activeColor={colors.backgroundDisabled}
                                    selectedTextProps={{ allowFontScaling: false }}
                                    renderItem={renderItem}
                                />
                            </View>
                        </View>
                    )}

                    <View
                        onLayout={({ nativeEvent: { layout } }) => {
                            inputPositionsRef.current.note = layout.y;
                        }}
                    >
                        <TextField
                            label={t('bookingInformation.note')}
                            placeholder={t('bookingInformation.notePlaceholder')}
                            value={note}
                            onChangeText={setNote}
                            keyboardType="default"
                            returnKeyType="done"
                            multiline={true}
                            numberOfLines={4}
                            onFocus={() => safeScrollToInput("note")}
                        />
                    </View>

                </View>
            </ScrollView>
            <HistoryBookingCustomerModal isVisible={showHistoryModal} onClose={handleCloseHistoryModal} />
        </KeyboardAvoidingView>
    )
}

const $styles = (colors: Colors, isWide: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
        flex: 1,
        padding: 16,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    rowInline: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
        marginTop: 12,
        flexWrap: isWide ? "nowrap" : "wrap",
    },
    rowWrap: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
        flexWrap: isWide ? "nowrap" : "wrap",
    },
    col: {
        flex: isWide ? 1 : undefined,
        minWidth: isWide ? 140 : 0,
        width: isWide ? undefined : "100%",
    },
    colThird: {
        flex: 1,
        minWidth: isWide ? 0 : 80,
    },
    colSmall: {
        width: isWide ? 120 : "100%",
        flexGrow: isWide ? 0 : 1,
    },
    dobRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
        marginTop: 12,
        flexWrap: "nowrap",
    },
    colDob: {
        flex: 1,
        minWidth: 0,
    },
    nameWrapper: {
        position: "relative",
        zIndex: 10,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    labelText: {
        fontSize: 14,
        fontWeight: "500",
    },
    requiredMark: {
        fontSize: 14,
        color: colors.error,
        marginLeft: 4,
    },
    dropdown: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.card,
    },
    dropdownContainer: {
        borderRadius: 12,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    dropdownItem: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        paddingVertical: 12,
    },
    dropdownSelectedText: {
        fontSize: 16,
        color: colors.text,
    },

    suggestionScroll: {
        maxHeight: 220,
        top: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    formGroup: {
        gap: 20,
        marginBottom: 180,
    },
    dropdownItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: colors.text,
    },
    searchIconButton: {
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatarContainer: {
        width: isWide ? 100 : 80,
        height: isWide ? 100 : 80,
        borderRadius: isWide ? 50 : 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: isWide ? 100 : 80,
        height: isWide ? 100 : 80,
        borderRadius: isWide ? 50 : 40,
        backgroundColor: colors.borderTable,
    },
    nameInputContainer: {
        flex: 1,
    },
    historyButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        width: 48,
        height: 48,
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        top: 15
    },
    historyButtonPressed: {
        opacity: 0.8,
    },
    historyIconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        justifyContent: "center",
        alignItems: "center",
    },
    historyButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
});

export default CustomerInformationComponent;