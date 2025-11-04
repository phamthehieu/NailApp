import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = NativeStackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  Login: undefined;
  Splash: undefined;
  Checkin: undefined;
  ChooseShop: undefined;
  Account: undefined;
  System: undefined;
  Report: undefined;
  BottomNavigator: undefined;
  BookingManage: undefined;
};
