import React from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { CheckCheck, Trash2, Info, AlertCircle, MessageSquareWarning } from "lucide-react-native";
import { useAppTheme } from '@/shared/theme';

interface MAlertProps {
    visible: boolean;
    title?: string;
    message?: string;
    okText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    showConfirm?: boolean;
    typeAlert: "Confirm" | "Delete" | "Default" | "Warning" | "Error";
}

const MAlert: React.FC<MAlertProps> = ({
    visible,
    title,
    message,
    okText,
    cancelText,
    onConfirm,
    onCancel,
    typeAlert
}) => {
    const { theme: { colors } } = useAppTheme();

    const renderIcon = () => {
        let IconComponent;
        let iconColor;
        let iconBgColor;

        switch (typeAlert) {
            case "Delete":
                IconComponent = Trash2;
                iconColor = colors.error500;
                iconBgColor = colors.error100;
                break;
            case "Confirm":
                IconComponent = CheckCheck;
                iconColor = colors.success500;
                iconBgColor = colors.success100;
                break;
            case "Default":
                IconComponent = Info;
                iconColor = colors.info500;
                iconBgColor = colors.info100;
                break;
            case "Warning":
                IconComponent = MessageSquareWarning;
                iconColor = colors.white;
                iconBgColor = colors.warning600;
                break;
            case "Error":
                IconComponent = AlertCircle;
                iconColor = colors.white;
                iconBgColor = colors.error500;
                break;
            default:
                return null;
        }

        return (
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                <IconComponent size={24} color={iconColor} />
            </View>
        );
    };

    const getButtonStyle = () => {
        if (typeAlert === "Warning") {
            return { backgroundColor: colors.warning600 };
        } else if (typeAlert === "Error") {
            return { backgroundColor: colors.error500 };
        } else if (typeAlert === "Default") {
            return { backgroundColor: colors.info500 };
        } else if (typeAlert === "Confirm") {
            return { backgroundColor: colors.success500 };
        } else if (typeAlert === "Delete") {
            return { backgroundColor: colors.error500 };
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={onCancel}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <View style={styles.contentWrapper} pointerEvents="box-none">
                    <View style={[styles.content, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {renderIcon()}

                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {title}
                            </Text>
                        </View>

                        <View style={styles.body}>
                            <Text style={[styles.message, { color: colors.text }]}>
                                {message}
                            </Text>
                        </View>

                        <View style={styles.footer}>
                            {cancelText && (
                                <Pressable
                                    style={[
                                        styles.button,
                                        styles.cancelButton,
                                        { backgroundColor: colors.background, borderColor: colors.border },
                                        cancelText && styles.buttonWithMargin
                                    ]}
                                    onPress={onCancel}
                                >
                                    <Text style={[styles.buttonText, { color: colors.text }]}>
                                        {cancelText}
                                    </Text>
                                </Pressable>
                            )}

                            {okText && (
                                <Pressable
                                    style={[
                                        styles.button,
                                        getButtonStyle(),
                                        !cancelText && styles.buttonFullWidth
                                    ]}
                                    onPress={onConfirm}
                                >
                                    <Text style={[styles.buttonText, styles.okButtonText, { color: colors.white }]}>
                                        {okText}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    header: {
        marginBottom: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    body: {
        marginBottom: 16,
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 4,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    buttonWithMargin: {
        marginRight: 12,
    },
    buttonFullWidth: {
        width: '100%',
    },
    cancelButton: {
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    okButtonText: {
        fontWeight: '600',
    },
});

export default MAlert;
