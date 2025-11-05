import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { Text } from '@/shared/ui/Text';
import { ScrollView, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Modal, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '@/shared/ui/Loader';
import MHeader from '@/shared/ui/MHeader';
import { Funnel, Grid3x3 } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import ModalFliterComponent from '../components/ModalFliterComponent';
import CalendarHeader from '../components/CalenderHeader';
import ScheduleTable from '../components/ScheduleTable';

const BookingManageScreen = ({navigation}: RootScreenProps<Paths.BookingManage>) => {
    const { t } = useTranslation();
        const {theme: { colors }} = useAppTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [form, setForm] = useState({
        fromDate: '',
        toDate: '',
        bookingCode: '',
        customerName: '',
        phone: '',
        service: '',
        status: '',
    });
    const scrollViewRef = useRef<ScrollView>(null);
    const styles = $styles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('bookingManage.title')}
                onBack={() => navigation.dispatch(DrawerActions.openDrawer())}
                showIconLeft={true}
                iconLeft={<Grid3x3 size={24} color={colors.background} />}
                bgColor={colors.yellow}
                enableSearch={true}
                searchPlaceholder={t('bookingManage.searchPlaceholder')}
                onChangeSearchText={(text) => {console.log(text)}}
                onSubmitSearch={(text) => {console.log(text)}}
                showIconRight={true}
                iconRight={<Funnel size={24} color={colors.background} />}
                onPressIconRight={() => setShowAdvanced(true)}
            />

            <CalendarHeader selectedDate={selectedDate} onChange={setSelectedDate} />

            <View style={styles.content}>

                <ScheduleTable selectedDate={selectedDate} />

            </View>

            <ModalFliterComponent showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced} form={form} setForm={setForm} />

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
        content: {
            flex: 1,
            paddingHorizontal: 1,
        }
    });
};

export default BookingManageScreen;
