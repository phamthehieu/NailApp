import { Colors, useAppTheme } from '@/shared/theme';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type User = {
    id: string;
    name: string;
    avatar: string;
};

type UserAvatarProps = {
    user: User;
};

const UserAvatar = ({ user }: UserAvatarProps) => {
    const { theme: { colors } } = useAppTheme();
    const styles = $styles(colors);
    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatar}
                    accessibilityLabel={`${user.name}'s profile picture`}
                />
            </View>
            <Text style={styles.name}>{user.name}</Text>
        </View>
    );
};

const $styles = (colors: Colors) => StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: colors.borderTable,
    },
    avatar: {
        width: '100%',
        height: '100%'
    },
    name: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '500',
        color: colors.text,
    }
});

export default UserAvatar;