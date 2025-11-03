import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { validateCredentials } from '../model/validation';

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
        await Keychain.setGenericPassword(username, password);
        return true;
    }, [username, password, validate]);

    useEffect(() => {
        const loadSaved = async () => {
            try {
                const credentials = await Keychain.getGenericPassword();
                if (credentials) {
                    setUsernameState(credentials.username);
                    setPasswordState(credentials.password);
                }
            } catch {
                // ignore load errors
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


