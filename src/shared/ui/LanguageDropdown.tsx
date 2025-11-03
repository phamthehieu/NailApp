import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@shared/lib/useLanguage';

const LanguageDropdown = () => {
    const { t } = useTranslation();
    const { currentLanguage, isInitialized, changeLanguage, getSupportedLanguages } = useLanguage();
    const [showPicker, setShowPicker] = useState(false);

    const languageFlags = {
        vi: require('@assets/images/vietnam.png'),
        en: require('@assets/images/english.png'),
    };

    const getLanguageDisplayName = (code: string) => {
        switch (code) {
            case 'vi': return t('language.vietnamese');
            case 'en': return t('language.english');
            default: return code;
        }
    };

    if (!isInitialized) {
        return null;
    }

    return (
        <View style={styles.container}>

            {Platform.OS === 'ios' ? (

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowPicker(!showPicker)}
                >
                    <LinearGradient
                        colors={['#f5f7fa', '#e4e7eb']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.pickerButton}
                    >
                        <View style={styles.selectedLanguageContainer}>
                            <Image
                                source={languageFlags[currentLanguage]}
                                style={styles.selectedFlagImage}
                                resizeMode="contain"
                                onError={(error) => console.log('Image load error:', error)}
                            />
                        </View>
                        <ChevronDown size={16} color="#3d5afe" />
                    </LinearGradient>
                </TouchableOpacity>

            ) : (

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowPicker(!showPicker)}
                >
                    <View
                        style={styles.pickerButton}
                    >
                        <View style={styles.selectedLanguageContainer}>
                            <Image
                                source={languageFlags[currentLanguage]}
                                style={styles.selectedFlagImage}
                                resizeMode="contain"
                                onError={(error) => console.log('Image load error:', error)}
                            />
                        </View>
                        <ChevronDown size={24} color="#3d5afe" />
                    </View>
                </TouchableOpacity>

            )}

            {showPicker && (
                <View style={styles.dropdownContainer}>
                    {getSupportedLanguages().map((code) => (
                        <TouchableOpacity
                            key={code}
                            style={[
                                styles.dropdownItem,
                                currentLanguage === code && styles.selectedDropdownItem
                            ]}
                            onPress={() => {
                                changeLanguage(code);
                                setShowPicker(false);
                            }}
                        >
                            <Image
                                source={languageFlags[code]}
                                style={styles.dropdownFlagImage}
                                resizeMode="contain"
                            />
                            <Text style={[
                                styles.dropdownItemText,
                                currentLanguage === code && styles.selectedDropdownItemText
                            ]}>
                                {getLanguageDisplayName(code)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 16,
        marginLeft: 8,
        color: '#3d5afe',
        fontWeight: '600',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    selectedText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedLanguageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedFlagImage: {
        width: 32,
        height: 32,
        marginRight: 8,
        borderRadius: 2,
    },
    dropdownContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e4e7eb',
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedDropdownItem: {
        backgroundColor: '#f8f9ff',
    },
    dropdownFlagImage: {
        width: 20,
        height: 15,
        marginRight: 12,
        borderRadius: 2,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedDropdownItemText: {
        color: '#3d5afe',
        fontWeight: '600',
    },
});

export default LanguageDropdown;
