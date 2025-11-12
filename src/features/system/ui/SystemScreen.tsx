import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { TextFieldLabel } from '@/shared/ui/Text';
import { ScrollView, Dimensions, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '@/shared/ui/Loader';

const SystemScreen = ({navigation}: RootScreenProps<Paths.System>) => {
    const { t } = useTranslation();
    const {theme: { colors }} = useAppTheme();
    const isTablet = useIsTablet();
    const screenWidth = Dimensions.get('window').width;
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const styles = $styles(colors);

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

                    <TextFieldLabel>System Screen</TextFieldLabel>

                </ScrollView>
            </KeyboardAvoidingView>


            <Loader loading={loading} title={t('loading.processing')} />

        </SafeAreaView >
    );
};

const $styles = (colors: Colors) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        contentContainer: {
            padding: 16,
            flexGrow: 1,
        },
    });
};

export default SystemScreen;
