export type AlertConfig = {
  title: string;
  message: any;
  okText?: string;
  cancelText?: string;
  typeAlert: 'Confirm' | 'Delete' | 'Default' | 'Warning' | 'Error';
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertCallback = (config: AlertConfig) => void;

class AlertService {
  private static instance: AlertService;
  private showAlertCallback: AlertCallback | null = null;

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  setShowAlertCallback(callback: AlertCallback) {
    this.showAlertCallback = callback;
  }

  showAlert(config: AlertConfig) {
    if (this.showAlertCallback) {
      this.showAlertCallback(config);
    } else {
      const {Alert} = require('react-native');
      Alert.alert(
        config.title,
        config.message,
        [
          config.cancelText && {
            text: config.cancelText || 'Huỷ',
            style: 'cancel',
            onPress: config.onCancel,
          },
          config.okText && {
            text: config.okText || 'Đồng ý',
            onPress: config.onConfirm,
          },
        ],
        {cancelable: false},
      );
    }
  }
}

export const alertService = AlertService.getInstance();
