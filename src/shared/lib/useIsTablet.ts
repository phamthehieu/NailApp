import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

/**
 * Hook để phát hiện thiết bị có phải là tablet không
 * Tablet thường có width >= 600px hoặc sử dụng Platform.isPad cho iOS
 * @returns {boolean} true nếu là tablet, false nếu là mobile
 */
export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(() => {
    const { width } = Dimensions.get('window');
    return (Platform.OS === 'ios' && Platform.isPad) || width >= 600;
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsTablet((Platform.OS === 'ios' && Platform.isPad) || window.width >= 600);
    });

    return () => subscription?.remove();
  }, []);

  return isTablet;
};

/**
 * Utility function để phát hiện tablet (không cần hook)
 * @returns {boolean} true nếu là tablet, false nếu là mobile
 */
export const isTablet = () => {
  const { width } = Dimensions.get('window');
  return (Platform.OS === 'ios' && Platform.isPad) || width >= 600;
};

