import { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { WifiOff } from 'lucide-react-native';

import { useNetworkStatus, checkNetworkConnection } from '../lib/useNetworkStatus';
import { useAppTheme } from '../theme';
import type { ThemedStyle } from '../theme/types';
import { Text } from './Text';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

export function NetworkStatusBanner() {
  const { isConnected } = useNetworkStatus();
  const { themed, theme } = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wasConnected = useRef(true);
  const {t} = useTranslation();

  useEffect(() => {
    if (!isConnected && wasConnected.current) {
      // Hiển thị overlay
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();
      wasConnected.current = false;
    } else if (isConnected && !wasConnected.current) {
      // Ẩn overlay
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        wasConnected.current = true;
      });
    } else if (isConnected) {
      wasConnected.current = true;
    }
  }, [isConnected, fadeAnim, scaleAnim]);

  if (isConnected && wasConnected.current) {
    return null;
  }

  return (
    <Animated.View
      style={[
        themed($overlayContainer),
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents={isConnected ? 'none' : 'auto'}
    >
      <Animated.View
        style={[
          themed($contentContainer),
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={themed($iconContainer)}>
          <WifiOff size={64} color={theme.colors.error} />
        </View>

        <Text
          style={themed($titleText)}
          text={t('network.noConnection')}
          preset="heading"
          weight="bold"
        />

        <Text
          style={themed($messageText)}
          text={t('network.noConnectionMessage')}
          preset="default"
          size="md"
        />

        <View style={themed($buttonContainer)}>
          <Button
            preset="filled"
            tx="network:checkConnection"
            onPress={async () => {
              await checkNetworkConnection();
            }}
            style={themed($buttonStyle)}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const $overlayContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  backgroundColor: colors.background,
  justifyContent: 'center',
  alignItems: 'center',
});

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: '85%',
  maxWidth: 400,
  padding: spacing.xl,
  alignItems: 'center',
  justifyContent: 'center',
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.xl,
  padding: spacing.lg,
  borderRadius: 50,
  backgroundColor: colors.error + '20',
});

const $titleText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: 'center',
  marginBottom: spacing.md,
});

const $messageText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: 'center',
  opacity: 0.9,
  marginBottom: spacing.xl,
});

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: '100%',
  marginTop: spacing.md,
});

const $buttonStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
});

