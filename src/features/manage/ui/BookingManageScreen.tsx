import { Paths } from '@/app/providers/navigation/paths';
import { RootScreenProps } from '@/app/providers/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { StyleSheet, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '@/shared/ui/Loader';
import MHeader from '@/shared/ui/MHeader';
import { Funnel, Store } from 'lucide-react-native';
import ModalFliterComponent from '../components/ModalFliterComponent';
import CalendarHeader from '../components/CalenderHeader';
import { CalenderDayComponent, CalenderWeedComponent, CalenderMonthComponent } from './schedule';
import TabComponent from '@/shared/ui/TabComponent';
import BookingListComponent from './list/BookingListComponent';
import { useBookingForm } from '../hooks/useBookingForm';
import { RootState } from '@/app/store';
import { useSelector } from 'react-redux';
import { useStaffForm } from '../hooks/useStaffForm';

type TabType = { label: string; value: number }

const getCurrentWeekRange = (): { start: Date; end: Date } => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const areDatesEqual = (a: Date | null, b: Date | null) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.getTime() === b.getTime();
};

const BookingManageScreen = ({ navigation }: RootScreenProps<Paths.BookingManage>) => {
    const { t } = useTranslation();
    const { theme: { colors } } = useAppTheme();
    const {
        getDetailBookingItem,
        getHistoryBookingItem,
        getListBookingStatus,
        getListBookingManagerByDate,
        getListBookingManagerByRange,
        getListBookingManager,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        bookingDate,
        setBookingDate,
        status,
        bookingCode,
        customerName,
        phone,
        search,
        setSearch,
        loading,
    } = useBookingForm();
    const { listStaff } = useSelector((state: RootState) => state.staff);
    const [viewMode, setViewMode] = useState<'Ngày' | 'Tuần' | 'Tháng'>('Ngày');
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [searchText, setSearchText] = useState<string>('');
    const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<number>(listStaff[0]?.id || 0);
    const [activeRange, setActiveRange] = useState<{ start: Date; end: Date } | null>(getCurrentWeekRange());
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>({ label: t('calenderDashboard.calenderTab.schedule'), value: 1 });
    const { getListBookingHourSetting, getListBookingHourSettingByStaffId } = useStaffForm();
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
    const dateFromKey = useMemo(() => dateFrom ? dateFrom.toISOString() : 'null', [dateFrom]);
    const dateToKey = useMemo(() => dateTo ? dateTo.toISOString() : 'null', [dateTo]);
    const bookingDateKey = useMemo(() => bookingDate ? bookingDate.toISOString() : 'null', [bookingDate]);
    const tab1Opacity = useRef(new Animated.Value(1)).current;
    const tab1TranslateX = useRef(new Animated.Value(0)).current;
    const tab2Opacity = useRef(new Animated.Value(0)).current;
    const tab2TranslateX = useRef(new Animated.Value(50)).current;

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
        } else if (viewMode === 'Tuần') {
            const start = getStartOfWeek(d);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            setActiveRange({ start, end });
        }
    };

    const handleRangeChange = (range: { start: Date; end: Date } | null) => {
        if (range === null) {
            setActiveRange(null);
            return;
        }
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
            setActiveRange({ start: s, end: e });
        }
    }, [viewMode, anchorDate, activeRange]);

    useEffect(() => {
        if (activeTab.value === 1) {
            Animated.parallel([
                Animated.timing(tab1Opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab1TranslateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2Opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2TranslateX, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(tab1Opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab1TranslateX, {
                    toValue: -50,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2Opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tab2TranslateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [activeTab.value]);

    const handlePressScheduleItem = (item: any) => {
        console.log('item', item);
        getDetailBookingItem(item.id);
        getHistoryBookingItem(item.customer.id);
        navigation.navigate(Paths.DetailBookingItem, { bookingId: item.id });
    };

    const renderCalenderComponent = () => {
        if (viewMode === 'Ngày') {
            return <CalenderDayComponent selectedDate={anchorDate} onPressScheduleItem={handlePressScheduleItem} />;
        }
        if (viewMode === 'Tuần') {
            return <CalenderWeedComponent selectedDate={anchorDate} dateRange={activeRange} onPressScheduleItem={handlePressScheduleItem} selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />;
        }
        if (viewMode === 'Tháng') {
            return <CalenderMonthComponent selectedDate={anchorDate} onPressScheduleItem={handlePressScheduleItem} />;
        }
        return null;
    };

    useEffect(() => {
        getListBookingStatus();
        getListBookingHourSetting();
    }, []);

    useEffect(() => {
        if (listStaff.length > 0 && selectedUserId === 0 && listStaff[0]?.id) {
            setSelectedUserId(listStaff[0].id);
        }
    }, [listStaff, selectedUserId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchText]);

    useEffect(() => {
        if (activeTab.value !== 1) return;

        if (viewMode === 'Ngày') {
            getListBookingManagerByDate(anchorDate, debouncedSearchText);
        } else if (viewMode === 'Tuần') {
            if (activeRange?.start && activeRange?.end) {
                getListBookingHourSettingByStaffId(selectedUserId);
                getListBookingManagerByRange(activeRange.start, activeRange.end, debouncedSearchText, selectedUserId);
            }
        } else if (viewMode === 'Tháng') {
            const startDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            getListBookingManagerByRange(startDate, endDate, debouncedSearchText);
        }
    }, [anchorDate, viewMode, activeTab.value, debouncedSearchText, activeRange, selectedUserId, getListBookingManagerByDate, getListBookingManagerByRange, getListBookingHourSettingByStaffId]);

    useEffect(() => {
        const normalizedSearch = debouncedSearchText?.trim() ? debouncedSearchText.trim() : undefined;
        if (search === normalizedSearch) return;
        setSearch(normalizedSearch);
    }, [debouncedSearchText, search, setSearch]);

    useEffect(() => {
        if (viewMode === 'Ngày') {
            if (!areDatesEqual(bookingDate, anchorDate)) {
                setBookingDate(anchorDate);
            }
            if (dateFrom) setDateFrom(null);
            if (dateTo) setDateTo(null);
            return;
        }

        if (viewMode === 'Tuần') {
            if (!activeRange?.start || !activeRange?.end) return;
            if (bookingDate) setBookingDate(null);
            if (!areDatesEqual(dateFrom, activeRange.start)) {
                setDateFrom(activeRange.start);
            }
            if (!areDatesEqual(dateTo, activeRange.end)) {
                setDateTo(activeRange.end);
            }
            return;
        }

        if (viewMode === 'Tháng') {
            const startDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            if (bookingDate) setBookingDate(null);
            if (!areDatesEqual(dateFrom, startDate)) {
                setDateFrom(startDate);
            }
            if (!areDatesEqual(dateTo, endDate)) {
                setDateTo(endDate);
            }
        }
    }, [viewMode, anchorDate, activeRange, bookingDate, dateFrom, dateTo, setBookingDate, setDateFrom, setDateTo]);

    useEffect(() => {
        if (activeTab.value !== 2) return;
        getListBookingManager();
    }, [activeTab.value, dateFromKey, dateToKey, bookingDateKey, status, bookingCode, customerName, phone, search, getListBookingManager]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('bookingManage.title')}
                onBack={() => navigation.goBack()}
                showIconLeft={true}
                iconLeft={<Store size={24} color={colors.background} />}
                bgColor={colors.yellow}
                showIconRight={activeTab.value === 2 ? true : false}
                iconRight={<Funnel size={24} color={colors.background} />}
                onPressIconRight={() => setShowAdvanced(true)}
            />

            <TabComponent
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
                tabs={[{ label: t('calenderDashboard.calenderTab.schedule'), value: 1 }, { label: t('calenderDashboard.calenderTab.list'), value: 2 }]}
                showBookButton={true}
                maxWidth={400}
                onBookPress={() => navigation.navigate(Paths.AddNewBooking)}
            />

            <View style={styles.tabsWrapper}>
                <Animated.View
                    style={[
                        styles.tabContainer,
                        {
                            opacity: tab2Opacity,
                            transform: [{ translateX: tab2TranslateX }],
                        },
                    ]}
                    pointerEvents={activeTab.value === 2 ? 'auto' : 'none'}
                >

                    <CalendarHeader
                        searchText={searchText}
                        setSearchText={setSearchText}
                        selectedDate={anchorDate}
                        onChange={handleDateChange}
                        onChangeRange={handleRangeChange}
                        viewMode={viewMode}
                        onViewModeChange={(mode) => {
                            setViewMode(mode);
                            if (mode === 'Tuần') {
                                const start = getStartOfWeek(anchorDate);
                                const end = new Date(start);
                                end.setDate(end.getDate() + 6);
                                end.setHours(23, 59, 59, 999);
                                setActiveRange({ start, end });
                            } else {
                                setActiveRange(null);
                            }
                        }}
                    />

                    <View style={styles.content}>
                        <BookingListComponent navigation={navigation} />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.tabContainer,
                        {
                            opacity: tab1Opacity,
                            transform: [{ translateX: tab1TranslateX }],
                        },
                    ]}
                    pointerEvents={activeTab.value === 1 ? 'auto' : 'none'}
                >
                    <CalendarHeader
                        searchText={searchText}
                        setSearchText={setSearchText}
                        selectedDate={anchorDate}
                        onChange={handleDateChange}
                        onChangeRange={handleRangeChange}
                        viewMode={viewMode}
                        onViewModeChange={(mode) => {
                            setViewMode(mode);
                            if (mode === 'Tuần') {
                                const start = getStartOfWeek(anchorDate);
                                const end = new Date(start);
                                end.setDate(end.getDate() + 6);
                                end.setHours(23, 59, 59, 999);
                                setActiveRange({ start, end });
                            } else {
                                setActiveRange(null);
                            }
                        }}
                    />

                    <View style={styles.content}>
                        {renderCalenderComponent()}
                    </View>
                </Animated.View>
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
        },
        tabsWrapper: {
            flex: 1,
            position: 'relative',
        },
        tabContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
        }
    });
};

export default BookingManageScreen;
