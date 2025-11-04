import { Colors, useAppTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function ModalFliterComponent({ showAdvanced, setShowAdvanced, form, setForm }: { showAdvanced: boolean, setShowAdvanced: (show: boolean) => void, form: any, setForm: (form: any) => void }) {
    const {theme: { colors }} = useAppTheme();
    const styles = $styles(colors);
    const { t } = useTranslation();
    return (
        <Modal
        visible={showAdvanced}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAdvanced(false)}
    >
        <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{t('bookingManage.advancedTitle', { defaultValue: 'Tìm kiếm nâng cao' })}</Text>
                <Text style={styles.modalSubtitle}>{t('bookingManage.advancedSubtitle', { defaultValue: 'Tìm kiếm theo nhiều tiêu chí' })}</Text>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
                >
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.row2}>
                        <View style={[styles.col, { marginRight: 8 }]}>
                            <Text style={styles.fieldLabel}>{t('bookingManage.fromDate', { defaultValue: 'Từ ngày' })}</Text>
                            <TouchableOpacity style={[styles.inputLike, { borderColor: '#333333' }]}>
                                <Text style={styles.inputLikeText}>{form.fromDate || t('bookingManage.pickDate', { defaultValue: 'Chọn ngày' })}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.col, { marginLeft: 8 }]}>
                            <Text style={styles.fieldLabel}>{t('bookingManage.toDate', { defaultValue: 'Đến ngày' })}</Text>
                            <TouchableOpacity style={[styles.inputLike, { borderColor: '#333333' }]}>
                                <Text style={styles.inputLikeText}>{form.toDate || t('bookingManage.pickDate', { defaultValue: 'Chọn ngày' })}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{t('bookingManage.bookingCode', { defaultValue: 'Mã booking' })}</Text>
                        <TextInput
                            value={form.bookingCode}
                            onChangeText={(v) => setForm({ ...form, bookingCode: v })}
                            placeholder={t('bookingManage.enterCode', { defaultValue: 'Nhập mã' })}
                            placeholderTextColor={'#888888'}
                            style={[styles.input, { borderColor: '#333333', color: colors.text }]}
                        />
                    </View>

                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{t('bookingManage.customerName', { defaultValue: 'Tên khách hàng' })}</Text>
                        <TextInput
                            value={form.customerName}
                            onChangeText={(v) => setForm({ ...form, customerName: v })}
                            placeholder={t('bookingManage.enterCustomer', { defaultValue: 'Nhập tên khách' })}
                            placeholderTextColor={'#888888'}
                            style={[styles.input, { borderColor: '#333333', color: colors.text }]}
                        />
                    </View>

                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{t('bookingManage.phone', { defaultValue: 'Số điện thoại' })}</Text>
                        <TextInput
                            value={form.phone}
                            onChangeText={(v) => setForm({ ...form, phone: v })}
                            placeholder={t('bookingManage.enterPhone', { defaultValue: 'Nhập số điện thoại' })}
                            placeholderTextColor={'#888888'}
                            keyboardType="phone-pad"
                            style={[styles.input, { borderColor: '#333333', color: colors.text }]}
                        />
                    </View>

                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{t('bookingManage.service', { defaultValue: 'Dịch vụ' })}</Text>
                        <TouchableOpacity style={[styles.inputLike, { borderColor: '#333333' }]}>
                            <Text style={styles.inputLikeText}>{form.service || t('bookingManage.pickService', { defaultValue: 'Chọn dịch vụ' })}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{t('bookingManage.status', { defaultValue: 'Trạng thái' })}</Text>
                        <TouchableOpacity style={[styles.inputLike, { borderColor: '#333333' }]}>
                            <Text style={styles.inputLikeText}>{form.status || t('bookingManage.pickStatus', { defaultValue: 'Chọn trạng thái' })}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                </KeyboardAvoidingView>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.button, styles.buttonGhost]} onPress={() => setShowAdvanced(false)}>
                        <Text style={styles.buttonGhostText}>{t('common.close', { defaultValue: 'Đóng' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary, { backgroundColor: colors.yellow }]}
                        onPress={() => {
                            setShowAdvanced(false);
                            // TODO: trigger search with form
                        }}
                    >
                        <Text style={styles.buttonPrimaryText}>{t('common.confirm', { defaultValue: 'Xác nhận' })}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
            height: 44,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            justifyContent: 'center',
        },
        inputLikeText: {
            color: '#9CA3AF',
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
    });
};