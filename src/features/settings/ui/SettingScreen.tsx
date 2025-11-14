import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { TextFieldLabel } from '@/shared/ui/Text';
import {
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
    TouchableOpacity,
    Switch,
    Image,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '@/shared/ui/Loader';
import { ChevronRight, LogOut } from 'lucide-react-native';
import { useLanguage } from '@/shared/lib/useLanguage';
import { AutoImage } from '@/shared/ui/AutoImage';
import { RootState, store, useAppDispatch } from '@/app/store';
import { useSelector } from 'react-redux';
import { clearAuthState } from '@/features/auth/model/authSlice';
import { clearAuth } from '@/services/auth/authService';
import Keychain from 'react-native-keychain';

const SettingScreen = ({navigation}: RootScreenProps<Paths.Settings>) => {
    const { t } = useTranslation();
    const {
        theme: { colors },
        themeContext,
        setThemeContextOverride,
    } = useAppTheme();
    const {
        currentLanguage,
        changeLanguage,
        getLanguageName,
    } = useLanguage();
    const isTablet = useIsTablet();
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const styles = useMemo(() => $styles(colors, isTablet), [colors, isTablet]);
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const dispatch = useAppDispatch();
    const isDarkModeEnabled = themeContext === 'dark';

    const handleToggleTheme = useCallback(() => {
        setThemeContextOverride(isDarkModeEnabled ? 'light' : 'dark');
    }, [isDarkModeEnabled, setThemeContextOverride]);

    const handleSwitchChange = useCallback(
        (value: boolean) => {
            setThemeContextOverride(value ? 'dark' : 'light');
        },
        [setThemeContextOverride],
    );

    const handleToggleLanguage = useCallback(() => {
        const nextLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
        changeLanguage(nextLanguage);
    }, [changeLanguage, currentLanguage]);

    const handleEditProfile = () => {
        navigation.navigate(Paths.EditProfileUser);
    };

    const handleChangePassword = () => {
    };

    const handleAboutUs = () => {
    };

    const handlePrivacyPolicy = () => {
    };

    const handleLogout = async () => {
        const savedUsername = userInfo?.username;

        dispatch(clearAuthState());
        clearAuth();

        try {
            let usernameToSave = savedUsername;

            if (!usernameToSave) {
                const credentials = await Keychain.getGenericPassword();
                if (credentials && typeof credentials === 'object' && 'username' in credentials) {
                    usernameToSave = credentials.username;
                }
            }

            await Keychain.resetGenericPassword();

            if (usernameToSave) {
                await Keychain.setGenericPassword(usernameToSave, '');
            }
        } catch (error) {
            await Keychain.resetGenericPassword();
        }

        navigation.reset({
            index: 0,
            routes: [{ name: Paths.Login }],
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
             <StatusBarComponent backgroundColor={colors.yellow} />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                >

                    <View style={styles.hero}/>

                    <View style={styles.profileCard}>
                        <View style={styles.profileRow}>
                            <AutoImage
                                source={require('@assets/images/logo.png')}
                                style={styles.avatar}
                            />
                            <View style={styles.profileTextWrapper}>
                                <TextFieldLabel weight="bold" style={styles.profileName}>
                                    {userInfo?.displayName}
                                </TextFieldLabel>
                                <TextFieldLabel style={styles.profileSubTitle}>
                                    {userInfo?.roleObj?.name}
                                </TextFieldLabel>
                            </View>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <TextFieldLabel weight="medium" style={styles.sectionTitle}>
                            {t('settings.accountSettings')}
                        </TextFieldLabel>

                        <TouchableOpacity
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={handleEditProfile}
                        >
                            <TextFieldLabel style={styles.rowLabel}>{t('settings.editProfile')}</TextFieldLabel>
                            <ChevronRight size={isTablet ? 22 : 18} color={colors.placeholderTextColor} />
                        </TouchableOpacity>
                        <View style={styles.rowDivider} />

                        <TouchableOpacity
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={handleChangePassword}
                        >
                            <TextFieldLabel style={styles.rowLabel}>{t('settings.changePassword')}</TextFieldLabel>
                            <ChevronRight size={isTablet ? 22 : 18} color={colors.placeholderTextColor} />
                        </TouchableOpacity>
                        <View style={styles.rowDivider} />

                        <Pressable style={styles.row} onPress={handleToggleTheme}>
                            <TextFieldLabel style={styles.rowLabel}>
                                {t('settings.darkMode')}
                            </TextFieldLabel>
                            <Switch
                                value={isDarkModeEnabled}
                                onValueChange={handleSwitchChange}
                                trackColor={{ false: colors.backgroundDisabled, true: colors.yellow + '80' }}
                                thumbColor={colors.yellow}
                                ios_backgroundColor={colors.backgroundDisabled}
                            />
                        </Pressable>
                        <View style={styles.rowDivider} />
                        <Pressable style={styles.row} onPress={handleToggleLanguage}>
                            <TextFieldLabel style={styles.rowLabel}>
                                {t('settings.language')}
                            </TextFieldLabel>
                            <Pressable style={styles.languageToggle} onPress={handleToggleLanguage}>
                                <TextFieldLabel style={styles.languageLabel}>
                                    {getLanguageName(currentLanguage === 'vi' ? 'en' : 'vi')}
                                </TextFieldLabel>
                                <AutoImage
                                    source={currentLanguage === 'vi'
                                        ? require('@assets/images/english.png')
                                        : require('@assets/images/vietnam.png')}
                                    style={styles.languageFlag}
                                    resizeMode="cover"
                                />
                            </Pressable>
                        </Pressable>
                    </View>

                    <View style={styles.sectionCard}>
                        <TextFieldLabel weight="medium" style={styles.sectionTitle}>
                            {t('settings.more')}
                        </TextFieldLabel>

                        <TouchableOpacity
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={handleAboutUs}
                        >
                            <TextFieldLabel style={styles.rowLabel}>{t('settings.aboutUs')}</TextFieldLabel>
                            <ChevronRight size={isTablet ? 22 : 18} color={colors.placeholderTextColor} />
                        </TouchableOpacity>
                        <View style={styles.rowDivider} />

                        <TouchableOpacity
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={handlePrivacyPolicy}
                        >
                            <TextFieldLabel style={styles.rowLabel}>{t('settings.privacyPolicy')}</TextFieldLabel>
                            <ChevronRight size={isTablet ? 22 : 18} color={colors.placeholderTextColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.sectionCard, styles.logoutCard]}>
                        <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handleLogout}>
                            <TextFieldLabel style={styles.rowLabel}>
                                {t('settings.logOut')}
                            </TextFieldLabel>
                            <LogOut size={isTablet ? 22 : 18} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <Loader loading={loading} title={t('loading.processing')} />

        </SafeAreaView >
    );
};

const $styles = (colors: Colors, isTablet: boolean) => {
    const basePadding = isTablet ? 22 : 12;
    const heroHeight = isTablet ? 160 : 140;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        contentContainer: {
            paddingBottom: basePadding * 2,
            flexGrow: 1,
        },
        hero: {
            borderRadius: isTablet ? 28 : 24,
            marginHorizontal: basePadding,
            paddingHorizontal: basePadding,
            paddingVertical: isTablet ? 48 : 32,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: basePadding,
            minHeight: heroHeight,
        },
        heroTitle: {
            color: colors.white,
            fontSize: isTablet ? 30 : 24,
            marginLeft: isTablet ? 16 : 12,
        },
        profileCard: {
            backgroundColor: colors.card,
            borderRadius: isTablet ? 26 : 20,
            padding: isTablet ? 28 : 20,
            marginHorizontal: basePadding,
            marginTop: -heroHeight / 1.5,
            shadowColor: '#1F2937',
            shadowOpacity: 0.12,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 18,
            elevation: 10,
        },
        profileRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatar: {
            width: isTablet ? 80 : 56,
            height: isTablet ? 80 : 56,
            borderRadius: isTablet ? 40 : 28,
            borderWidth: 3,
            borderColor: colors.text,
        },
        profileTextWrapper: {
            marginLeft: isTablet ? 20 : 16,
        },
        profileName: {
            fontSize: isTablet ? 22 : 18,
            color: colors.text,
        },
        profileSubTitle: {
            marginTop: 4,
            color: colors.placeholderTextColor,
            fontSize: isTablet ? 16 : 14,
        },
        sectionCard: {
            backgroundColor: colors.card,
            borderRadius: isTablet ? 24 : 18,
            marginHorizontal: basePadding,
            marginTop: isTablet ? 28 : 24,
            paddingHorizontal: isTablet ? 20 : 16,
            paddingVertical: isTablet ? 18 : 14,
            shadowColor: '#1F2937',
            shadowOpacity: 0.12,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 18,
            elevation: 10,
        },
        sectionTitle: {
            fontSize: isTablet ? 16 : 14,
            color: colors.placeholderTextColor,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            marginBottom: isTablet ? 16 : 12,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: isTablet ? 18 : 14,
        },
        rowLabel: {
            fontSize: isTablet ? 18 : 16,
            color: colors.text,
        },
        rowDivider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: 'rgba(0,0,0,0.08)',
        },
        logoutCard: {
            paddingVertical: 0,
            backgroundColor: colors.red,
            borderRadius: isTablet ? 24 : 18,
            marginHorizontal: basePadding,
            marginTop: isTablet ? 28 : 24,
            paddingHorizontal: isTablet ? 20 : 16,
        },
        logoutLabel: {
            color: colors.white,
            fontWeight: '600',
        },
        languageToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: isTablet ? 16 : 12,
        },
        languageLabel: {
            fontSize: isTablet ? 16 : 14,
            color: colors.placeholderTextColor,
        },
        languageFlag: {
            width: isTablet ? 40 : 32,
            height: isTablet ? 40 : 32,
            borderRadius: isTablet ? 20 : 16,
            overflow: 'hidden',
        },
    });
};

export default SettingScreen;
