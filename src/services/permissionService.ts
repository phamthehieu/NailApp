import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {translate} from '@/shared/i18n/translate';

export type NotificationPermissionResult = {
  granted: boolean;
  message: string;
};

function isAndroid13OrAbove(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  return Platform.Version >= 33;
}

export async function checkNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (!isAndroid13OrAbove()) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted;
  } catch (error) {
    console.error(translate('permission:checkError'), error);
    return false;
  }
}

export async function requestNotificationPermission(
  showAlertIfDenied: boolean = true,
): Promise<NotificationPermissionResult> {
  if (Platform.OS !== 'android') {
    return {
      granted: true,
      message: translate('permission:notApplicable'),
    };
  }

  if (!isAndroid13OrAbove()) {
    return {
      granted: true,
      message: translate('permission:notRequired'),
    };
  }

  try {
    const hasPermission = await checkNotificationPermission();
    if (hasPermission) {
      return {
        granted: true,
        message: translate('permission:alreadyGranted'),
      };
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: translate('permission:requestTitle'),
        message: translate('permission:requestMessage'),
        buttonNeutral: translate('permission:buttonNeutral'),
        buttonNegative: translate('permission:buttonNegative'),
        buttonPositive: translate('permission:buttonPositive'),
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return {
        granted: true,
        message: translate('permission:granted'),
      };
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      if (showAlertIfDenied) {
        Alert.alert(
          translate('permission:deniedTitle'),
          translate('permission:deniedMessage'),
          [{text: translate('permission:deniedButton')}],
        );
      }
      return {
        granted: false,
        message: translate('permission:deniedNeverAskAgain'),
      };
    } else {
      return {
        granted: false,
        message: translate('permission:denied'),
      };
    }
  } catch (error) {
    console.error(translate('permission:requestError'), error);
    return {
      granted: false,
      message: translate('permission:errorMessage', {
        error: error instanceof Error ? error.message : translate('permission:errorUnknown'),
      }),
    };
  }
}

export function openAppSettings(): void {
  if (Platform.OS === 'android') {
    const {Linking} = require('react-native');
    Linking.openSettings().catch((err: Error) => {
      console.error(translate('permission:settingsError'), err);
      Alert.alert(
        translate('permission:settingsErrorTitle'),
        translate('permission:settingsErrorMessage'),
      );
    });
  }
}
