import { useEffect, useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Header, HeaderProps } from '@shared/ui/Header';

export function useHeader(
  headerProps: HeaderProps,
  deps: Parameters<typeof useLayoutEffect>[1] = [],
) {
  const navigation = useNavigation();

  const usePlatformEffect = Platform.OS === 'web' ? useEffect : useLayoutEffect;

  usePlatformEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <Header {...headerProps} />,
    });
  }, [...deps, navigation]);
}
