import { Paths } from '@app/navigation/paths';
import { RootScreenProps } from '@app/navigation/types';
import { useAppTheme } from '@shared/theme';
import ENV from '@/shared/config/env';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { AutoImage } from '@/shared/ui/AutoImage';
import { TextFieldLabel } from '@/shared/ui/Text';
import i18n from 'i18next';

const SplashScreen = ({navigation}: RootScreenProps<Paths.Splash>) => {
    const { theme } = useAppTheme();
    const { colors } = theme;

    const versionText = true
        ? `${ENV.APP_VERSION} (${ENV.BUILD_NUMBER})`
        : ENV.APP_VERSION;

    useEffect(() => {
        setTimeout(() => {
            navigation.replace(Paths.Login);
        }, 2500);
    }, [navigation]);

    const translatedText = i18n.t('splash.version', { version: versionText });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBarComponent />
            <AutoImage
                source={require('@assets/images/logo.png')}
                style={styles.logo}
            />
            <TextFieldLabel text={translatedText} style={[styles.version, { color: colors.text }]} />
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    version: {
        position: 'absolute',
        bottom: 12,

    },
});
