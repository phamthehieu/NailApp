import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, View, useWindowDimensions } from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Clock, Plus, Trash2 } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextField } from "@/shared/ui/TextField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/shared/ui/Text";
import { Dropdown } from "react-native-element-dropdown";


const BookingInformationComponent = () => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const insets = useSafeAreaInsets();

    const [serviceItems, setServiceItems] = useState<Array<{ id: number, name: string, duration: string, staff: string, anyEmployee: boolean }>>([]);
    const [note, setNote] = useState("");
    const scrollRef = useRef<ScrollView>(null);
    const inputPositionsRef = useRef<Record<"note", number>>({
        note: 0,
    });
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isPeriodic, setIsPeriodic] = useState(false);

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


    const serviceOptions = [
        { label: "Gỡ sơn gel", value: "remove_gel" },
        { label: "Chăm sóc móng", value: "nail_care" },
        { label: "Sơn gel", value: "gel_polish" },
        { label: "Đắp bột", value: "acrylic" },
    ];

    const employeeOptions = [
        { label: "Nhân viên bất kỳ", value: "any" },
        { label: "An", value: "an" },
        { label: "Bình", value: "binh" },
        { label: "Chi", value: "chi" },
    ];

    const addService = useCallback(() => {
        setServiceItems((prev) => [...prev, { id: Date.now(), name: "", duration: "", staff: "", anyEmployee: false }]);
    }, []);

    const updateService = useCallback((id: number, patch: Partial<{ name: string, duration: string, staff: string, anyEmployee: boolean }>) => {
        setServiceItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    }, []);

    const removeService = useCallback((id: number) => {
        setServiceItems((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const safeScrollToInput = useCallback((key: "note") => {
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

                    <View style={styles.row}>
                        <Pressable
                            onPress={() => console.log("date")}
                            style={[styles.datePicker, styles.half]}
                        >
                            <TextField
                                label="Ngày đặt lịch"
                                required={true}
                                readOnly
                                editable={false}
                                placeholder="Chọn ngày"
                                style={{ height: 48 }}
                                RightAccessory={() => (
                                    <View style={styles.accessory}>
                                        <Calendar size={18} color={colors.text} />
                                    </View>
                                )}
                            />
                        </Pressable>

                        <Pressable
                            onPress={() => console.log("date")}
                            style={[styles.datePicker, styles.half]}
                        >
                            <TextField
                                label="Giờ đặt lịch"
                                required={true}
                                readOnly
                                editable={false}
                                placeholder="Chọn giờ"
                                style={{ height: 48 }}
                                RightAccessory={() => (
                                    <View style={styles.accessory}>
                                        <Clock size={18} color={colors.text} />
                                    </View>
                                )}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.row}>

                        <Pressable
                            style={styles.bookButton}
                            onPress={addService}
                        >
                            <Plus size={18} color={colors.white} />
                            <Text text="Thêm dịch vụ" style={styles.bookButtonText} />
                        </Pressable>

                    </View>

                    {serviceItems.map((item, index) => (
                        <View key={item.id} style={styles.serviceRow}>
                            <View style={styles.field}>
                                <View style={styles.labelRow}>
                                    <Text text={`Dịch vụ ${index + 1}`} />
                                    <Text text="(*)" style={styles.requiredMark} />
                                </View>
                                <Dropdown
                                    data={serviceOptions}
                                    labelField="label"
                                    valueField="value"
                                    value={item.name}
                                    onChange={({ value }) => updateService(item.id, { name: value as string })}
                                    style={styles.dropdown}
                                    showsVerticalScrollIndicator={false}
                                    containerStyle={styles.dropdownContainer}
                                    itemContainerStyle={styles.dropdownItem}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    itemTextStyle={{ color: colors.text }}
                                    placeholderStyle={styles.dropdownSelectedText}
                                    placeholder="Chọn dịch vụ"
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={220}
                                    activeColor={colors.backgroundDisabled}
                                />
                            </View>
                            <View style={styles.field}>
                                <View style={styles.labelRow}>
                                    <Text text="Thời gian thực hiện" />
                                </View>
                                <TextField
                                    placeholder="Nhập thời gian"
                                    keyboardType="number-pad"
                                    value={item.duration}
                                    onChangeText={(t) => updateService(item.id, { duration: t })}
                                />
                            </View>
                            <View style={styles.field}>
                                <View style={styles.labelRow}>
                                    <Text text="Nhân viên" />
                                    <Text text="(*)" style={styles.requiredMark} />
                                </View>
                                <Dropdown
                                    data={employeeOptions}
                                    labelField="label"
                                    valueField="value"
                                    value={item.staff}
                                    onChange={({ value }) => updateService(item.id, { staff: value as string })}
                                    style={[styles.dropdown, item.anyEmployee && { opacity: 0.6 }]}
                                    showsVerticalScrollIndicator={false}
                                    containerStyle={styles.dropdownContainer}
                                    itemContainerStyle={styles.dropdownItem}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    itemTextStyle={{ color: colors.text }}
                                    placeholderStyle={styles.dropdownSelectedText}
                                    placeholder="Chọn nhân viên"
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={220}
                                    activeColor={colors.backgroundDisabled}
                                    disable={item.anyEmployee}
                                />
                            </View>

                            <View style={styles.actions}>
                                <View style={styles.anyWrap}>
                                    <Switch
                                        value={item.anyEmployee}
                                        onValueChange={(val) => updateService(item.id, { anyEmployee: val, staff: val ? 'any' : item.staff })}
                                        thumbColor={item.anyEmployee ? colors.yellow : colors.primary}
                                        trackColor={{ true: colors.yellow + "55", false: colors.border }}
                                    />
                                    <Text text="Nhân viên bất kỳ" />
                                </View>

                                <Pressable onPress={() => removeService(item.id)} style={styles.deleteBtn}>
                                    <Trash2 size={16} color={colors.error} />
                                    <Text text="Xóa" style={styles.deleteText} />
                                </Pressable>
                            </View>
                        </View>
                    ))}

                    <View
                        style={styles.noteField}
                        onLayout={({ nativeEvent: { layout } }) => {
                            inputPositionsRef.current.note = layout.y;
                        }}
                    >
                        <TextField
                            label="Ghi chú"
                            placeholder="Nhập ghi chú"
                            value={note}
                            onChangeText={setNote}
                            keyboardType="default"
                            returnKeyType="done"
                            multiline={true}
                            numberOfLines={4}
                            onFocus={() => safeScrollToInput("note")}
                        />
                    </View>

                    <Pressable style={[styles.row]} onPress={() => setIsPeriodic(!isPeriodic)}>

                        <Switch
                            value={isPeriodic}
                            onValueChange={setIsPeriodic}
                            thumbColor={isPeriodic ? colors.yellow : colors.primary}
                            trackColor={{ true: colors.yellow + "55", false: colors.border }}
                        />

                        <Text text="Đặt lịch định kỳ" style={styles.periodicText} />

                    </Pressable>

                    {isPeriodic && (

                        <View style={styles.row}>
                            <Pressable
                                onPress={() => console.log("date")}
                                style={[styles.datePicker, styles.half]}
                            >
                                <TextField
                                    label="Ngày đặt lịch"
                                    required={true}
                                    readOnly
                                    editable={false}
                                    placeholder="Chọn ngày"
                                    style={{ height: 48 }}
                                    RightAccessory={() => (
                                        <View style={styles.accessory}>
                                            <Calendar size={18} color={colors.text} />
                                        </View>
                                    )}
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => console.log("date")}
                                style={[styles.datePicker, styles.half]}
                            >
                                <TextField
                                    label="Giờ đặt lịch"
                                    required={true}
                                    readOnly
                                    editable={false}
                                    placeholder="Chọn giờ"
                                    style={{ height: 48 }}
                                    RightAccessory={() => (
                                        <View style={styles.accessory}>
                                            <Clock size={18} color={colors.text} />
                                        </View>
                                    )}
                                />
                            </Pressable>
                        </View>

                    )}

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
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    formGroup: {
        gap: 20,
        marginBottom: 180,
    },
    accessory: {
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    half: {
        flex: 1,
    },
    datePicker: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.yellow,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginHorizontal: 12,
    },
    bookButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 6,
        marginHorizontal: 12,
    },
    field: {
        paddingHorizontal: 6,
        width: isWide ? '32.5%' : '48%',
        minWidth: isWide ? '32.5%' : '48%',
        flexGrow: 1,
        marginVertical: 6,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 6,
        marginTop: 6,
    },
    anyWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.error50,
        borderRadius: 10,
    },
    deleteText: {
        color: colors.error,
    },
    dropdown: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    dropdownContainer: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    dropdownItem: {
        borderBottomWidth: 0,
    },
    dropdownSelectedText: {
        color: colors.text,
        fontSize: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    requiredMark: {
        fontSize: 14,
        color: colors.error,
        marginLeft: 4,
    },
    noteField: {
        marginHorizontal: 12,
        marginTop: 12,
    },
    periodicText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 8,
    },
});

export default BookingInformationComponent;