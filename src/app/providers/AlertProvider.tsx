import React, { useState, useEffect, ReactNode } from 'react';
import MAlert from '@/shared/ui/MAlert';
import { alertService, type AlertConfig } from '@/services/alertService';

interface AlertProviderProps {
    children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Kết nối alertService với MAlert component
        alertService.setShowAlertCallback((config: AlertConfig) => {
            setAlertConfig(config);
            setIsVisible(true);
        });
    }, []);

    const handleConfirm = () => {
        if (alertConfig?.onConfirm) {
            alertConfig.onConfirm();
        }
        setIsVisible(false);
        setAlertConfig(null);
    };

    const handleCancel = () => {
        if (alertConfig?.onCancel) {
            alertConfig.onCancel();
        }
        setIsVisible(false);
        setAlertConfig(null);
    };

    return (
        <>
            {children}
            {alertConfig && (
                <MAlert
                    visible={isVisible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    okText={alertConfig.okText || 'Đồng ý'}
                    cancelText={alertConfig.cancelText}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    typeAlert={alertConfig.typeAlert}
                />
            )}
        </>
    );
}; 