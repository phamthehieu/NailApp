import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * Hook để kiểm tra trạng thái kết nối mạng
 * @returns {NetworkStatus} - Trạng thái kết nối mạng hiện tại
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    // Kiểm tra trạng thái ban đầu
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      });
    });

    // Lắng nghe thay đổi trạng thái mạng
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}

/**
 * Utility function để kiểm tra kết nối mạng (không dùng hook)
 * @returns {Promise<boolean>} - true nếu có kết nối mạng, false nếu không
 */
export async function checkNetworkConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

