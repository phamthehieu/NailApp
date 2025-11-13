import { Paths } from '@/app/navigation/paths';
import { RootScreenProps } from '@/app/navigation/types';
import { Colors, useAppTheme } from '@/shared/theme';
import StatusBarComponent from '@/shared/ui/StatusBar';
import React, { useEffect, useState } from 'react';
import { ImageSourcePropType, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextFieldLabel } from '@/shared/ui/Text';
import MHeader from '@/shared/ui/MHeader';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useIsTablet } from '@/shared/lib/useIsTablet';
import { TextField } from '@/shared/ui/TextField';
import { Button } from '@/shared/ui/Button';
import { AutoImage } from '@/shared/ui/AutoImage';
import { RootState } from '@/app/store';
import { useSelector } from 'react-redux';

const EditProfileUserScreen = ({ navigation }: RootScreenProps<Paths.EditProfileUser>) => {
    const { theme: { colors } } = useAppTheme();
    const isTablet = useIsTablet();
    const styles = $styles(colors, isTablet);
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        setName(userInfo?.displayName ?? '');
        setEmail(userInfo?.email ?? '');
        setPhone(userInfo?.phoneNumber ?? '');
        setDescription(userInfo?.description ?? '');
    }, [userInfo]);

    const avatarSource: ImageSourcePropType = userInfo?.avatarUrl
        ? { uri: userInfo.avatarUrl }
        : require('@assets/images/logo.png');
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

            <StatusBarComponent backgroundColor={colors.yellow} />

            <MHeader
                label={t('editProfileUser.title')}
                onBack={() => navigation.goBack()}
                showIconLeft={true}
                iconLeft={<ArrowLeft size={24} color={colors.background} />}
                bgColor={colors.yellow}
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
            >
                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>

                    <View style={styles.profileCard}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatarWrapper}>
                                <AutoImage
                                    source={avatarSource}
                                    style={styles.avatar}
                                />
                                <View style={styles.cameraBadge}>
                                    <Camera size={isTablet ? 22 : 18} color={colors.white} />
                                </View>
                            </View>
                            <View style={styles.profileTextWrapper}>
                                <TextFieldLabel weight="bold" style={styles.profileName}>
                                    {name || '---'}
                                </TextFieldLabel>
                                <TextFieldLabel style={styles.profileSubTitle}>
                                    {description || '---'}
                                </TextFieldLabel>
                                <TextFieldLabel style={styles.profileMeta}>
                                    {email || '---'}
                                </TextFieldLabel>
                                <TextFieldLabel style={styles.profileMeta}>
                                    {phone || '---'}
                                </TextFieldLabel>
                            </View>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <TextField
                            label={t('editProfileUser.name')}
                            placeholder={t('editProfileUser.namePlaceholder')}
                            value={name}
                            onChangeText={setName}
                        />

                        <TextField
                            label={t('editProfileUser.email')}
                            placeholder={t('editProfileUser.emailPlaceholder')}
                            value={email}
                            onChangeText={setEmail}
                        />

                        <TextField
                            label={t('editProfileUser.phone')}
                            placeholder={t('editProfileUser.phonePlaceholder')}
                            value={phone}
                            onChangeText={setPhone}
                        />

                        <TextField
                            label={t('editProfileUser.description')}
                            placeholder={t('editProfileUser.descriptionPlaceholder')}
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={4}
                             style={styles.descriptionInput}
                             inputWrapperStyle={styles.descriptionInputWrapper}
                        />

                        <Button
                            text={t('editProfileUser.saveButton')}
                            onPress={() => { }}
                            style={styles.saveButton}
                            textStyle={styles.saveButtonText}
                        />

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const $styles = (colors: Colors, isTablet: boolean) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        contentContainer: {
            padding: 12,
        },
        profileCard: {
            backgroundColor: colors.card,
            borderRadius: isTablet ? 26 : 20,
            padding: isTablet ? 28 : 12,
            shadowColor: '#1F2937',
            shadowOpacity: 0.12,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 18,
            elevation: 10,
            alignItems: 'center',
        },
        profileRow: {
            flexDirection: 'column',
            alignItems: 'center',
        },
        avatarWrapper: {
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatar: {
            width: isTablet ? 80 : 80,
            height: isTablet ? 80 : 80,
            borderRadius: isTablet ? 40 : 40,
            borderWidth: 3,
            borderColor: colors.text,
        },
        cameraBadge: {
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: isTablet ? 32 : 28,
            height: isTablet ? 32 : 28,
            borderRadius: isTablet ? 16 : 14,
            backgroundColor: colors.yellow,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.border,
        },
        profileTextWrapper: {
            marginTop: isTablet ? 20 : 16,
            alignItems: 'center',
        },
        profileName: {
            fontSize: isTablet ? 22 : 18,
            color: colors.text,
        },
        profileSubTitle: {
            marginTop: 4,
            color: colors.placeholderTextColor,
            fontSize: isTablet ? 16 : 14,
        },
        profileMeta: {
            marginTop: 2,
            color: colors.placeholderTextColor,
            fontSize: isTablet ? 15 : 13,
        },
        saveButton: {
            marginTop: 20,
            marginBottom: 80,
            borderRadius: 12,
            backgroundColor: colors.yellow,
            borderColor: colors.yellow,
            color: colors.text,
            fontSize: isTablet ? 16 : 14,
            fontWeight: 'bold',
            textAlign: 'center',
            paddingVertical: 12,
            paddingHorizontal: 24,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
        },
        formContainer: {
            marginTop: 20,
            gap: 20,
        },
        saveButtonText: {
            color: colors.text,
            fontSize: 22,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        descriptionInput: {
            minHeight: 112,
        },
        descriptionInputWrapper: {
            minHeight: 112,
            paddingVertical: 12,
        },
    });
}

export default EditProfileUserScreen;