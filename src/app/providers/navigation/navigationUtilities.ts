import {useState, useEffect, useRef} from 'react';
import {BackHandler, Linking, Platform} from 'react-native';
import {
  NavigationState,
  PartialState,
  createNavigationContainerRef,
} from '@react-navigation/native';

import ENV from '@shared/config/env';
import * as storage from '@store/index';
import {useIsMounted} from '@shared/lib/useIsMounted';

import type {NavigationProps} from './AppNavigator';
import type {RootStackParamList} from './types';

type Storage = typeof storage;
type PersistNavigationConfig = 'always' | 'dev' | 'prod' | 'never';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState>,
): string {
  const route = state.routes[state.index ?? 0];

  if (!route.state) {
    return route.name as keyof RootStackParamList;
  }

  return getActiveRouteName(route.state as NavigationState<RootStackParamList>);
}

const iosExit = () => false;

export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  const canExitRef = useRef(Platform.OS !== 'android' ? iosExit : canExit);

  useEffect(() => {
    canExitRef.current = canExit;
  }, [canExit]);

  useEffect(() => {
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false;
      }

      const routeName = getActiveRouteName(navigationRef.getRootState());

      if (canExitRef.current(routeName)) {
        BackHandler.exitApp();
        return true;
      }

      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, []);
}

function navigationRestoredDefaultState(
  persistNavigation: PersistNavigationConfig,
) {
  if (persistNavigation === 'always') {
    return false;
  }
  if (persistNavigation === 'dev' && __DEV__) {
    return false;
  }
  if (persistNavigation === 'prod' && !__DEV__) {
    return false;
  }

  return true;
}

export function useNavigationPersistence(
  storage: Storage,
  persistenceKey: string,
) {
  const [initialNavigationState, setInitialNavigationState] =
    useState<NavigationProps['initialState']>();
  const isMounted = useIsMounted();

  const initNavState = navigationRestoredDefaultState(
    ENV.PERSIST_NAVIGATION as PersistNavigationConfig,
  );
  const [isRestored, setIsRestored] = useState(initNavState);

  const routeNameRef = useRef<keyof RootStackParamList | undefined>(undefined);

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    const previousRouteName = routeNameRef.current;
    if (state !== undefined) {
      const currentRouteName = getActiveRouteName(state);

      if (previousRouteName !== currentRouteName) {
        if (__DEV__) {
          console.log(currentRouteName);
        }
      }

      routeNameRef.current = currentRouteName as keyof RootStackParamList;

      storage.save(persistenceKey, state);
    }
  };

  const restoreState = async () => {
    try {
      const initialUrl = await Linking.getInitialURL();

      if (!initialUrl) {
        const state = (await storage.load(persistenceKey)) as
          | NavigationProps['initialState']
          | null;
        if (state) setInitialNavigationState(state);
      }
    } finally {
      if (isMounted()) setIsRestored(true);
    }
  };

  useEffect(() => {
    if (!isRestored) restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    onNavigationStateChange,
    restoreState,
    isRestored,
    initialNavigationState,
  };
}

export function navigate(name: unknown, params?: unknown) {
  if (navigationRef.isReady()) {
    // @ts-expect-error
    navigationRef.navigate(name as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function resetRoot(
  state: Parameters<typeof navigationRef.resetRoot>[0] = {index: 0, routes: []},
) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(state);
  }
}
