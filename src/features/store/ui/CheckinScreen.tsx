import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { StyleSheet, Dimensions, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { TextFieldLabel } from '@/shared/ui/Text';
import Loader from '@/shared/ui/Loader';
import { ChevronUp, ChevronDown, Printer, Settings, Check, ChevronLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { postCheckinApi } from '../api/storeApi';
import { alertService } from '@/services/alertService';

const CheckinScreen = ({ navigation }: RootScreenProps<Paths.Checkin>) => {
    const { theme: { colors } } = useAppTheme();
    const isTablet = useIsTablet();
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const isSmallScreen = screenWidth < 400;
    const styles = $styles(colors, isTablet, screenWidth, isSmallScreen);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [consentChecked, setConsentChecked] = useState(true);

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

    const handleCheckin = async () => {
        if (phone.replace(/\D/g, '').length === 10) {
            try {
                setLoading(true);
                const data = {
                    phoneNumber: phone.replace(/\D/g, ''),
                };
                const response = await postCheckinApi(data);
                console.log("response", response);
                if (response) {
                    alertService.showAlert({
                        title: t('checkin.successTitle'),
                        message: t('checkin.successMessage'),
                        typeAlert: 'Confirm',
                        onConfirm: () => {},
                    });
                }
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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBarComponent backgroundColor={colors.yellow} />

            <View style={styles.topSection}>
                <View style={styles.topChevronContainer}>
                    <TouchableOpacity style={styles.topIconButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.topRightIcons}>
                    {/* <TouchableOpacity style={styles.topIconButton}>
                        <Printer size={20} color={colors.text} />
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity style={styles.topIconButton}>
                        <Settings size={20} color={colors.text} />
                    </TouchableOpacity> */}
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
                        {!isSmallScreen && (
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
                        )}

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

            <Loader loading={loading} title={t('loading.processing')} />
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
        }
    });
};

export default CheckinScreen;
