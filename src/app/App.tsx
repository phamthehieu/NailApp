import { useEffect, useState } from 'react';

import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { initI18n } from '@shared/i18n';
import { AppNavigator } from '@app/navigation/AppNavigator';
import { useNavigationPersistence } from '@app/navigation/navigationUtilities';
import { ThemeProvider } from '@shared/theme/context';
import { NetworkStatusBanner } from '@shared/ui/NetworkStatusBanner';
import { loadDateFnsLocale } from '@shared/lib/formatDate';
import * as storage from '@store/index';

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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <ThemeProvider>
            <AppNavigator
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
            <NetworkStatusBanner />
          </ThemeProvider>
        </KeyboardProvider>
    </SafeAreaProvider>
  );
}

export default App;
