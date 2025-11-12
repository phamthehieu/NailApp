import { Pressable, StyleSheet, Switch, View, useWindowDimensions } from "react-native";
import { useCallback, useMemo } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextField } from "@/shared/ui/TextField";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";

export type ServiceItem = {
    id: number;
    name: string;
    duration: string;
    staff: string;
    anyEmployee: boolean;
};

type ServiceListComponentProps = {
    services: ServiceItem[];
    onChange: (services: ServiceItem[]) => void;
    serviceOptions?: Array<{ label: string; value: string }>;
    employeeOptions?: Array<{ label: string; value: string }>;
};

const ServiceListComponent = ({ 
    services, 
    onChange,
    serviceOptions: customServiceOptions,
    employeeOptions: customEmployeeOptions,
}: ServiceListComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const { t } = useTranslation();

    const serviceOptions = useMemo(() => 
        customServiceOptions || [
            { label: t('bookingInformation.serviceOptions.removeGel'), value: "remove_gel" },
            { label: t('bookingInformation.serviceOptions.nailCare'), value: "nail_care" },
            { label: t('bookingInformation.serviceOptions.gelPolish'), value: "gel_polish" },
            { label: t('bookingInformation.serviceOptions.acrylic'), value: "acrylic" },
        ],
        [customServiceOptions, t]
    );

    const employeeOptions = useMemo(() => 
        customEmployeeOptions || [
            { label: t('bookingInformation.employeeOptions.any'), value: "any" },
            { label: t('bookingInformation.employeeOptions.an'), value: "an" },
            { label: t('bookingInformation.employeeOptions.binh'), value: "binh" },
            { label: t('bookingInformation.employeeOptions.chi'), value: "chi" },
        ],
        [customEmployeeOptions, t]
    );

    const addService = useCallback(() => {
        onChange([...services, { id: Date.now(), name: "", duration: "", staff: "", anyEmployee: false }]);
    }, [services, onChange]);

    const updateService = useCallback((id: number, patch: Partial<ServiceItem>) => {
        onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    }, [services, onChange]);

    const removeService = useCallback((id: number) => {
        onChange(services.filter((s) => s.id !== id));
    }, [services, onChange]);

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
        <View>
            <View style={styles.row}>
                <Pressable
                    style={styles.bookButton}
                    onPress={addService}
                >
                    <Plus size={18} color={colors.white} />
                    <TextFieldLabel text={t('bookingInformation.addService')} style={styles.bookButtonText} />
                </Pressable>
            </View>

            {services.map((item, index) => (
                <View key={item.id} style={styles.serviceRow}>
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.serviceLabel', { index: index + 1 })} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
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
                            placeholder={t('bookingInformation.servicePlaceholder')}
                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                            maxHeight={220}
                            activeColor={colors.backgroundDisabled}
                            selectedTextProps={{ allowFontScaling: false }}
                            renderItem={renderItem}
                        />
                    </View>
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.duration')} />
                        </View>
                        <TextField
                            placeholder={t('bookingInformation.durationPlaceholder')}
                            keyboardType="number-pad"
                            value={item.duration}
                            onChangeText={(text) => updateService(item.id, { duration: text })}
                        />
                    </View>
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.staff')} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
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
                            placeholder={t('bookingInformation.staffPlaceholder')}
                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                            maxHeight={220}
                            activeColor={colors.backgroundDisabled}
                            disable={item.anyEmployee}
                            selectedTextProps={{ allowFontScaling: false }}
                            renderItem={renderItem}
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
                            <TextFieldLabel text={t('bookingInformation.anyEmployee')} />
                        </View>

                        <Pressable onPress={() => removeService(item.id)} style={styles.deleteBtn}>
                            <Trash2 size={16} color={colors.error} />
                            <TextFieldLabel text={t('bookingInformation.delete')} style={styles.deleteText} />
                        </Pressable>
                    </View>
                </View>
            ))}
        </View>
    );
};

const $styles = (colors: Colors, isWide: boolean) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        marginTop: 12,
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
    dropdownItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: colors.text,
    },
});

export default ServiceListComponent;

