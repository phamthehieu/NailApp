import { ComponentProps } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '@shared/theme';
import { navigationRef, useBackButtonHandler, useNavigationPersistence } from './navigationUtilities';
import * as storage from '@store/index';

import { ErrorBoundary } from '@features/error/ErrorBoundary';
import ENV from '@shared/config/env';
import { Paths } from './paths';
import { RootStackParamList } from './types';
import LoginScreen from '@features/auth/ui/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>()

const exitRoutes: (keyof RootStackParamList)[] = [Paths.Login];

const AppStack = () => {
    const {
        theme: { colors },
    } = useAppTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                navigationBarColor: colors.background,
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen name={Paths.Login} component={LoginScreen} />
        </Stack.Navigator >
    );
};

export interface NavigationProps
    extends Partial<ComponentProps<typeof NavigationContainer<RootStackParamList>>> { }

export const AppNavigator = (props: NavigationProps) => {
    const { navigationTheme } = useAppTheme();
    const { onNavigationStateChange, initialNavigationState } = useNavigationPersistence(
        storage,
        'NAVIGATION_STATE'
    );

    const canExit = (routeName: string) =>
        exitRoutes.includes(routeName as keyof RootStackParamList);
    useBackButtonHandler(canExit);

    return (
        <NavigationContainer
            ref={navigationRef}
            theme={navigationTheme}
            onStateChange={onNavigationStateChange}
            initialState={initialNavigationState}
            {...props}
        >
            <ErrorBoundary catchErrors={ENV.CATCH_ERRORS}>
                <AppStack />
            </ErrorBoundary>
        </NavigationContainer>
    );
};
