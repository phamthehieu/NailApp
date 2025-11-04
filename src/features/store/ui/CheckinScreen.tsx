import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { ScrollView, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import MHeader from '@/shared/ui/MHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import LottieView from 'lottie-react-native';
import { Button } from '@/shared/ui/Button';
import Loader from '@/shared/ui/Loader';


const CheckinScreen = ({navigation}: RootScreenProps<Paths.Checkin>) => {
    const {theme: { colors }} = useAppTheme();
    const isTablet = useIsTablet();
    const { t } = useTranslation();
    const screenWidth = Dimensions.get('window').width;
    const styles = $styles(colors, isTablet, screenWidth);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const handleCheckin = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBarComponent backgroundColor={colors.yellow} />
            <MHeader
                label={t('checkin.checkin')}
                onBack={() => navigation.goBack()}
                showIconLeft={true}
                bgColor={colors.yellow}
            />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
            >

                <View style={styles.contentWrapper}>
                    <LottieView
                            source={require('@assets/animations/checking_booking.json')}
                            autoPlay
                            loop
                            style={styles.checkinAnimation}
                        />
                    <Text style={styles.centerText}>{t('checkin.sologanhapsoDT')}</Text>
                </View>

                <View style={styles.phoneContainer}>

                    <TextField
                        placeholder={t('checkin.nhapsoDT')}
                        value={phone}
                        onChangeText={setPhone}
                        inputWrapperStyle={styles.phoneInput}
                        keyboardType="numeric"
                        maxLength={10}
                        returnKeyType="done"
                        onSubmitEditing={handleCheckin}
                        autoCapitalize="none"
                        autoComplete="tel"
                    />

                </View>

                <Button
                    text={t('checkin.confirmButton')}
                    onPress={handleCheckin}
                    style={styles.buttonCheckin}
                    textStyle={styles.buttonCheckinText}
                />

            </KeyboardAvoidingView>

            <Loader loading={loading} title={t('loading.processing')} />

        </SafeAreaView >
    );
};
const $styles = (colors: Colors, isTablet: boolean, screenWidth: number) => {
    const basePadding = isTablet ? 32 : 10;
    const contentMaxWidth = isTablet ? 600 : undefined;
    const animationWidth = isTablet ? Math.min(screenWidth * 0.4, 400) : 272;
    const animationHeight = isTablet ? (animationWidth * 200) / 272 : 200;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        contentContainer: {
            padding: basePadding,
            paddingBottom: basePadding + 300,
            flexGrow: 1,
            marginTop: isTablet ? 40 : 20,
            alignItems: isTablet ? 'center' : 'flex-start',
        },
        contentWrapper: {
            width: '100%',
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
        },
        centerText: {
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        phoneContainer: {
            marginTop: 20,
            width: '100%',
            paddingHorizontal: 16,
            alignSelf: 'center',
        },
        phoneInput: {
            marginBottom: 16,
            fontSize: 14,
            borderColor: colors.border,
            borderRadius: 12,
            borderWidth: 1,
            paddingVertical: 8,
            paddingLeft: 10,
            paddingRight: 20,
        },
        checkinAnimation: {
            width: animationWidth,
            height: animationHeight,
            alignSelf: 'center',
            marginBottom: 20,
        },
        buttonCheckin: {
            marginTop: 20,
            paddingHorizontal: 24,
            alignSelf: 'center',
            backgroundColor: colors.yellow,
            borderRadius: 12,
            marginBottom: 40,
            borderColor: colors.yellow,
        },
        buttonCheckinText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.background,
        },
    });
};

export default CheckinScreen;
