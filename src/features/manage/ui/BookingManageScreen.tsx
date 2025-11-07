import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '@/shared/ui/Loader';
import MHeader from '@/shared/ui/MHeader';
import { Grid3x3 } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import ModalFliterComponent from '../components/ModalFliterComponent';
import CalendarHeader from './calender_day/CalenderHeader';
import CalenderDayComponent from './calender_day/CalenderDayComponent';
import CalenderWeedComponent from './calender_weed/CalenderWeedComponent';
import CalenderMonthComponent from './calender_month/CalenderMonthComponent';

const BookingManageScreen = ({navigation}: RootScreenProps<Paths.BookingManage>) => {
    const { t } = useTranslation();
    const {theme: { colors }} = useAppTheme();

    const [viewMode, setViewMode] = useState<'Ngày' | 'Tuần' | 'Tháng'>('Ngày');
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [activeRange, setActiveRange] = useState<{ start: Date; end: Date } | null>(null);
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
    const styles = $styles(colors);

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };


    const handleDateChange = (d: Date) => {
        setAnchorDate(d);

        if (viewMode === 'Ngày') {
            const s = new Date(d);
            s.setHours(0, 0, 0, 0);
            const e = new Date(d);
            e.setHours(23, 59, 59, 999);
        } else if (viewMode === 'Tháng') {
            const s = new Date(d.getFullYear(), d.getMonth(), 1);
            s.setHours(0, 0, 0, 0);
            const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            e.setHours(23, 59, 59, 999);
        } else if (viewMode === 'Tuần' && !activeRange) {
            const start = getStartOfWeek(d);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        }
    };

    const handleRangeChange = (range: { start: Date; end: Date } | null) => {
        if (range === null) {
            setActiveRange(null);
            return;
        }
        console.log('start', range.start);
        console.log('end', range.end);
        setActiveRange({ start: range.start, end: range.end });
    };

    useEffect(() => {
        if (viewMode === 'Ngày') {
            const s = new Date(anchorDate);
            s.setHours(0, 0, 0, 0);
            const e = new Date(anchorDate);
            e.setHours(23, 59, 59, 999);
        } else if (viewMode === 'Tháng') {
            const s = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
            s.setHours(0, 0, 0, 0);
            const e = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
            e.setHours(23, 59, 59, 999);
        } else if (viewMode === 'Tuần' && !activeRange) {
            const s = getStartOfWeek(anchorDate);
            const e = new Date(s);
            e.setDate(e.getDate() + 6);
            e.setHours(23, 59, 59, 999);
        }
    }, [viewMode, anchorDate, activeRange]);

    const renderCalenderComponent = () => {
        if (viewMode === 'Ngày') {
            return <CalenderDayComponent selectedDate={anchorDate} />;
        }
        if (viewMode === 'Tuần') {
            return <CalenderWeedComponent selectedDate={anchorDate} dateRange={activeRange} />;
        }
        if (viewMode === 'Tháng') {
            return <CalenderMonthComponent selectedDate={anchorDate} />;
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('bookingManage.title')}
                onBack={() => navigation.dispatch(DrawerActions.openDrawer())}
                showIconLeft={true}
                iconLeft={<Grid3x3 size={24} color={colors.background} />}
                bgColor={colors.yellow}
                // enableSearch={true}
                // searchPlaceholder={t('bookingManage.searchPlaceholder')}
                // onChangeSearchText={(text) => {console.log(text)}}
                // onSubmitSearch={(text) => {console.log(text)}}
                // showIconRight={true}
                // iconRight={<Funnel size={24} color={colors.background} />}
                // onPressIconRight={() => setShowAdvanced(true)}
            />

            <CalendarHeader
                selectedDate={anchorDate}
                onChange={handleDateChange}
                onChangeRange={handleRangeChange}
                viewMode={viewMode}
                onViewModeChange={(mode) => {
                    setViewMode(mode);
                    setActiveRange(null);
                }}
            />

            <View style={styles.content}>

                {renderCalenderComponent()}

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
