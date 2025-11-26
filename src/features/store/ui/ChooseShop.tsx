import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { StyleSheet, KeyboardAvoidingView, Platform, View, FlatList, RefreshControl, Animated, TouchableOpacity, Dimensions, PanResponderInstance, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useTranslation } from 'react-i18next';
import MHeader from '@/shared/ui/MHeader';
import Loader from '@/shared/ui/Loader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRightIcon, LogOutIcon, MapPinCheck } from 'lucide-react-native';
import { ListItem } from '@/shared/ui/ListItem';
import { AutoImage } from '@/shared/ui/AutoImage';
import { TextFieldLabel } from '@/shared/ui/Text';
import { RootState, store, useAppDispatch } from '@/app/store';
import { clearAuth, saveToken } from '@/services/auth/authService';
import { clearAuthState, setCredentials, setUserInfo } from '@/features/auth/model/authSlice';
import { useSelector } from 'react-redux';
import { setListChooseShop } from '../model/storeSlice';
import { listChooseShopApi, ListChooseShopResponse, postSelectStoreApi } from '../api/storeApi';
import { alertService } from '@/services/alertService';
import { getUserInfoApi } from '@/features/auth/api/authApi';


const ChooseShop = ({navigation}: RootScreenProps<Paths.ChooseShop>) => {
    const {theme: { colors }} = useAppTheme();
    const isTablet = useIsTablet();
    const { t } = useTranslation();
    const styles = $styles(colors, isTablet);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const listChooseShop = useSelector((state: RootState) => state.store.listChooseShop);
    const dispatch = useAppDispatch();
    const userId = useSelector((state: RootState) => state.auth.userId);

    const panY = useRef(new Animated.Value(0)).current;
    const dragOffsetY = useRef(0);
    const screenHeight = Dimensions.get('window').height;
    const minY = 5;
    const maxY = screenHeight - 20;
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

    const fetchListChooseShop = useCallback(async () => {
        if (!userId) {
            return;
        }
        setLoadingList(true);
        try {
            const response = await listChooseShopApi(userId);
            dispatch(setListChooseShop(response));
        } catch (error) {
            alertService.showAlert({
                title: t('chooseShop.errorTitle'),
                message: t('chooseShop.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoadingList(false);
        }
    }, [dispatch, t, userId]);

    useEffect(() => {
        fetchListChooseShop();
    }, [fetchListChooseShop]);

    const onChooseShop = async (shop: ListChooseShopResponse) => {
        try {
            setLoadingAction(true);
            const response = await postSelectStoreApi(shop.storeId);

            if (response?.token) {
                saveToken(
                    response.token,
                    response.refreshToken || null,
                    response.id
                );
                dispatch(setCredentials({
                    token: response.token,
                    refreshToken: response.refreshToken ?? null,
                    userId: response.id ?? null,
                }));
                const responseUserInfo = await getUserInfoApi();
                dispatch(setUserInfo(responseUserInfo));
                navigation.navigate(Paths.BottomNavigator);
            } else {
                alertService.showAlert({
                    title: t('chooseShop.errorTitle'),
                    message: t('chooseShop.errorMessage'),
                    typeAlert: 'Error',
                    onConfirm: () => {},
                });
            }
        } catch (error) {
            alertService.showAlert({
                title: t('chooseShop.errorTitle'),
                message: t('chooseShop.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
        } finally {
            setLoadingAction(false);
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBarComponent backgroundColor={colors.yellow} />
            <MHeader
                label={t('chooseShop.chooseShop')}
                onBack={() => navigation.goBack()}
                bgColor={colors.yellow}
                showIconLeft={true}
                iconLeft={<></>}
                showIconRight={true}
                iconRight={<LogOutIcon size={24} color={colors.red} />}
                onPressIconRight={() => {
                    clearAuth();
                    store.dispatch(clearAuthState());
                    navigation.reset({
                        index: 0,
                        routes: [{ name: Paths.Login }],
                    });
                }}
            />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
            >

                <FlatList
                    refreshControl={<RefreshControl refreshing={loadingList} onRefresh={fetchListChooseShop} />}
                    contentContainerStyle={styles.flatListContainer}
                    data={listChooseShop}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) =>
                    {
                        return (
                            <View style={styles.shopContainer}>
                              <ListItem
                                onPress={() => onChooseShop(item)}
                                text={item.name}
                                textStyle={styles.shopName}
                                rightIcon={<ChevronRightIcon size={24} color={colors.text} />}
                            />
                            </View>
                        )
                    }}
                    ListEmptyComponent={

                        <View style={styles.emptyContainer}>

                            <AutoImage source={require('@assets/icon/no_data.png')} style={styles.emptyImage} />

                            <TextFieldLabel style={styles.emptyText }>{t('chooseShop.noShopFound')}</TextFieldLabel>

                        </View>
                    }
                />

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

            <Loader loading={loadingList || loadingAction} title={t('loading.processing')} />

        </SafeAreaView >
    );
};
const $styles = (colors: Colors, isTablet: boolean) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        searchContainer: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 16,
        },
        searchInputWrapper: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        shopName: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        shopContainer: {
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            marginBottom: 16,
            marginHorizontal: 16,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 16,
            color: colors.text,
        },
        emptyImage: {
            width: 100,
            height: 100,
            marginBottom: 16,
        },
        flatListContainer: {
            paddingVertical: 16,
        },
        edgeHandle: {
            position: 'absolute',
            left: 0,
            top: 40,
            width: 40,
            height: 40,
            backgroundColor: colors.yellow,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            opacity: 0.95,
            shadowColor: colors.black,
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
        },
        edgeHandlePress: {
            flex: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 4,
        },
        edgeHandleLabel: {
            color: colors.black,
            fontSize: 12,
            fontWeight: '600',
            transform: [{ rotate: '-90deg' }],
        },
    });
};

export default ChooseShop;
