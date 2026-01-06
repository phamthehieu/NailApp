import { useEffect, useState } from 'react';

import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { Provider } from 'react-redux';
import { initI18n } from '@shared/i18n';
import { AppNavigator } from '@/app/providers/navigation/AppNavigator';
import { useNavigationPersistence } from '@/app/providers/navigation/navigationUtilities';
import { ThemeProvider } from '@shared/theme/context';
import { NetworkStatusBanner } from '@shared/ui/NetworkStatusBanner';
import { loadDateFnsLocale } from '@shared/lib/formatDate';
import * as storage from '@store/index';
import { AlertProvider } from './providers/AlertProvider';
import { store } from '@/app/store';
import { ToastProvider } from '@shared/ui/toast/ToastProvider';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY);

  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale());
  }, []);

  if (!isNavigationStateRestored || !isI18nInitialized) {
    return null;
  }


  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ThemeProvider>
            <AlertProvider>
              <AppNavigator
                initialState={initialNavigationState}
                onStateChange={onNavigationStateChange}
              />
              <NetworkStatusBanner />
              <ToastProvider />
            </AlertProvider>
          </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
