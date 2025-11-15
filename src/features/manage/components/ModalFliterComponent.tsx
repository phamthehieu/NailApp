import { Colors, useAppTheme } from "@/shared/theme";
import DateTimePicker from "@/shared/ui/DatePicker";
import { TextFieldLabel } from "@/shared/ui/Text";
import { TextField } from "@/shared/ui/TextField";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { useBookingForm } from "../hooks/useBookingForm";
import { X } from "lucide-react-native";
import { format } from "date-fns";


export default function ModalFliterComponent({ showAdvanced, setShowAdvanced, form, setForm }: { showAdvanced: boolean, setShowAdvanced: (show: boolean) => void, form: any, setForm: (form: any) => void }) {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    const { getListBookingManager, resetPagination, dateFrom, setDateFrom, dateTo, setDateTo, bookingDate, setBookingDate, bookingCode, setBookingCode, customerName, setCustomerName, phone, setPhone, search, setSearch, sortBy, setSortBy, pageSize, setPageSize, sortType, status, setStatus } = useBookingForm();
    const [activePicker, setActivePicker] = useState<'range-from' | 'range-to' | null>(null);
    const [activeBookingDatePicker, setActiveBookingDatePicker] = useState<boolean>(false);
    const [tempRange, setTempRange] = useState<{ from: Date; to: Date } | null>(null);
    const rangeStartRef = useRef<Date | null>(null);

    const clampToNow = (input: Date) => {
        const now = new Date();
        return input > now ? now : input;
    };

    const handleOpenRangePicker = () => {
        const now = new Date();
        const safeFrom = dateFrom ? clampToNow(dateFrom) : now;
        const safeToRaw = dateTo ? clampToNow(dateTo) : now;
        const safeTo = safeToRaw >= safeFrom ? safeToRaw : safeFrom;
        setTempRange({ from: safeFrom, to: safeTo });
        rangeStartRef.current = safeFrom;
        setActivePicker('range-from');
    };

    const handleConfirmDate = (selectedDate: Date) => {
        if (activePicker === 'range-from') {
            setTempRange((prev) => {
                const maxAllowed = prev?.to ?? dateTo ?? selectedDate;
                const rawFrom = selectedDate > maxAllowed ? maxAllowed : selectedDate;
                const nextFrom = rawFrom;
                const nextTo = prev?.to && prev.to < nextFrom ? nextFrom : (prev?.to ?? nextFrom);
                rangeStartRef.current = nextFrom;
                return { from: nextFrom, to: nextTo };
            });
            setActivePicker(null);
            requestAnimationFrame(() => setActivePicker('range-to'));
            setBookingDate(null);
            return;
        }

        if (activePicker === 'range-to') {
            setTempRange((prev) => {
                const start = rangeStartRef.current ?? prev?.from ?? dateFrom ?? selectedDate;
                const rawEnd = selectedDate >= start ? selectedDate : start;
                const end = rawEnd;
                setDateFrom(start);
                setDateTo(end);
                return { from: start, to: end };
            });
            setActivePicker(null);
            setTempRange(null);
            rangeStartRef.current = null;
            setBookingDate(null);
        }
    };

    const handleClosePicker = () => {
        setActivePicker(null);
        setTempRange(null);
    };

    const handleFilter = () => {
        resetPagination();
        getListBookingManager();
    };

    const handleOpenBookingDatePicker = () => {
        setActiveBookingDatePicker(true);
    };

    const handleConfirmBookingDate = (selectedDate: Date) => {
        setDateFrom(null);
        setDateTo(null);
        setBookingDate(selectedDate);
        setActiveBookingDatePicker(false);
    };

    const handleCloseBookingDatePicker = () => {
        setActiveBookingDatePicker(false);
    };
    return (
        <Modal
            visible={showAdvanced}
            animationType="fade"
            transparent
            onRequestClose={() => setShowAdvanced(false)}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <TextFieldLabel style={styles.modalTitle}>{t('bookingManage.advancedTitle', { defaultValue: 'Tìm kiếm nâng cao' })}</TextFieldLabel>
                    <TextFieldLabel style={styles.modalSubtitle}>{t('bookingManage.advancedSubtitle', { defaultValue: 'Tìm kiếm theo nhiều tiêu chí' })}</TextFieldLabel>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
                        style={{ flex: 1 }}
                    >
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 16 }}
                        >
                            <View style={styles.fieldBlock}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingManage.dateRange')}</TextFieldLabel>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity style={[styles.inputLike, { borderColor: colors.border, flex: 1 }]} onPress={handleOpenRangePicker}>
                                        <TextFieldLabel style={styles.inputLikeText}>{`${dateFrom ? format(dateFrom, 'dd/MM/yyyy HH:mm') : t('bookingManage.pickDate')} - ${dateTo ? format(dateTo, 'dd/MM/yyyy HH:mm') : t('bookingManage.pickDate')}`}</TextFieldLabel>
                                    </TouchableOpacity>
                                    {dateFrom && dateTo && (
                                        <TouchableOpacity onPress={() => {
                                            setDateFrom(null);
                                            setDateTo(null);
                                            resetPagination();
                                        }} style={styles.searchIconButton}>
                                            <X size={20} color={colors.red} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.fieldBlock}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingManage.dateRange')}</TextFieldLabel>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity style={[styles.inputLike, { borderColor: colors.border, flex: 1 }]} onPress={handleOpenBookingDatePicker}>
                                        <TextFieldLabel style={styles.inputLikeText}>{bookingDate ? format(bookingDate, 'dd/MM/yyyy') : t('bookingManage.pickDate')}</TextFieldLabel>
                                    </TouchableOpacity>
                                    {bookingDate && (
                                        <TouchableOpacity onPress={() => setBookingDate(null)} style={styles.searchIconButton}>
                                            <X size={20} color={colors.red} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.fieldBlock}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingManage.bookingCode')}</TextFieldLabel>
                                <TextField
                                    value={bookingCode}
                                    onChangeText={(v: string) => setBookingCode(v)}
                                    placeholder={t('bookingManage.enterCode')}
                                    placeholderTextColor={'#888888'}
                                    style={[styles.input]}
                                    RightAccessory={() => (
                                        bookingCode ? (
                                            <TouchableOpacity onPress={() => setBookingCode('')} style={styles.searchIconButton}>
                                                <X size={20} color={colors.red} />
                                            </TouchableOpacity>
                                        ) : null
                                    )}
                                />
                            </View>

                            <View style={styles.fieldBlock}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingManage.customerName')}</TextFieldLabel>
                                <TextField
                                    value={customerName}
                                    onChangeText={(v: string) => setCustomerName(v)}
                                    placeholder={t('bookingManage.enterCustomer')}
                                    placeholderTextColor={'#888888'}
                                    style={[styles.input]}
                                    RightAccessory={() => (
                                        customerName ? (
                                            <TouchableOpacity onPress={() => setCustomerName('')} style={styles.searchIconButton}>
                                                <X size={20} color={colors.red} />
                                            </TouchableOpacity>
                                        ) : null
                                    )}
                                />
                            </View>

                            <View style={styles.fieldBlock}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingManage.phone')}</TextFieldLabel>
                                <TextField
                                    value={phone}
                                    onChangeText={(v: string) => setPhone(v)}
                                    placeholder={t('bookingManage.enterPhone')}
                                    placeholderTextColor={'#888888'}
                                    keyboardType="phone-pad"
                                    style={[styles.input]}
                                    RightAccessory={() => (
                                        phone ? (
                                            <TouchableOpacity onPress={() => setPhone('')} style={styles.searchIconButton}>
                                                <X size={20} color={colors.red} />
                                            </TouchableOpacity>
                                        ) : null
                                    )}
                                />
                            </View>

                            <View style={styles.fieldBlock}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingManage.status')}</TextFieldLabel>
                                <TouchableOpacity style={[styles.inputLike, { borderColor: '#333333' }]}>
                                    <TextFieldLabel style={styles.inputLikeText}>{status || t('bookingManage.pickStatus')}</TextFieldLabel>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.button, styles.buttonGhost]} onPress={() => setShowAdvanced(false)}>
                            <TextFieldLabel style={styles.buttonGhostText}>{t('bookingManage.close')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary, { backgroundColor: colors.yellow }]}
                            onPress={() => {
                                setShowAdvanced(false);
                                handleFilter();
                            }}
                        >
                            <TextFieldLabel style={styles.buttonPrimaryText}>{t('bookingManage.confirm')}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <DateTimePicker
                mode="datetime"
                title={t('bookingManage.dateRangeStart')}
                value={tempRange?.from ?? dateFrom ?? new Date()}
                visible={activePicker === 'range-from'}
                onChange={handleConfirmDate}
                onClose={handleClosePicker}
                allowFutureDates
                allowPastDates
                autoCloseOnConfirm={false}
            />
            <DateTimePicker
                mode="datetime"
                title={t('bookingManage.dateRangeEnd')}
                value={tempRange?.to ?? dateTo ?? new Date()}
                visible={activePicker === 'range-to'}
                minimumDate={tempRange?.from ?? dateFrom ?? new Date()}
                onChange={handleConfirmDate}
                onClose={handleClosePicker}
                allowFutureDates
                allowPastDates
                autoCloseOnConfirm={false}
            />
            <DateTimePicker
                mode="date"
                title={t('bookingManage.bookingDate')}
                value={bookingDate ?? new Date()}
                visible={activeBookingDatePicker}
                onChange={handleConfirmBookingDate}
                onClose={handleCloseBookingDatePicker}
                allowFutureDates
                allowPastDates
                autoCloseOnConfirm={false}
            />
        </Modal>
    )
}

const $styles = (colors: Colors) => {
    return StyleSheet.create({
        modalBackdrop: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
        },
        modalCard: {
            flex: 1,
            width: '100%',
            maxWidth: 480,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 8,
            borderWidth: 0.3,
            borderColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
        },
        modalSubtitle: {
            marginTop: 6,
            marginBottom: 12,
            fontSize: 13,
            color: '#9CA3AF',
            textAlign: 'center',
        },
        row2: {
            flexDirection: 'row',
        },
        col: {
            flex: 1,
        },
        fieldBlock: {
            marginTop: 12,
        },
        pressableField: {
            borderRadius: 10,
        },
        pressableFieldPressed: {
            opacity: 0.85,
            transform: [{ scale: 0.99 }],
        },
        fieldLabel: {
            marginBottom: 6,
            color: colors.text,
            fontWeight: '600',
        },
        input: {
            height: 44,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
        },
        inputLike: {
            height: 48,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            justifyContent: 'center',
        },
        inputLikeText: {
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
        },
        button: {
            flex: 1,
            height: 44,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonGhost: {
            marginRight: 12,
            backgroundColor: colors.card,
        },
        buttonGhostText: {
            color: colors.text,
            fontWeight: '600',
        },
        buttonPrimary: {
            marginLeft: 12,
        },
        buttonPrimaryText: {
            color: colors.background,
            fontWeight: '700',
        },
        searchIconButton: {
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
};