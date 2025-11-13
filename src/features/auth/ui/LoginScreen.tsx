import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { TextFieldLabel } from '@/shared/ui/Text';
import { ScrollView, View, Dimensions, KeyboardAvoidingView, Platform, Keyboard, Animated, PanResponder, PanResponderInstance, findNodeHandle, Pressable } from 'react-native';
import { LayoutAnimation, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutoImage } from '@/shared/ui/AutoImage';
import LottieView from 'lottie-react-native';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { TextField, TextFieldAccessoryProps } from '@/shared/ui/TextField';
import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, MapPinCheck } from 'lucide-react-native';
import { Button } from '@/shared/ui/Button';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { useLanguage } from '@/shared/lib/useLanguage';
import { $styles } from './styles';
import Loader from '@/shared/ui/Loader';

const LoginScreen = ({ navigation }: RootScreenProps<Paths.Login>) => {
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage, getLanguageName } = useLanguage();
    const {
        theme: { colors },
    } = useAppTheme();
    const isTablet = useIsTablet();
    const screenWidth = Dimensions.get('window').width;
    const styles = $styles(colors, isTablet, screenWidth);
    const [loading, setLoading] = useState(false);

    const {
        username,
        password,
        isPasswordVisible,
        errors,
        setUsername,
        setPassword,
        togglePasswordVisible,
        setErrors,
        validate,
        login,
    } = useAuthForm({
        usernameRequired: t('login.usernameRequired'),
        passwordRequired: t('login.passwordRequired'),
        passwordMin: t('login.passwordMin'),
    });
    const panY = useRef(new Animated.Value(0)).current;
    const dragOffsetY = useRef(0);
    const screenHeight = Dimensions.get('window').height;
    const minY = 20;
    const maxY = screenHeight - 100;
    const panResponder = useRef<PanResponderInstance>(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
            onPanResponderGrant: () => {
                panY.stopAnimation((value) => {
                    dragOffsetY.current = value as number;
                });
            },
            onPanResponderMove: (_, gesture) => {
                const next = Math.max(minY, Math.min(maxY, dragOffsetY.current + gesture.dy));
                panY.setValue(next);
            },
            onPanResponderRelease: () => {
                panY.flattenOffset?.();
            },
        })
    ).current;
    const passwordInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const isAndroid = Platform.OS === 'android';
        const isFabricEnabled = Boolean((globalThis as any)?.nativeFabricUIManager);

        if (isAndroid && !isFabricEnabled && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const animateEase = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const PasswordRightAccessory = useMemo(() => {
        return ({ style, editable }: TextFieldAccessoryProps) => (
            <TouchableOpacity
                style={style}
                onPress={() => {
                    animateEase();
                    togglePasswordVisible();
                }}
                activeOpacity={0.7}
                disabled={!editable}
            >
                {isPasswordVisible ? (
                    <EyeOff size={20} color={colors.yellow} />
                ) : (
                    <Eye size={20} color={colors.yellow} />
                )}
            </TouchableOpacity>
        );
    }, [isPasswordVisible, colors.yellow]);

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                animateEase();
                scrollToTop();
            }
        );

        return () => {
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleLogin = useCallback(async () => {
        setLoading(true);
        animateEase();
        const ok = await login();
        if (!ok) {
            setLoading(false);
            return;
        } else {
            navigation.navigate(Paths.ChooseShop);
        }
        setLoading(false);
    }, [login]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBarComponent />
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

                    <View style={styles.contentWrapper}>

                        <View
                            style={styles.headerContainer}>

                            <View
                                style={styles.headerTitle}>

                                <TextFieldLabel
                                    text="NailApp"
                                    style={styles.headerTitleText}
                                />

                                <AutoImage source={require('@assets/images/logo.png')} style={styles.headerTitleIcon} />
                            </View>

                            <Pressable style={styles.headerFlagContainer} onPress={() => {
                                const nextLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
                                changeLanguage(nextLanguage);
                            }}>
                                <TextFieldLabel text={getLanguageName(currentLanguage === 'vi' ? 'en' : 'vi')} style={styles.headerFlagText} />
                                <AutoImage
                                    source={currentLanguage === 'vi'
                                        ? require('@assets/images/english.png')
                                        : require('@assets/images/vietnam.png')}
                                    style={styles.headerFlagImage}
                                    resizeMode="cover"
                                />
                            </Pressable>

                        </View>

                        <TextFieldLabel
                            style={styles.loginText}>
                            {t('login.hello')}
                        </TextFieldLabel>

                        <View
                            style={styles.loginContainer}>
                            <LottieView
                                source={require('@assets/animations/Login.json')}
                                autoPlay
                                loop
                                style={styles.loginAnimation}
                            />
                        </View>

                        <View style={styles.loginFormContainer}>

                            <TextField
                                label={t('login.username')}
                                keyboardType='numeric'
                                placeholder={t('login.usernamePlaceholder')}
                                value={username}
                                onChangeText={(text) => {
                                    setUsername(text);
                                    if (errors.username) {
                                        animateEase();
                                        setErrors((prev) => ({ ...prev, username: undefined }));
                                    }
                                }}
                                inputWrapperStyle={styles.loginFormInput}
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    passwordInputRef.current?.focus();
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollToEnd({ animated: true });
                                    }, 100);
                                }}
                                onBlur={() => {
                                    if (!username.trim()) {
                                        animateEase();
                                        setErrors((prev) => ({ ...prev, username: t('login.usernameRequired') }));
                                    }
                                }}
                                status={errors.username ? 'error' : undefined}
                                helper={errors.username}
                            />

                            <TextField
                                ref={passwordInputRef}
                                label={t('login.password')}
                                placeholder={t('login.passwordPlaceholder')}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) {
                                        animateEase();
                                        setErrors((prev) => ({ ...prev, password: undefined }));
                                    }
                                }}
                                inputWrapperStyle={styles.loginFormInput}
                                returnKeyType="done"
                                secureTextEntry={!isPasswordVisible}
                                RightAccessory={PasswordRightAccessory}
                                onFocus={() => {
                                    const eventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
                                    let removed = false;
                                    const doScroll = () => {
                                        if (removed) return;
                                        const node = findNodeHandle(passwordInputRef.current);
                                        const responder = scrollViewRef.current?.getScrollResponder?.();
                                        if (node && responder?.scrollResponderScrollNativeHandleToKeyboard) {
                                            responder.scrollResponderScrollNativeHandleToKeyboard(node, 32, true);
                                        }
                                        removed = true;
                                    };
                                    const sub = Keyboard.addListener(eventName, () => {
                                        requestAnimationFrame(doScroll);
                                        sub.remove();
                                    });
                                    const timer = setTimeout(() => {
                                        doScroll();
                                        try { sub.remove(); } catch { }
                                    }, 250);
                                }}
                                onSubmitEditing={() => {
                                    passwordInputRef.current?.blur();
                                    setTimeout(() => {
                                        scrollToTop();
                                    }, 100);
                                }}
                                onBlur={() => {
                                    if (!password) {
                                        animateEase();
                                        setErrors((prev) => ({ ...prev, password: t('login.passwordRequired') }));
                                    } else if (password.length < 6) {
                                        animateEase();
                                        setErrors((prev) => ({ ...prev, password: t('login.passwordMin') }));
                                    }
                                }}
                                status={errors.password ? 'error' : undefined}
                                helper={errors.password}
                            />

                        </View>

                        <Button
                            text={t('login.loginButton')}
                            onPress={handleLogin}
                            style={styles.buttonLogin}
                            textStyle={styles.buttonLoginText}
                        />

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    console.log('Forgot password');
                                }}
                                activeOpacity={0.7}
                            >
                                <TextFieldLabel
                                    text={t('login.forgotPassword')}
                                    style={styles.forgotPasswordText}
                                />
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <Animated.View
                style={[
                    styles.edgeHandle,
                    { transform: [{ translateY: panY }] },
                ]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    style={styles.edgeHandlePress}
                    onPress={() => {
                        navigation.navigate(Paths.Checkin);
                    }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10, left: 0, right: 10 }}
                >
                    <MapPinCheck size={20} color={colors.black} />
                </TouchableOpacity>
            </Animated.View>

            <Loader loading={loading} title={t('loading.processing')} />

        </SafeAreaView >
    );
};

export default LoginScreen;
