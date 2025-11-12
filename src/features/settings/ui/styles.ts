import { Colors } from "@/shared/theme";
import { StyleSheet } from "react-native";

export const $styles = (colors: Colors, isTablet: boolean, screenWidth: number) => {
    const basePadding = isTablet ? 32 : 10;
    const baseMargin = isTablet ? 24 : 12;
    const baseMarginLeft = isTablet ? screenWidth * 0.15 : 25;
    const headerFontSize = isTablet ? 32 : 24;
    const loginTextFontSize = isTablet ? 16 : 12;
    const iconSize = isTablet ? 32 : 24;

    const animationWidth = isTablet ? Math.min(screenWidth * 0.4, 400) : 272;
    const animationHeight = isTablet ? (animationWidth * 200) / 272 : 200;
    const animationMarginLeft = isTablet ? screenWidth * 0.15 : 26;

    const contentMaxWidth = isTablet ? 600 : undefined;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        contentContainer: {
            padding: basePadding,
            paddingBottom: basePadding + 300,
            flexGrow: 1,
            marginTop: isTablet ? 40 : 20,
            alignItems: isTablet ? 'center' : 'flex-start',
        },
        contentWrapper: {
            width: '100%',
            maxWidth: contentMaxWidth,
            alignSelf: isTablet ? 'center' : 'flex-start',
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: baseMargin,
        },
        headerTitle: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: baseMargin,
        },
        headerTitleText: {
            fontSize: headerFontSize,
            fontWeight: 'bold',
            marginRight: isTablet ? 12 : 9,
            color: colors.text,
        },
        headerTitleIcon: {
            width: iconSize,
            height: iconSize,
            resizeMode: 'contain',
        },
        headerFlagContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: baseMargin,
            backgroundColor: colors.background,
            padding: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        headerFlagText: {
            fontSize: 12,
            fontWeight: 'bold',
            marginRight: 8,
            color: colors.text,
        },
        headerFlagImage: {
            width: 28,
            height: 28,
            resizeMode: 'cover',
        },
        loginContainer: {
            marginBottom: 1,
            marginLeft: baseMarginLeft,
        },
        loginText: {
            color: colors.text,
            fontSize: loginTextFontSize,
        },
        loginAnimation: {
            width: animationWidth,
            height: animationHeight,
            marginLeft: animationMarginLeft,
        },
        loginFormContainer: {
            marginBottom: 16,
            marginHorizontal: 24,
        },
        loginFormInput: {
            marginBottom: 16,
            fontSize: 14,
            borderColor: colors.border,
            borderRadius: 12,
            borderWidth: 1,
            paddingVertical: 8,
            paddingLeft: 10,
            paddingRight: 20,
        },
        loginFormButton: {
            marginTop: 24,
            marginHorizontal: 24,
        },
        buttonLogin: {
            alignItems: 'center',
            backgroundColor: colors.yellow,
            borderRadius: 12,
            marginBottom: 40,
            marginHorizontal: 24,
            borderColor: colors.yellow,
        },
        optionsContainer: {
            marginBottom: 40,
            marginHorizontal: 24,
            alignItems: 'center',
        },
        forgotPasswordText: {
            fontSize: 14,
            color: colors.yellow,
            fontWeight: '500',
        },
        buttonLoginText: {
            color: colors.black,
            fontWeight: '500',
            fontSize: 16,
        },
        edgeHandle: {
            position: 'absolute',
            left: 0,
            top: 40,
            width: 40,
            height: 40,
            backgroundColor: colors.yellow,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            opacity: 0.95,
            shadowColor: colors.black,
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
        },
        edgeHandlePress: {
            flex: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 4,
        },
        edgeHandleLabel: {
            color: colors.black,
            fontSize: 12,
            fontWeight: '600',
            transform: [{ rotate: '-90deg' }],
        },
    });
};