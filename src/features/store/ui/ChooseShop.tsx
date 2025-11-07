import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import { StyleSheet, KeyboardAvoidingView, Platform, View, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { useTranslation } from 'react-i18next';
import MHeader from '@/shared/ui/MHeader';
import Loader from '@/shared/ui/Loader';
import { useState } from 'react';
import { TextField } from '@/shared/ui/TextField';
import { ChevronRightIcon, SearchIcon, StoreIcon } from 'lucide-react-native';
import { ListItem } from '@/shared/ui/ListItem';
import { EmptyState } from '@/shared/ui/EmptyState';
import { AutoImage } from '@/shared/ui/AutoImage';


const ChooseShop = ({navigation}: RootScreenProps<Paths.ChooseShop>) => {
    const {theme: { colors }} = useAppTheme();
    const isTablet = useIsTablet();
    const { t } = useTranslation();
    const styles = $styles(colors, isTablet);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const listShop = [
        {
            id: 1,
            name: 'Cửa hàng 1',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 2,
            name: 'Cửa hàng 2',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 3,
            name: 'Cửa hàng 3',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 4,
            name: 'Cửa hàng 4',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 5,
            name: 'Cửa hàng 5',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 6,
            name: 'Cửa hàng 6',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 7,
            name: 'Cửa hàng 7',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 8,
            name: 'Cửa hàng 8',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 9,
            name: 'Cửa hàng 9',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 10,
            name: 'Cửa hàng 10',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 11,
            name: 'Cửa hàng 11',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 12,
            name: 'Cửa hàng 12',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 13,
            name: 'Cửa hàng 13',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 14,
            name: 'Cửa hàng 14',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
        {
            id: 15,
            name: 'Cửa hàng 15',
            address: '123 Đường ABC, Quận XYZ, TP. HCM',
        },
    ];

    const onChooseShop = (shop: any) => {
        navigation.navigate(Paths.BottomNavigator);
        // setLoading(true);
        // setTimeout(() => {
        //     setLoading(false);
        //     navigation.navigate(Paths.BottomNavigator);
        // }, 3000);

    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBarComponent backgroundColor={colors.yellow} />
            <MHeader
                label={t('chooseShop.chooseShop')}
                onBack={() => navigation.goBack()}
                showIconLeft={false}
                bgColor={colors.yellow}
            />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
            >

                <View style={styles.searchContainer}>

                    <TextField
                        placeholder={t('chooseShop.searchPlaceholder')}
                        value={search}
                        onChangeText={setSearch}
                        inputWrapperStyle={styles.searchInputWrapper}
                         returnKeyType="done"
                         LeftAccessory={() => <SearchIcon size={20} color={colors.text} />}
                    />

                </View>

                <FlatList
                    data={listShop}
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

                            <Text style={styles.emptyText }>{t('chooseShop.noShopFound')}</Text>

                        </View>
                    }
                />

            </KeyboardAvoidingView>

            <Loader loading={loading} title={t('loading.processing')} />

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
    });
};

export default ChooseShop;
