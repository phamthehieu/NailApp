import { Pressable, StyleSheet, Switch, View, useWindowDimensions } from "react-native";
import { useCallback, useMemo } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react-native";
import { Colors, useAppTheme } from "@/shared/theme";
import { TextField } from "@/shared/ui/TextField";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import { RootState, useAppSelector } from "@/app/store";

export type ServiceItem = {
    serviceId: number;
    staffId: number | null;
    serviceTime: number;
    promotionId?: number | null;
};

type ServiceListComponentProps = {
    type?: string;
    services: ServiceItem[];
    onChange: (services: ServiceItem[]) => void;
};

const ServiceListComponent = ({
    type,
    services,
    onChange,
}: ServiceListComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const styles = $styles(colors, isWide);
    const { t } = useTranslation();
    const listService = useAppSelector((state: RootState) => state.editBooking.listService);
    const listStaff = useAppSelector((state: RootState) => state.staff.listStaff);
    const serviceOptions = useMemo(() => {
        return listService?.items?.map((item) => ({
            label: item.name,
            value: item.id.toString(),
            serviceTime: item.serviceTime,
        })) || [];
    }, [listService]);

    const baseStaffOptions = useMemo(() => {
        return listStaff?.map((item) => ({
            label: item.displayName,
            value: item.id.toString(),
        })) || [];
    }, [listStaff]);

    const getStaffOptionsForItem = useCallback((staffId: number | null) => {
        const isAnyEmployee = staffId === null || staffId === 0;
        if (isAnyEmployee) {
            return [
                { label: t('bookingInformation.anyEmployee'), value: 'null' },
                ...baseStaffOptions,
            ];
        }
        return baseStaffOptions;
    }, [baseStaffOptions, t]);

    const addService = useCallback(() => {
        onChange([...services, { serviceId: 0, staffId: null, serviceTime: 0, promotionId: null }]);
    }, [services, onChange]);

    const updateService = useCallback((index: number, patch: Partial<ServiceItem>) => {
        onChange(services.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    }, [services, onChange]);

    const removeService = useCallback((index: number) => {
        onChange(services.filter((_, i) => i !== index));
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
                    style={({ pressed }) => [
                        styles.bookButton,
                        pressed && styles.bookButtonPressed,
                    ]}
                    onPress={addService}
                >
                    <Plus size={18} color={colors.white} />
                    <TextFieldLabel text={t('bookingInformation.addService')} style={styles.bookButtonText} />
                </Pressable>
            </View>

            {services.map((item, index) => (
                <View key={`service-${index}-${item.serviceId}`} style={styles.serviceRow}>
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.serviceLabel', { index: index + 1 })} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Dropdown
                            data={serviceOptions}
                            labelField="label"
                            valueField="value"
                            value={item.serviceId.toString()}
                            onChange={({ value }) => {
                                const selected = serviceOptions.find((option) => option.value === value);
                                updateService(index, {
                                    serviceId: Number(value),
                                    serviceTime: selected?.serviceTime ?? 0,
                                });
                            }}
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
                            readOnly={type === 'checkin'}
                            placeholder={t('bookingInformation.durationPlaceholder')}
                            keyboardType="number-pad"
                            value={item.serviceTime.toString()}
                            onChangeText={(text) => updateService(index, { serviceTime: parseInt(text) || 0 })}
                        />
                    </View>

                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <TextFieldLabel text={t('bookingInformation.staff')} />
                            <TextFieldLabel text={t('bookingInformation.requiredMark')} style={styles.requiredMark} />
                        </View>
                        <Dropdown
                            data={getStaffOptionsForItem(item.staffId)}
                            labelField="label"
                            valueField="value"
                            value={item.staffId === null ? 'null' : item.staffId.toString()}
                            onChange={({ value }) => updateService(index, { staffId: value === 'null' ? null : Number(value) })}
                            style={[styles.dropdown, (item.staffId === null) && styles.dropdownDisabled]}
                            disable={item.staffId === null}
                            showsVerticalScrollIndicator={false}
                            containerStyle={styles.dropdownContainer}
                            itemContainerStyle={styles.dropdownItem}
                            selectedTextStyle={[styles.dropdownSelectedText, (item.staffId === null) && styles.dropdownTextDisabled]}
                            itemTextStyle={{ color: colors.text }}
                            placeholderStyle={styles.dropdownSelectedText}
                            placeholder={t('bookingInformation.staffPlaceholder')}
                            renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                            maxHeight={220}
                            activeColor={colors.backgroundDisabled}
                            selectedTextProps={{ allowFontScaling: false }}
                            renderItem={renderItem}
                        />
                    </View>

                    <View style={styles.actions}>
                        <View style={styles.anyWrap}>

                            <Switch
                                value={item.staffId === null}
                                onValueChange={(val) => {
                                    if (val) {
                                        updateService(index, { staffId: null });
                                    } else {
                                        const currentStaffId = item.staffId !== null && item.staffId !== 0
                                            ? item.staffId
                                            : (baseStaffOptions.length > 0 ? Number(baseStaffOptions[0].value) : null);
                                        updateService(index, { staffId: currentStaffId });
                                    }
                                }}
                                thumbColor={item.staffId === null ? colors.yellow : colors.primary}
                                trackColor={{ true: colors.yellow + "55", false: colors.border }}
                            />

                            <TextFieldLabel text={t('bookingInformation.anyEmployee')} />
                        </View>

                        <Pressable onPress={() => removeService(index)} style={styles.deleteBtn}>
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
    bookButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
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
    dropdownDisabled: {
        opacity: 0.5,
        backgroundColor: colors.backgroundDisabled,
    },
    dropdownTextDisabled: {
        color: colors.placeholderTextColor,
    },
});

export default ServiceListComponent;

