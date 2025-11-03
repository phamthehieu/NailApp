import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { saveLanguage, getSavedLanguage } from '../i18n';

type Language = 'vi' | 'en';

export const useLanguage = () => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (i18n.isInitialized) {
            const savedLang = getSavedLanguage();
            const currentLang = (savedLang || i18n.language) as Language;
            setCurrentLanguage(currentLang);
            setIsInitialized(true);
        }
    }, [i18n.isInitialized, i18n.language]);

    const changeLanguage = (language: Language) => {
        setCurrentLanguage(language);
        i18n.changeLanguage(language);
        saveLanguage(language);
    };

    const getLanguageName = (code: string) => {
        switch (code) {
            case 'vi': return 'Tiếng Việt';
            case 'en': return 'English';
            default: return code;
        }
    };

    const getSupportedLanguages = (): Language[] => {
        return ['vi', 'en'];
    };

    return {
        currentLanguage,
        isInitialized,
        changeLanguage,
        getLanguageName,
        getSupportedLanguages,
    };
};
