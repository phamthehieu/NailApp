import React, { useEffect, useState } from "react";
import { StyleSheet, View, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Switch, TextInput, useWindowDimensions } from "react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { X, ChevronDown } from "lucide-react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TextField } from "@/shared/ui/TextField";
import { RootState, useAppSelector } from "@/app/store";
import { PaymentItem, promotionItem, PutPaymentBookingRequest } from "../../api/types";


export type PaymentServiceItem = {
    id: number | string;
    service: string;
    price: number;
    promotion?: string;
    discount: number;
    total: number;
};

interface BookingPaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const BookingPaymentModal = ({
    visible,
    onClose,
    onConfirm,
}: BookingPaymentModalProps) => {
    const { theme: { colors } } = useAppTheme();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 400;
    const styles = $styles(colors, isSmallScreen);
    const { t, i18n } = useTranslation();
    const { detailBookingItem } = useAppSelector((state: RootState) => state.booking);
    const { listPromotion, listPaymentType } = useAppSelector((state: RootState) => state.editBooking);

    const [dataPaymentBooking, setDataPaymentBooking] = useState<PaymentItem>();
    const [servicePromotions, setServicePromotions] = useState<Record<number, promotionItem | null>>({});
    const [paymentList, setPaymentList] = useState<{ label: string, value: number }[]>([]);

    const [voucherCode, setVoucherCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [customerAmount, setCustomerAmount] = useState("");
    const [printInvoice, setPrintInvoice] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [vat, setVat] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [change, setChange] = useState(0);

    const formatCurrency = (amount: number) => {
        const currentLanguage = i18n.language || 'vi';
        const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-AU';
        return new Intl.NumberFormat(locale).format(amount);
    };

    const calculateDiscount = (originalPrice: number, promotion: promotionItem | null): number => {
        if (!promotion) return 0;

        if (promotion.discountType === 1) {
            return (originalPrice * promotion.discountValue) / 100;
        }

        if (promotion.discountType === 2) {
            return promotion.discountValue;
        }
        return 0;
    };

    const calculatePriceAfterDiscount = (originalPrice: number, promotion: promotionItem | null): number => {
        const discount = calculateDiscount(originalPrice, promotion);
        return Math.max(0, originalPrice - discount);
    };

    const handlePromotionChange = (serviceId: number, promotionId: number | null) => {
        if (!listPromotion?.items) return;

        const selectedPromotion = promotionId
            ? listPromotion.items.find(p => p.id === promotionId) || null
            : null;

        setServicePromotions(prev => ({
            ...prev,
            [serviceId]: selectedPromotion
        }));

        if (dataPaymentBooking) {
            setDataPaymentBooking({
                ...dataPaymentBooking,
                services: dataPaymentBooking.services.map(service =>
                    service.serviceId === serviceId
                        ? { ...service, promotionId: promotionId || null }
                        : service
                )
            });
        }
    };

    const handleClearPromotion = (serviceId: number) => {
        setServicePromotions(prev => ({
            ...prev,
            [serviceId]: null
        }));

        if (dataPaymentBooking) {
            setDataPaymentBooking({
                ...dataPaymentBooking,
                services: dataPaymentBooking.services.map(service =>
                    service.serviceId === serviceId
                        ? { ...service, promotionId: null }
                        : service
                )
            });
        }
    };

    const getPromotionOptions = () => {
        if (!listPromotion?.items) return [];

        return listPromotion.items.map(promotion => ({
            label: promotion.name,
            value: promotion.id
        }));
    };

    const handleConfirm = () => {
        onConfirm();
    };

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
        if (detailBookingItem) {
            const services = detailBookingItem.services.map((service) => ({
                serviceId: service.id ?? 0,
                staffId: service.staff?.id ?? null,
                serviceTime: service.serviceTime,
                promotionId: service.promotion?.id ?? null,
                serviceName: service.serviceName,
                price: service.price,
                serviceCode: service.serviceCode,
            }));

            setDataPaymentBooking({
                id: detailBookingItem.id,
                services,
                voucherId: 0,
                amount: 0,
                amountVouchers: 0,
                totalAmount: 0,
                paymentType: 0,
                customerPayment: 0,
                customerChange: 0,
                isInvoice: true,
            });

            const initialPromotions: Record<number, promotionItem | null> = {};
            services.forEach(service => {
                if (service.promotionId && listPromotion?.items) {
                    const promotion = listPromotion.items.find(p => p.id === service.promotionId);
                    if (promotion) {
                        initialPromotions[service.serviceId] = promotion;
                    }
                }
            });
            setServicePromotions(initialPromotions);
        }
    }, [detailBookingItem, listPromotion]);

    useEffect(() => {
        const calculatedTotalAmount = dataPaymentBooking?.services?.reduce((sum, service) => {
            const promotion = servicePromotions[service.serviceId] || null;
            const priceAfterDiscount = calculatePriceAfterDiscount(service.price || 0, promotion);
            return sum + priceAfterDiscount;
        }, 0) || 0;

        const calculatedVat = calculatedTotalAmount * 0.08;
        const calculatedFinalAmount = calculatedTotalAmount + calculatedVat;

        setTotalAmount(calculatedTotalAmount);
        setVat(calculatedVat);
        setFinalAmount(calculatedFinalAmount);
    }, [dataPaymentBooking, servicePromotions]);

    useEffect(() => {
        if (listPaymentType) {
            setPaymentList(listPaymentType.map(payment => ({ label: payment.name ?? "", value: payment.id ?? 0 })));
        }
    }, [listPaymentType]);

    useEffect(() => {
        setChange(Number(customerAmount) - finalAmount);
    }, [customerAmount, finalAmount]);

    const handlePayment = () => {
        if (dataPaymentBooking) {
            const paymentRequest: PutPaymentBookingRequest = {
                id: dataPaymentBooking.id,
                services: dataPaymentBooking.services.map(service => ({
                    serviceId: service.serviceId,
                    staffId: service.staffId,
                    serviceTime: service.serviceTime,
                    promotionId: service.promotionId,
                })),
                voucherId: 0,
                amount: totalAmount,
                amountVouchers: 0,
                totalAmount: finalAmount,
                paymentType: paymentMethod,
                customerPayment: Number(customerAmount),
                customerChange: change,
                isInvoice: printInvoice,
            };
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdropTouchable} />
                </TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                    <View style={styles.header}>
                        <TextFieldLabel style={styles.title}>{t('bookingPayment.title')}</TextFieldLabel>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TextFieldLabel style={styles.subtitle}>
                        {t('bookingPayment.subtitle')}
                    </TextFieldLabel>

                    <ScrollView
                        style={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.mobileTableContainer}>
                            {dataPaymentBooking?.services?.map((item, index) => (
                                <View key={item.serviceId} style={styles.mobileServiceCard}>
                                    <View style={styles.mobileCardHeader}>
                                        <TextFieldLabel style={styles.mobileCardTitle}>{t('bookingPayment.service')} {index + 1}</TextFieldLabel>
                                        <TextFieldLabel style={styles.mobileServiceName}>{t('bookingPayment.service')}: {item.serviceName}</TextFieldLabel>
                                    </View>
                                    <View style={styles.mobileCardRow}>
                                        <TextFieldLabel style={styles.mobileCardLabel}>{t('bookingPayment.price')}:</TextFieldLabel>
                                        <TextFieldLabel style={styles.mobileCardValue}>{formatCurrency(item.price)}</TextFieldLabel>
                                    </View>
                                    <View style={styles.mobileCardRow}>
                                        <TextFieldLabel style={styles.mobileCardLabel}>{t('bookingPayment.promotion')}:</TextFieldLabel>
                                        <View style={styles.mobilePromotionContainer}>
                                            <Dropdown
                                                data={getPromotionOptions()}
                                                labelField="label"
                                                valueField="value"
                                                value={servicePromotions[item.serviceId]?.id || null}
                                                onChange={(selected) => handlePromotionChange(item.serviceId, selected.value)}
                                                style={styles.mobilePromotionDropdown}
                                                containerStyle={styles.dropdownContainer}
                                                itemContainerStyle={styles.dropdownItem}
                                                selectedTextStyle={styles.mobileDropdownSelectedText}
                                                showsVerticalScrollIndicator={false}
                                                itemTextStyle={{ color: colors.text, fontSize: 14 }}
                                                placeholderStyle={styles.mobileDropdownPlaceholder}
                                                placeholder={t('bookingPayment.promotionPlaceholder')}
                                                renderRightIcon={() => <ChevronDown size={18} color={colors.placeholderTextColor} />}
                                                maxHeight={200}
                                                activeColor={colors.backgroundDisabled}
                                                selectedTextProps={{ allowFontScaling: false }}
                                                renderItem={renderItem}
                                            />
                                            {servicePromotions[item.serviceId] && (
                                                <TouchableOpacity
                                                    onPress={() => handleClearPromotion(item.serviceId)}
                                                    style={styles.clearButton}
                                                >
                                                    <X size={16} color={colors.red} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.mobileCardRow}>
                                        <TextFieldLabel style={styles.mobileCardLabel}>{t('bookingPayment.discount')}:</TextFieldLabel>
                                        <TextFieldLabel style={styles.mobileCardValue}>
                                            {formatCurrency(calculateDiscount(item.price, servicePromotions[item.serviceId] || null))}
                                        </TextFieldLabel>
                                    </View>
                                    <View style={[styles.mobileCardRow, styles.mobileCardTotalRow]}>
                                        <TextFieldLabel style={styles.mobileCardTotalLabel}>{t('bookingPayment.total')}:</TextFieldLabel>
                                        <TextFieldLabel style={styles.mobileCardTotalValue}>
                                            {formatCurrency(calculatePriceAfterDiscount(item.price, servicePromotions[item.serviceId] || null))}
                                        </TextFieldLabel>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.voucherSection}>
                            <View style={styles.voucherInputContainer}>
                                <TextField
                                    label={t('bookingPayment.voucher')}
                                    placeholder={t('bookingPayment.voucherPlaceholder')}
                                    placeholderTextColor={colors.placeholderTextColor}
                                    value={voucherCode}
                                    onChangeText={setVoucherCode}
                                />
                            </View>
                            <TouchableOpacity style={styles.applyButton}>
                                <TextFieldLabel style={styles.applyButtonText}>{t('bookingPayment.apply')}</TextFieldLabel>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.summarySection}>
                            <View style={styles.summaryRow}>
                                <TextFieldLabel style={styles.summaryLabel}>{t('bookingPayment.totalAmount')}</TextFieldLabel>
                                <TextFieldLabel style={styles.summaryValue}>{formatCurrency(totalAmount)}</TextFieldLabel>
                            </View>
                            <View style={styles.summaryRow}>
                                <TextFieldLabel style={styles.summaryLabel}>{t('bookingPayment.totalDiscount')}</TextFieldLabel >
                                <TextFieldLabel style={[styles.summaryValue, styles.discountValue]}></TextFieldLabel>
                            </View>
                            <View style={styles.summaryRow}>
                                <TextFieldLabel style={styles.summaryLabel}>{t('bookingPayment.vat')} (8%)</TextFieldLabel>
                                <TextFieldLabel style={styles.summaryValue}>{formatCurrency(vat)}</TextFieldLabel>
                            </View>
                            <View style={[styles.summaryRow, styles.finalAmountRow]}>
                                <TextFieldLabel style={styles.finalAmountLabel}>{t('bookingPayment.finalAmount')}</TextFieldLabel>
                                <TextFieldLabel style={styles.finalAmountValue}>{formatCurrency(finalAmount)}</TextFieldLabel>
                            </View>
                        </View>

                        <View style={styles.paymentSection}>
                            <View style={styles.paymentField}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingPayment.paymentMethod')}</TextFieldLabel>
                                <Dropdown
                                    data={paymentList}
                                    labelField="label"
                                    valueField="value"
                                    value={paymentMethod}
                                    onChange={(item) => setPaymentMethod(item.value)}
                                    style={styles.paymentDropdown}
                                    containerStyle={styles.dropdownContainer}
                                    itemContainerStyle={styles.dropdownItem}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    showsVerticalScrollIndicator={false}
                                    itemTextStyle={{ color: colors.text }}
                                    placeholderStyle={styles.dropdownPlaceholder}
                                    renderRightIcon={() => <ChevronDown size={16} color={colors.placeholderTextColor} />}
                                    maxHeight={150}
                                    activeColor={colors.backgroundDisabled}
                                    selectedTextProps={{ allowFontScaling: false }}
                                    renderItem={renderItem}
                                />
                            </View>
                            <View style={styles.paymentField}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingPayment.customerAmount')}</TextFieldLabel>
                                <TextField
                                    style={styles.changeText}
                                    placeholder={t('bookingPayment.customerAmount')}
                                    placeholderTextColor={colors.placeholderTextColor}
                                    value={customerAmount}
                                    onChangeText={setCustomerAmount}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.paymentField}>
                                <TextFieldLabel style={styles.fieldLabel}>{t('bookingPayment.change')}</TextFieldLabel>
                                <View style={styles.changeField}>
                                    <TextFieldLabel style={styles.changeText}>{customerAmount ? formatCurrency(Number(customerAmount) - finalAmount) : formatCurrency(0)}</TextFieldLabel>
                                </View>
                            </View>
                            <View style={styles.invoiceRow}>
                                <TextFieldLabel style={styles.invoiceLabel}>{t('bookingPayment.printInvoice')}</TextFieldLabel>
                                <Switch
                                    value={printInvoice}
                                    onValueChange={setPrintInvoice}
                                    thumbColor={printInvoice ? colors.yellow : colors.primary}
                                    trackColor={{ true: colors.yellow + "55", false: colors.border }}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.closeButtonAction} onPress={onClose}>
                            <TextFieldLabel style={styles.closeButtonText}>{t('bookingPayment.close')}</TextFieldLabel>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.yellow }]}
                            onPress={handlePayment}
                        >
                            <TextFieldLabel style={styles.confirmButtonText}>{t('bookingPayment.confirm')}</TextFieldLabel>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const $styles = (colors: Colors, isSmallScreen: boolean) => StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 4,
    },
    backdropTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalCard: {
        width: '100%',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 0.3,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.placeholderTextColor,
        marginBottom: 20,
    },
    contentContainer: {
        maxHeight: isSmallScreen ? 400 : 500,
        marginBottom: 20,
    },
    // Table Styles
    tableScrollContainer: {
        marginBottom: 20,
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
        minWidth: isSmallScreen ? 600 : '100%',
    },
    // Mobile Table Styles
    mobileTableContainer: {
        marginBottom: 20,
        gap: 12,
    },
    mobileServiceCard: {
        backgroundColor: colors.backgroundDisabled,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mobileCardHeader: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    mobileCardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.placeholderTextColor,
        marginBottom: 4,
    },
    mobileServiceName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    mobileCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    mobileCardLabel: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    mobileCardValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        textAlign: 'right',
    },
    mobileCardTotalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    mobileCardTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    mobileCardTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.yellow,
        flex: 1,
        textAlign: 'right',
    },
    mobilePromotionContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mobilePromotionDropdown: {
        flex: 1,
        height: 44,
        backgroundColor: colors.card,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    mobileDropdownSelectedText: {
        fontSize: 14,
        color: colors.text,
    },
    mobileDropdownPlaceholder: {
        fontSize: 14,
        color: colors.placeholderTextColor,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundDisabled,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableHeaderCell: {
        fontSize: isSmallScreen ? 11 : 12,
        fontWeight: '600',
        color: colors.text,
        paddingVertical: 12,
        paddingHorizontal: 8,
        textAlign: 'center',
    },
    tableRow: {
        width: '100%',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: isSmallScreen ? 11 : 12,
        color: colors.text,
        paddingVertical: 12,
        paddingHorizontal: 8,
        textAlign: 'center',
    },
    colStt: {
        width: 40,
    },
    colService: {
        flex: 1.5,
        minWidth: 150,
        textAlign: 'left',
    },
    colPrice: {
        flex: 1,
        minWidth: 100,
    },
    colPromotion: {
        flex: 1.5,
        alignItems: 'stretch',
        minWidth: 150,
    },
    promotionCell: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    colDiscount: {
        flex: 1,
        minWidth: 100,
    },
    colTotal: {
        flex: 1,
        minWidth: 100,
    },
    promotionDropdown: {
        flex: 1,
        height: isSmallScreen ? 40 : 38,
        backgroundColor: colors.backgroundDisabled,
        borderRadius: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    promotionDropdownSelectedText: {
        fontSize: 13,
        color: colors.text,
    },
    promotionDropdownPlaceholder: {
        fontSize: 13,
        color: colors.placeholderTextColor,
    },
    promotionDropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
    },
    clearButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonTable: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Voucher Styles
    voucherSection: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        marginBottom: 20,
    },
    voucherInputContainer: {
        flex: 1,
    },
    voucherLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    voucherInput: {
        flex: 1,
        height: 44,
        backgroundColor: colors.card,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 14,
    },
    applyButton: {
        paddingHorizontal: 20,
        height: 44,
        backgroundColor: colors.yellow,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
    },
    // Summary Styles
    summarySection: {
        backgroundColor: colors.backgroundDisabled,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.text,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    discountValue: {
        color: colors.error,
    },
    finalAmountRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    finalAmountLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    finalAmountValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.yellow,
    },
    // Payment Styles
    paymentSection: {
        marginBottom: 20,
    },
    paymentField: {
        marginBottom: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    paymentFieldHorizontal: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    paymentDropdown: {
        height: isSmallScreen ? 48 : 40,
        backgroundColor: colors.card,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    amountInput: {
        height: isSmallScreen ? 48 : 40,
        backgroundColor: colors.card,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: colors.text,
        fontSize: isSmallScreen ? 16 : 14,
    },
    changeField: {
        height: 44,
        backgroundColor: colors.backgroundDisabled,
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    changeText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    invoiceLabel: {
        fontSize: 14,
        color: colors.text,
    },
    dropdownContainer: {
        backgroundColor: colors.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dropdownSelectedText: {
        fontSize: isSmallScreen ? 13 : 12,
        color: colors.text,
    },
    dropdownPlaceholder: {
        fontSize: isSmallScreen ? 13 : 12,
        color: colors.placeholderTextColor,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    closeButtonAction: {
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 8,
        backgroundColor: colors.backgroundDisabled,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    confirmButton: {
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.black,
    },
    dropdownItemContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        color: colors.text,
    },
});

export default BookingPaymentModal;