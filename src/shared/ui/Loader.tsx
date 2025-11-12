import { useAppTheme } from '@/shared/theme';
import LottieView from 'lottie-react-native';
import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { TextFieldLabel } from './Text';
interface IProps {
    loading: boolean;
    title?: string;
    color?: string;
}

const { width } = Dimensions.get('window');
export default function Loader({ loading, title, color }: IProps) {
    const { theme: { colors }} = useAppTheme();
    return (
        <>
            {loading && (
                <View style={{
                    ...styles.content,
                    backgroundColor: "transparent",
                }}>
                    <View style={[styles.box, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <LottieView
                            source={require('@assets/animations/loading.json')}
                            autoPlay
                            loop
                            style={styles.loadingAnimation}
                        />
                        {!!title && (
                            <TextFieldLabel
                                style={{
                                    paddingHorizontal: 16,
                                    textAlign: 'center',
                                    fontSize: 14,
                                    color: colors.text,
                                    marginBottom: 16,
                                }}>
                                {title}
                            </TextFieldLabel>
                        )}
                    </View>
                </View>
            )}
        </>
    );
}
const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    box: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        minWidth: 100,
        borderRadius: 12,
        maxWidth: (width * 2) / 3,
        borderWidth: 0.2,
    },
    loadingAnimation: {
        width: 100,
        height: 80,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 12,
        borderWidth: 0.2,
        borderColor: "gray",
    }
});
