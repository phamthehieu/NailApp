import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { validateCredentials } from '../model/validation';
import { getUserInfoApi, loginApi, LoginRequest } from '../api/authApi';
import { alertService } from '@/services/alertService';
import { useTranslation } from 'react-i18next';
import DeviceInfo from "react-native-device-info";
import { saveToken } from '@/services/auth/authService';
import { useAppDispatch } from '@/app/store';
import { setCredentials, setUserInfo } from '../model/authSlice';

export type AuthFormMessages = {
    usernameRequired: string;
    passwordRequired: string;
    passwordMin: string;
};

export type AuthFormErrors = {
    username?: string;
    password?: string;
};

export function useAuthForm(messages: AuthFormMessages) {
    const [username, setUsernameState] = useState('');
    const [password, setPasswordState] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errors, setErrors] = useState<AuthFormErrors>({});
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const togglePasswordVisible = useCallback(() => {
        setIsPasswordVisible((prev) => !prev);
    }, []);

    const setUsername = useCallback((value: string) => {
        setUsernameState(value);
        setErrors((prev) => (prev.username ? { ...prev, username: undefined } : prev));
    }, []);

    const setPassword = useCallback((value: string) => {
        setPasswordState(value);
        setErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
    }, []);

    const validate = useCallback(() => {
        const result = validateCredentials({ username, password }, messages);
        setErrors(result);
        return Object.keys(result).length === 0;
    }, [username, password, messages]);

    const login = useCallback(async () => {
        const ok = validate();
        if (!ok) return false;

        try {
            const dataLogin = {
                id: 0,
                username: username,
                password: password,
                deviceCode: DeviceInfo.getDeviceId(),
                osName: DeviceInfo.getSystemName(),
                pushToken: "",
            };
            const response = await loginApi(dataLogin as LoginRequest);

            if (response?.token) {
                await Keychain.setGenericPassword(username, password);
                saveToken(
                    response.token,
                    response.refreshToken || null,
                    response.id
                );

                dispatch(setCredentials({
                    token: response.token,
                    refreshToken: response.refreshToken ?? null,
                    userId: response.id ?? null,
                }));

                try {
                    const responseUserInfo = await getUserInfoApi();
                    dispatch(setUserInfo(responseUserInfo));
                } catch (infoError) {
                    console.warn('Không thể lấy thông tin người dùng:', infoError);
                }

                return true;
            }

            alertService.showAlert({
                title: t('login.errorTitle'),
                message: t('login.errorMessage'),
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        } catch (error: any) {
            alertService.showAlert({
                title: t('login.errorTitle'),
                message: error.message,
                typeAlert: 'Error',
                onConfirm: () => {},
            });
            return false;
        }
    }, [username, password, validate]);

    useEffect(() => {
        const loadSaved = async () => {
            try {
                const credentials = await Keychain.getGenericPassword();
                if (credentials) {
                    setUsernameState(credentials.username);
                    setPasswordState(credentials.password);
                }
            } catch (error) {
                alertService.showAlert(
                    {
                        title: 'Error',
                        message: 'Error loading saved credentials',
                        typeAlert: 'Error',
                        onConfirm: () => {
                            console.log('Confirm');
                        },
                        onCancel: () => {
                            console.log('Cancel');
                        },
                    }
                );
            }
        };
        loadSaved();
    }, []);

    return {
        username,
        password,
        isPasswordVisible,
        errors,
        setUsername,
        setPassword,
        togglePasswordVisible,
        validate,
        login,
        setErrors,
    } as const;
}


