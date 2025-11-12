import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { useMemo, useRef, useState, useCallback, useReducer, useEffect } from "react";
import { ChevronDown } from "lucide-react-native";
import { Dropdown, IDropdownRef } from "react-native-element-dropdown";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextField } from "@/shared/ui/TextField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

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
    dob: Date;
};

type CustomerAction =
    | { type: "SET_FIELD"; field: keyof CustomerState; value: string | Date }
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

const CustomerInformationComponent = ({ showDob = true, value, onChange }: CustomerInformationProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

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
        dob: new Date(),
    };

    const [customer, dispatchCustomer] = useReducer(customerReducer, initialState);
    const { name, phone, email, note, dob } = customer;
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
    const setDob = useCallback((value: Date) => {
        dispatchCustomer({ type: "SET_FIELD", field: "dob", value });
    }, []);

    const [showSuggest, setShowSuggest] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const previousValueRef = useRef<CustomerState | undefined>(value);

    useEffect(() => {
        if (value) {
            const prevValue = previousValueRef.current;
            const hasChanged = !prevValue ||
                prevValue.name !== value.name ||
                prevValue.phone !== value.phone ||
                prevValue.email !== value.email ||
                prevValue.note !== value.note ||
                prevValue.dob.getTime() !== value.dob.getTime();

            if (hasChanged) {
                dispatchCustomer({ type: "RESET", payload: value });
                previousValueRef.current = value;
            }
        }
    }, [value]);

    useEffect(() => {
        onChange?.(customer);
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

    const suggestionData = [
        "Huyền Anh",
        "Huyền Trang",
        "Ngọc Anh",
        "Minh Anh",
        "Lan Anh",
        "Khánh Huyền",
        "Thu Huyền",
    ];
    const filtered = name
        ? suggestionData.filter((s) => s.toLowerCase().includes(name.toLowerCase())).slice(0, 6)
        : [];

    const selectedDay = dob.getDate();
    const selectedMonth = dob.getMonth();
    const selectedYear = dob.getFullYear();

    const daysInMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth + 1, 0).getDate();
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
            const day = next.day ?? selectedDay;
            const month = next.month ?? selectedMonth;
            const year = next.year ?? selectedYear;
            const maxDay = new Date(year, month + 1, 0).getDate();
            const safeDay = Math.min(day, maxDay);
            setDob(new Date(year, month, safeDay));
        },
        [selectedDay, selectedMonth, selectedYear],
    );

    const renderItem = (item: any) => {
        return (
            <View style={styles.dropdownItemContainer}>
                <TextFieldLabel allowFontScaling={false} style={styles.dropdownSelectedText}>
                    {item.label}
                </TextFieldLabel>
            </View>
        );
    };

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
            >

                <View style={styles.formGroup}>

                    <View
                        style={styles.nameWrapper}
                        onLayout={({ nativeEvent: { layout } }) => {
                            inputPositionsRef.current.name = layout.y;
                        }}
                    >

                        <TextField
                            label={t('bookingInformation.customerName')}
                            required={true}
                            placeholder={t('bookingInformation.customerNamePlaceholder')}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                setShowSuggest(!!text);
                            }}
                            keyboardType="default"
                            returnKeyType="next"
                            onFocus={() => {
                                setShowSuggest(!!name);
                                safeScrollToInput("name");
                            }}
                            onSubmitEditing={() => phoneRef.current?.focus()}
                        />

                        {!!filtered.length && showSuggest && (
                            <View style={styles.suggestionPopover}>
                                {filtered.map((item) => (
                                    <Pressable
                                        key={item}
                                        onPress={() => {
                                            setName(item);
                                            setShowSuggest(false);
                                        }}
                                        style={({ pressed }) => [styles.suggestionItem, pressed && { opacity: 0.8 }]}
                                    >
                                        <TextFieldLabel text={item} />
                                    </Pressable>
                                ))}
                            </View>
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
                                onChangeText={setPhone}
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
                                onChangeText={setEmail}
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
                                        value={selectedMonth + 1}
                                        onChange={({ value }) => updateDob({ month: value - 1 })}
                                        style={styles.dropdown}
                                        containerStyle={styles.dropdownContainer}
                                        itemContainerStyle={styles.dropdownItem}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        showsVerticalScrollIndicator={false}
                                        itemTextStyle={{ color: colors.text }}
                                        placeholderStyle={styles.dropdownSelectedText}
                                        renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                        maxHeight={220}
                                        activeColor={colors.backgroundDisabled}
                                        selectedTextProps={{ allowFontScaling: false }}
                                        renderItem={renderItem}
                                    />
                                </View>
                                <View style={styles.colSmall}>
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
                                        renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                        maxHeight={250}
                                        activeColor={colors.backgroundDisabled}
                                        selectedTextProps={{ allowFontScaling: false }}
                                        renderItem={renderItem}
                                    />
                                </View>
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
                                    value={selectedMonth + 1}
                                    onChange={({ value }) => updateDob({ month: value - 1 })}
                                    style={styles.dropdown}
                                    containerStyle={styles.dropdownContainer}
                                    itemContainerStyle={styles.dropdownItem}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    showsVerticalScrollIndicator={false}
                                    itemTextStyle={{ color: colors.text }}
                                    placeholderStyle={styles.dropdownSelectedText}
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={220}
                                    activeColor={colors.backgroundDisabled}
                                    selectedTextProps={{ allowFontScaling: false }}
                                    renderItem={renderItem}
                                />
                            </View>
                            <View style={styles.colDob}>
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
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={250}
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
    suggestionPopover: {
        position: "absolute",
        top: 78,
        left: 0,
        right: 0,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 6,
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
});

export default CustomerInformationComponent;