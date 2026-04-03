import { Paths } from '@/app/providers/navigation/paths';
import { RootScreenProps } from '@/app/providers/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { StyleSheet, Dimensions, View, TouchableOpacity, ScrollView, BackHandler, KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { TextFieldLabel } from '@/shared/ui/Text';
import Loader from '@/shared/ui/Loader';
import { TextField, TextFieldAccessoryProps } from '@/shared/ui/TextField';
import { Button } from '@/shared/ui/Button';
import { Check, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { postCheckinApi } from '../api/storeApi';
import { alertService } from '@/services/alertService';
import { RootState, useAppDispatch } from '@/app/store';
import { useSelector } from 'react-redux';
import { clearAuth } from '@/services/auth/authService';
import { clearAuthState } from '@/features/auth/model/authSlice';
import { createAccountApi, createOTPApi } from '@/features/auth/api/registerApi';

type CheckinSuccessVoucher = {
    name: string;
    description: string;
};

/**
 * Parse body check-in. `http.put` trả về thẳng JSON body (vd `{ point, vouchers }`);
 * vẫn hỗ trợ wrapper có `data` string/object lồng nhau (tối đa vài lớp).
 */
const extractCheckinResult = (
    response: unknown,
): { code: string; point: number; vouchers: CheckinSuccessVoucher[] } => {
    const root = response as any;
    let node: any = response;

    for (let i = 0; i < 4; i++) {
        if (node == null || typeof node !== 'object') {
            node = {};
            break;
        }
        const inner = node.data;
        if (typeof inner === 'string') {
            try {
                node = JSON.parse(inner);
                continue;
            } catch {
                break;
            }
        }
        if (inner && typeof inner === 'object') {
            node = inner;
            continue;
        }
        break;
    }

    const code = String(node?.code ?? root?.code ?? '');
    const point = node?.point ?? 0;
    const rawList = Array.isArray(node?.vouchers) ? node.vouchers : [];
    const vouchers = rawList
        .map((v: any) => ({
            name: String(v?.name ?? '').trim(),
            description: String(v?.description ?? '').trim(),
        }))
        .filter((v: CheckinSuccessVoucher) => v.name || v.description);

    return { code, point, vouchers };
};

const CheckinScreen = ({ navigation }: RootScreenProps<Paths.Checkin>) => {
    const { theme: { colors } } = useAppTheme();
    const isTablet = useIsTablet();
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const isSmallScreen = screenWidth < 400;
    const styles = $styles(colors, isTablet, screenWidth, isSmallScreen);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [consentChecked, setConsentChecked] = useState(true);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
    const [registerPhoneNumber, setRegisterPhoneNumber] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerLastName, setRegisterLastName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [registerGuidId, setRegisterGuidId] = useState('');
    const [checkinSuccessModalVisible, setCheckinSuccessModalVisible] = useState(false);
    const [checkinSuccessPoint, setCheckinSuccessPoint] = useState(0);
    const [checkinSuccessVouchers, setCheckinSuccessVouchers] = useState<CheckinSuccessVoucher[]>([]);
    const dispatch = useAppDispatch();
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);

    const openCheckinSuccessModal = (point: number, vouchers: CheckinSuccessVoucher[]) => {
        setCheckinSuccessPoint(point);
        setCheckinSuccessVouchers(vouchers);
        setCheckinSuccessModalVisible(true);
    };

    const closeCheckinSuccessModal = () => {
        setCheckinSuccessModalVisible(false);
        setCheckinSuccessVouchers([]);
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
            if (e.data.action.type === 'GO_BACK') {
                e.preventDefault();
            }
        });

        return () => {
            backHandler.remove();
            unsubscribeBeforeRemove();
        };
    }, [navigation]);

    const formatPhoneNumber = (value: string): string => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 0) return '';

        if (cleaned.startsWith('04')) {
            if (cleaned.length <= 2) return cleaned;
            if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}${cleaned.slice(2)}`;
            if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
        }

        if (cleaned.startsWith('0')) {
            if (cleaned.length <= 3) return cleaned;
            if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
        }

        const withZero = cleaned.startsWith('4') ? `0${cleaned}` : cleaned;
        if (withZero.startsWith('04')) {
            if (withZero.length <= 2) return withZero;
            if (withZero.length <= 4) return `${withZero.slice(0, 2)}${withZero.slice(2)}`;
            if (withZero.length <= 7) return `${withZero.slice(0, 4)} ${withZero.slice(4)}`;
            return `${withZero.slice(0, 4)} ${withZero.slice(4, 7)} ${withZero.slice(7, 10)}`;
        }

        if (withZero.length <= 3) return withZero;
        if (withZero.length <= 6) return `${withZero.slice(0, 3)} ${withZero.slice(3)}`;
        return `${withZero.slice(0, 3)} ${withZero.slice(3, 6)} ${withZero.slice(6, 10)}`;
    };

    const handleNumberPress = (num: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length < 10) {
            const newPhone = cleaned + num;
            setPhone(formatPhoneNumber(newPhone));
        }
    };

    const handleDelete = () => {
        const cleaned = phone.replace(/\D/g, '');
        const newPhone = cleaned.slice(0, -1);
        setPhone(formatPhoneNumber(newPhone));
    };

    const resetRegisterFlow = () => {
        setRegisterModalVisible(false);
        setRegisterStep('form');
        setRegisterPhoneNumber('');
        setRegisterName('');
        setRegisterLastName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setOtpCode('');
        setRegisterGuidId('');
        setRegisterLoading(false);
    };

    const openRegisterFlow = (phoneNumberClean: string) => {
        setRegisterPhoneNumber(phoneNumberClean);
        setRegisterStep('form');
        setOtpCode('');
        setRegisterGuidId('');
        setRegisterModalVisible(true);
    };

    const validatePassword = (password: string): boolean => {
        if (!password || password.length <= 8) return false;

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
    };

    const validateRegisterForm = (): boolean => {
        const name = registerName.trim();
        const lastName = registerLastName.trim();
        const email = registerEmail.trim();
        const password = registerPassword;
        const phoneNumberClean = registerPhoneNumber.replace(/\D/g, '');

        if (!name) {
            alertService.showAlert({
                title: t('checkin.missingInfoTitle'),
                message: t('checkin.missingFullNameMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
        if (!lastName) {
            alertService.showAlert({
                title: t('checkin.missingInfoTitle'),
                message: t('checkin.missingLastNameMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
        if (phoneNumberClean.length !== 10) {
            alertService.showAlert({
                title: t('checkin.missingInfoTitle'),
                message: t('checkin.invalidPhoneMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
        if (!email || !email.includes('@') || !email.includes('.')) {
            alertService.showAlert({
                title: t('checkin.missingInfoTitle'),
                message: t('checkin.invalidEmailMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
        if (!validatePassword(password)) {
            alertService.showAlert({
                title: t('checkin.missingInfoTitle'),
                message: t('checkin.invalidPasswordMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
        return true;
    };

    const handleCreateOTP = async () => {
        if (!validateRegisterForm()) return;

        try {
            setRegisterLoading(true);

            const payload = {
                id: 0,
                name: registerName.trim(),
                lastName: registerLastName.trim(),
                phoneNumber: registerPhoneNumber.replace(/\D/g, ''),
                email: registerEmail.trim(),
                dateOfBirth: 0,
                monthOfBirth: 0,
                yearOfBirth: 0,
                gender: 0,
                password: registerPassword,
                description: '',
                isClause: true,
                avatarUrl: '',
                otpCode: '',
                guidId: '',
            };

            const res = await createOTPApi(payload);

            const rawData = (res as any)?.data;
            let parsedData: any = rawData;
            if (typeof rawData === 'string') {
                try {
                    parsedData = JSON.parse(rawData);
                } catch {
                    parsedData = null;
                }
            }

            const createdId =
                parsedData?.id ??
                (res as any)?.id ??
                0;

            if (!createdId) {
                alertService.showAlert({
                    title: t('checkin.createAccountErrorTitle'),
                    message: t('checkin.createAccountNoOtpMessage'),
                    typeAlert: 'Error',
                    onConfirm: () => {},
                });
                return;
            }

            setRegisterGuidId(String(createdId));
            setOtpCode('');
            setRegisterStep('otp');
        } catch (error: any) {
            alertService.showAlert({
                title: t('checkin.createAccountErrorTitle'),
                message: error?.message ?? t('checkin.tryAgainMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleConfirmOtp = async () => {
        const otp = otpCode.replace(/\D/g, '').slice(0, 6);
        if (otp.length !== 6) {
            alertService.showAlert({
                title: t('checkin.invalidOtpTitle'),
                message: t('checkin.invalidOtpMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return;
        }
        try {
            setRegisterLoading(true);

            const createdId = Number(registerGuidId) || 0;

            const payload = {
                id: createdId,
                name: registerName.trim(),
                lastName: registerLastName.trim(),
                phoneNumber: registerPhoneNumber.replace(/\D/g, ''),
                email: registerEmail.trim(),
                dateOfBirth: 0,
                monthOfBirth: 0,
                yearOfBirth: 0,
                gender: 0,
                password: registerPassword,
                description: '',
                isClause: true,
                avatarUrl: '',
                otpCode: otp,
                guidId: registerGuidId,
            };

            const phoneNumberClean = registerPhoneNumber.replace(/\D/g, '');
            const tenantId = userInfo?.tenantId ?? 0;
            await createAccountApi(payload);

            resetRegisterFlow();

            const checkinResponse = await postCheckinApi({
                phoneNumber: phoneNumberClean,
                tenantId,
            });

            const { code: checkinCode, point, vouchers } = extractCheckinResult(checkinResponse);
            if (checkinCode === '-1001') {
                alertService.showAlert({
                    title: t('checkin.cannotCheckinTitle'),
                    message: t('checkin.cannotCheckinMessage'),
                    typeAlert: 'Error',
                    onConfirm: () => {},
                    onCancel: () => {setPhone('');},
                });
                return;
            }

            openCheckinSuccessModal(point, vouchers);
        } catch (error: any) {
            alertService.showAlert({
                title: t('checkin.otpErrorTitle'),
                message: error?.message ?? t('checkin.tryAgainMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleCheckin = async () => {
        if (phone.replace(/\D/g, '').length === 10) {
            try {
                setLoading(true);
                const phoneNumberClean = phone.replace(/\D/g, '');
                const data = {
                    phoneNumber: phoneNumberClean,
                    tenantId: userInfo?.tenantId ?? 0,
                };
                const response = await postCheckinApi(data);

                const { code, point, vouchers } = extractCheckinResult(response);
                if (code === '-1001') {
                    alertService.showAlert({
                        title: t('checkin.notCreatedAccountTitle'),
                        message: t('checkin.notCreatedAccountMessage'),
                        typeAlert: 'Warning',
                        okText: t('checkin.createAccountOkText'),
                        cancelText: t('checkin.createAccountCancelText'),
                        onConfirm: () => openRegisterFlow(phoneNumberClean),
                        // onCancel: () => {setPhone('');},
                    });
                    return;
                }

                openCheckinSuccessModal(point, vouchers);
                // setPhone('');
            } catch (error: any) {
                alertService.showAlert({
                    title: t('checkin.errorTitle'),
                    message: error.message,
                    typeAlert: 'Error',
                    onConfirm: () => {},
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const canProceed = phone.replace(/\D/g, '').length === 10 && consentChecked;

    const getPhonePlaceholder = (): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('04') || cleaned.startsWith('4')) {
            return '04XX XXX XXX';
        }
        return '0XXX XXX XXX';
    };

    const handleLogout = async () => {
        const savedUsername = userInfo?.username;

        dispatch(clearAuthState());
        clearAuth();

        // try {
        //     let usernameToSave = savedUsername;

        //     if (!usernameToSave) {
        //         const credentials = await Keychain.getGenericPassword();
        //         if (credentials && typeof credentials === 'object' && 'username' in credentials) {
        //             usernameToSave = credentials.username;
        //         }
        //     }

        //     await Keychain.resetGenericPassword();

        //     if (usernameToSave) {
        //         await Keychain.setGenericPassword(usernameToSave, '');
        //     }
        // } catch (error) {
        //     await Keychain.resetGenericPassword();
        // }

        navigation.reset({
            index: 0,
            routes: [{ name: Paths.Login }],
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBarComponent backgroundColor={colors.yellow} />

            <View style={styles.topSection}>
                <View style={styles.topChevronContainer}>
                    {/* <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={20} color={colors.text} />
                    </TouchableOpacity> */}
                </View>
                <View style={styles.topRightIcons}>
                    {/* <TouchableOpacity style={styles.topIconButton}>
                        <Printer size={20} color={colors.text} />
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.topIconButton} onPress={handleLogout}>
                        <LogIn size={20} color={colors.yellow} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <TextFieldLabel style={styles.logoCheckin}>Nails Booking®</TextFieldLabel>
                    </View>
                </View>

                <View style={styles.instructionSection}>
                    <TextFieldLabel style={styles.instructionText}>
                        {t('checkin.pleaseEnterPhone')}
                    </TextFieldLabel>
                    <TextFieldLabel style={styles.instructionSubText}>
                        {t('checkin.yourInfoNotShared')}
                    </TextFieldLabel>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.contentRow}>
                        {/* {!isSmallScreen && (
                            <View style={styles.loyaltyContainer}>
                                <View style={styles.loyaltyScrollIndicator}>
                                    <ChevronUp size={16} color={colors.text} />
                                </View>
                                <LinearGradient
                                    colors={['#20B2AA', '#90EE90']}
                                    style={styles.loyaltyBox}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <TextFieldLabel style={styles.loyaltyPointText}>{t('checkin.point10') + ' ' + t('checkin.point')}</TextFieldLabel>
                                    <TextFieldLabel style={styles.loyaltySubText}>{t('checkin.pointsFor10Percent')}</TextFieldLabel>
                                </LinearGradient>
                                <LinearGradient
                                    colors={['#FF8C00', '#FFD700']}
                                    style={styles.loyaltyBox}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <TextFieldLabel style={styles.loyaltyPointText}>{t('checkin.point15') + ' ' + t('checkin.point')}</TextFieldLabel>
                                    <TextFieldLabel style={styles.loyaltySubText}>{t('checkin.pointsFor15Dollar')}</TextFieldLabel>
                                </LinearGradient>
                                <View style={styles.loyaltyScrollIndicator}>
                                    <ChevronDown size={16} color={colors.text} />
                                </View>
                            </View>
                        )} */}

                        <View style={styles.phoneKeypadContainer}>
                            <View style={styles.phoneDisplayContainer}>
                                <TextFieldLabel style={styles.phoneDisplay}>
                                    {phone || getPhonePlaceholder()}
                                </TextFieldLabel>
                            </View>

                            <View style={styles.keypadContainer}>
                                <View style={styles.keypadRow}>
                                    {[1, 2, 3].map(num => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.keypadButton}
                                            onPress={() => handleNumberPress(num.toString())}
                                        >
                                            <TextFieldLabel style={styles.keypadText}>{num}</TextFieldLabel>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.keypadRow}>
                                    {[4, 5, 6].map(num => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.keypadButton}
                                            onPress={() => handleNumberPress(num.toString())}
                                        >
                                            <TextFieldLabel style={styles.keypadText}>{num}</TextFieldLabel>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.keypadRow}>
                                    {[7, 8, 9].map(num => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.keypadButton}
                                            onPress={() => handleNumberPress(num.toString())}
                                        >
                                            <TextFieldLabel style={styles.keypadText}>{num}</TextFieldLabel>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.keypadRow}>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={handleDelete}
                                    >
                                        <TextFieldLabel style={styles.deleteText}>{t('checkin.delete')}</TextFieldLabel>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.keypadButton}
                                        onPress={() => handleNumberPress('0')}
                                    >
                                        <TextFieldLabel style={styles.keypadText}>0</TextFieldLabel>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
                                        onPress={handleCheckin}
                                        disabled={!canProceed}
                                    >
                                        <TextFieldLabel style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
                                            {t('checkin.checkinButton')}
                                        </TextFieldLabel>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerTop}>
                        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                consentChecked && styles.checkboxActive
                            ]}
                            onPress={() => setConsentChecked(!consentChecked)}
                            activeOpacity={0.7}
                        >
                            {consentChecked && (
                                <View style={styles.checkboxChecked}>
                                    <Check size={14} color={colors.text} strokeWidth={3} />
                                </View>
                            )}
                        </TouchableOpacity>
                        <TextFieldLabel style={styles.consentText}>
                            {t('checkin.consentText')}
                        </TextFieldLabel>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={registerModalVisible}
                transparent
                animationType="slide"
                onRequestClose={resetRegisterFlow}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalKeyboardAvoiding}
                >
                    <TouchableWithoutFeedback onPress={resetRegisterFlow}>
                        <View style={styles.modalBackdrop} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalSheetContainer}>
                        <View style={styles.modalSheet}>
                            <View style={styles.modalHeader}>
                                <TextFieldLabel style={styles.modalTitle}>
                                    {registerStep === 'form'
                                        ? t('checkin.registerModalTitle')
                                        : t('checkin.otpModalTitle')}
                                </TextFieldLabel>
                                <TouchableOpacity
                                    onPress={resetRegisterFlow}
                                    style={styles.modalCloseButton}
                                >
                                    <TextFieldLabel style={styles.modalCloseText}>X</TextFieldLabel>
                                </TouchableOpacity>
                            </View>

                            {registerStep === 'form' ? (
                                <ScrollView
                                    style={styles.modalScroll}
                                    contentContainerStyle={styles.modalScrollContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.modalBody}>
                                        <TextField
                                            label={t('checkin.lastNameLabel')}
                                            placeholder={t('checkin.lastNamePlaceholder')}
                                            value={registerLastName}
                                            onChangeText={setRegisterLastName}
                                        />
                                        <TextField
                                            label={t('checkin.firstNameLabel')}
                                            placeholder={t('checkin.firstNamePlaceholder')}
                                            value={registerName}
                                            onChangeText={setRegisterName}
                                        />
                                        <TextField
                                            label={t('checkin.phoneLabel')}
                                            value={registerPhoneNumber}
                                            keyboardType="phone-pad"
                                            status="disabled"
                                        />
                                        <TextField
                                            label={t('checkin.emailLabel')}
                                            placeholder={t('checkin.emailPlaceholder')}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            value={registerEmail}
                                            onChangeText={setRegisterEmail}
                                        />
                                    <TextField
                                        label={t('checkin.passwordLabel')}
                                        placeholder={t('checkin.passwordPlaceholder')}
                                        secureTextEntry={!showRegisterPassword}
                                        autoCapitalize="none"
                                        value={registerPassword}
                                        onChangeText={setRegisterPassword}
                                        RightAccessory={({
                                            style,
                                            editable,
                                        }: TextFieldAccessoryProps) => (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                style={style}
                                                disabled={!editable}
                                                onPress={() => setShowRegisterPassword((prev) => !prev)}
                                            >
                                                {showRegisterPassword ? (
                                                    <EyeOff
                                                        size={18}
                                                        color={editable ? colors.text : colors.placeholderTextColor}
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={18}
                                                        color={editable ? colors.text : colors.placeholderTextColor}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    />

                                        <View style={styles.modalFooter}>
                                            <Button
                                                preset="filled"
                                                text={t('checkin.confirmButtonText')}
                                                disabled={registerLoading}
                                                style={styles.confirmButton}
                                                textStyle={styles.confirmButtonText}
                                                pressedStyle={styles.confirmButtonPressed}
                                                disabledStyle={styles.confirmButtonDisabled}
                                                disabledTextStyle={styles.confirmButtonDisabledText}
                                                onPress={handleCreateOTP}
                                            />
                                        </View>
                                    </View>
                                </ScrollView>
                            ) : (
                                <View style={styles.modalBody}>
                                    <TextFieldLabel style={styles.otpInfoText}>
                                        {t('checkin.otpSentInfo', { phone: registerPhoneNumber })}
                                    </TextFieldLabel>

                                    <TextField
                                        label={t('checkin.otpLabel')}
                                        placeholder={t('checkin.otpPlaceholder')}
                                        keyboardType="number-pad"
                                        value={otpCode}
                                        onChangeText={(text) =>
                                            setOtpCode(text.replace(/\D/g, '').slice(0, 6))
                                        }
                                        maxLength={6}
                                    />

                                        <View style={styles.modalFooter}>
                                        <Button
                                            preset="filled"
                                            text={t('checkin.confirmButtonText')}
                                            disabled={registerLoading || otpCode.replace(/\D/g, '').length !== 6}
                                            style={styles.confirmButton}
                                            textStyle={styles.confirmButtonText}
                                            pressedStyle={styles.confirmButtonPressed}
                                            disabledStyle={styles.confirmButtonDisabled}
                                            disabledTextStyle={styles.confirmButtonDisabledText}
                                            onPress={handleConfirmOtp}
                                        />
                                        <View style={styles.modalFooterSecondary}>
                                            <Button
                                                preset="default"
                                                text={t('checkin.backButtonText')}
                                                disabled={registerLoading}
                                                onPress={() => {
                                                    setRegisterStep('form');
                                                    setOtpCode('');
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={checkinSuccessModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeCheckinSuccessModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalKeyboardAvoiding}
                >
                    <TouchableWithoutFeedback onPress={closeCheckinSuccessModal}>
                        <View style={styles.modalBackdrop} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalSheetContainer} pointerEvents="box-none">
                        <View style={styles.checkinSuccessSheet}>
                            <View style={styles.modalHeader}>
                                <TextFieldLabel style={styles.modalTitle}>
                                    {t('checkin.successTitle')}
                                </TextFieldLabel>
                                <TouchableOpacity
                                    onPress={closeCheckinSuccessModal}
                                    style={styles.modalCloseButton}
                                >
                                    <TextFieldLabel style={styles.modalCloseText}>X</TextFieldLabel>
                                </TouchableOpacity>
                            </View>

                            <TextFieldLabel style={styles.checkinSuccessSummaryText}>
                                {t('checkin.successMessage')}
                            </TextFieldLabel>
                            <TextFieldLabel style={styles.checkinSuccessSummaryText}>
                                {t('checkin.currentPointLabel', { point: checkinSuccessPoint })}
                            </TextFieldLabel>

                            {checkinSuccessVouchers.length > 0 ? (
                                <>
                                    <TextFieldLabel style={styles.checkinSuccessSectionTitle}>
                                        {t('checkin.voucherListLabel')}
                                    </TextFieldLabel>
                                    <ScrollView
                                        style={styles.checkinSuccessVoucherScroll}
                                        contentContainerStyle={styles.checkinSuccessVoucherScrollContent}
                                        nestedScrollEnabled
                                        showsVerticalScrollIndicator
                                    >
                                        {checkinSuccessVouchers.map((v, index) => (
                                            <View
                                                key={`checkin-voucher-${index}-${v.name}`}
                                                style={styles.checkinSuccessVoucherRow}
                                            >
                                                <TextFieldLabel style={styles.checkinSuccessVoucherName}>
                                                    {v.name || t('checkin.voucherUnknownName')}
                                                </TextFieldLabel>
                                                {v.description ? (
                                                    <TextFieldLabel style={styles.checkinSuccessVoucherDesc}>
                                                        {v.description}
                                                    </TextFieldLabel>
                                                ) : null}
                                            </View>
                                        ))}
                                    </ScrollView>
                                </>
                            ) : null}

                            <View style={styles.modalFooter}>
                                <Button
                                    preset="filled"
                                    text={t('checkin.confirmButtonText')}
                                    style={styles.confirmButton}
                                    textStyle={styles.confirmButtonText}
                                    pressedStyle={styles.confirmButtonPressed}
                                    onPress={closeCheckinSuccessModal}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Loader loading={loading || registerLoading} title={t('loading.processing')} />
        </SafeAreaView>
    );
};

const $styles = (colors: Colors, isTablet: boolean, screenWidth: number, isSmallScreen: boolean) => {
    const basePadding = isTablet ? 32 : isSmallScreen ? 12 : 16;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        topSection: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: basePadding,
            paddingTop: 10,
            paddingBottom: 10,
        },
        topChevronContainer: {
            alignItems: 'flex-start',
        },
        topRightIcons: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
        },
        topIconButton: {
            padding: 4,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 40,
        },
        logoSection: {
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 10,
        },
        logoContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        logoO: {
            fontSize: isTablet ? 28 : 24,
            fontWeight: 'bold',
            color: colors.yellow,
        },
        logoCheckin: {
            fontSize: isTablet ? 24 : 20,
            fontWeight: 'bold',
            color: colors.text,
            marginLeft: 4,
        },
        instructionSection: {
            alignItems: 'center',
            paddingHorizontal: basePadding,
            paddingTop: 10,
            paddingBottom: 20,
        },
        instructionText: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: 0.5,
        },
        instructionSubText: {
            fontSize: isTablet ? 14 : 12,
            color: colors.text,
            textAlign: 'center',
            opacity: 0.8,
        },
        mainContent: {
            paddingHorizontal: basePadding,
            paddingTop: 10,
            width: '100%',
        },
        contentRow: {
            flexDirection: isSmallScreen ? 'column' : 'row',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isTablet ? 24 : isSmallScreen ? 20 : 16,
        },
        loyaltyContainer: {
            flex: 0,
            width: isTablet ? 300 : isSmallScreen ? '100%' : 150,
            alignItems: 'center',
            marginBottom: isSmallScreen ? 10 : 0,
        },
        phoneKeypadContainer: {
            flex: isSmallScreen ? 0 : 1,
            width: isSmallScreen ? '100%' : 'auto',
            alignItems: 'center',
            maxWidth: isTablet ? 400 : isSmallScreen ? '100%' : 300,
        },
        phoneDisplayContainer: {
            width: '100%',
            marginBottom: 20,
        },
        phoneDisplay: {
            fontSize: isTablet ? 30 : isSmallScreen ? 22 : 26,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
            letterSpacing: isSmallScreen ? 1 : 1.5,
        },
        loyaltyScrollIndicator: {
            marginVertical: 2,
        },
        scrollIndicator: {
            fontSize: 14,
            color: colors.text,
            textAlign: 'center',
        },
        loyaltyBox: {
            width: '100%',
            padding: isTablet ? 24 : isSmallScreen ? 16 : 20,
            borderRadius: 10,
            marginVertical: isSmallScreen ? 4 : 6,
            alignItems: 'center',
            minHeight: isTablet ? 120 : isSmallScreen ? 80 : 100,
            justifyContent: 'center',
        },
        loyaltyPointText: {
            fontSize: isTablet ? 32 : isSmallScreen ? 24 : 28,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        loyaltySubText: {
            fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
            color: colors.text,
            opacity: 0.9,
        },
        keypadContainer: {
            width: '100%',
            marginTop: 10,
        },
        keypadRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: isSmallScreen ? 10 : 12,
            paddingHorizontal: isTablet ? 40 : isSmallScreen ? 10 : 20,
        },
        keypadButton: {
            width: isSmallScreen ? 55 : 65,
            height: isSmallScreen ? 55 : 65,
            borderRadius: isSmallScreen ? 27.5 : 32.5,
            borderWidth: 1,
            borderColor: colors.text,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
        },
        keypadText: {
            fontSize: 22,
            fontWeight: '600',
            color: colors.text,
        },
        deleteButton: {
            width: isSmallScreen ? 55 : 65,
            height: isSmallScreen ? 55 : 65,
            justifyContent: 'center',
            alignItems: 'center',
        },
        deleteText: {
            fontSize: isSmallScreen ? 12 : 14,
            fontWeight: '600',
            color: colors.text,
        },
        nextButton: {
            width: isSmallScreen ? 55 : 65,
            height: isSmallScreen ? 55 : 65,
            borderRadius: isSmallScreen ? 27.5 : 32.5,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        nextButtonDisabled: {
            backgroundColor: colors.border,
            opacity: 0.5,
        },
        nextButtonText: {
            fontSize: isSmallScreen ? 12 : 14,
            fontWeight: 'bold',
            color: colors.text,
        },
        nextButtonTextDisabled: {
            color: colors.white,
        },
        footer: {
            paddingHorizontal: basePadding,
            paddingTop: 40,
            paddingBottom: 20,
            alignItems: 'flex-start',
        },
        footerTop: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16,
            width: '100%',
        },
        infoIconContainer: {
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1.5,
            borderColor: colors.text,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
            marginTop: 2,
        },
        infoText: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.text,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: colors.text,
            borderRadius: 4,
            marginRight: 12,
            marginTop: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        },
        checkboxActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primary,
        },
        checkboxChecked: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        consentText: {
            flex: 1,
            fontSize: isSmallScreen ? 12 : 14,
            color: colors.text,
            lineHeight: 20,
            gap: 10,
        },
        // Modal styles
        modalKeyboardAvoiding: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        modalBackdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        modalSheetContainer: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: basePadding,
            paddingBottom: isSmallScreen ? 6 : 12,
        },
        modalSheet: {
            backgroundColor: colors.background,
            paddingTop: 16,
            paddingBottom: 20,
            paddingHorizontal: basePadding,
            borderRadius: 20,
            width: '100%',
            height: isSmallScreen ? '88%' : '92%',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 8,
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
        },
        modalCloseButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalCloseText: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.text,
        },
        modalBody: {
            gap: 12,
        },
        modalScroll: {
            flex: 1,
        },
        modalScrollContent: {
            paddingBottom: 8,
            flexGrow: 1,
        },
        otpInfoText: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.9,
            lineHeight: 18,
            marginBottom: 2,
        },
        modalFooter: {
            marginTop: 12,
            gap: 10,
        },
        confirmButton: {
            width: '100%',
            backgroundColor: colors.primary,
            borderRadius: 16,
            minHeight: 60,
            paddingHorizontal: isSmallScreen ? 14 : 18,
            paddingVertical: isSmallScreen ? 14 : 16,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
        },
        confirmButtonText: {
            color: colors.white,
            fontSize: isSmallScreen ? 15 : 16,
            lineHeight: 20,
        },
        confirmButtonPressed: {
            opacity: 0.9,
        },
        confirmButtonDisabled: {
            backgroundColor: colors.backgroundDisabled,
            shadowOpacity: 0,
            elevation: 0,
        },
        confirmButtonDisabledText: {
            color: colors.placeholderTextColor,
            opacity: 0.9,
        },
        modalFooterSecondary: {
            marginTop: 6,
        },
        checkinSuccessSheet: {
            backgroundColor: colors.background,
            paddingTop: 16,
            paddingBottom: 20,
            paddingHorizontal: basePadding,
            borderRadius: 20,
            width: '100%',
            maxHeight: isSmallScreen ? '85%' : '80%',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 8,
            overflow: 'hidden',
        },
        checkinSuccessSummaryText: {
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
            marginBottom: 4,
            alignSelf: 'stretch',
            textAlign: 'left',
        },
        checkinSuccessSectionTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
            marginTop: 12,
            marginBottom: 6,
            alignSelf: 'stretch',
            textAlign: 'left',
        },
        checkinSuccessVoucherScroll: {
            maxHeight: isSmallScreen ? 260 : 340,
        },
        checkinSuccessVoucherScrollContent: {
            paddingBottom: 8,
        },
        checkinSuccessVoucherRow: {
            paddingVertical: 10,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        checkinSuccessVoucherName: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'left',
        },
        checkinSuccessVoucherDesc: {
            fontSize: 13,
            color: colors.text,
            opacity: 0.85,
            marginTop: 4,
            lineHeight: 18,
            textAlign: 'left',
        },
    });
};

export default CheckinScreen;
