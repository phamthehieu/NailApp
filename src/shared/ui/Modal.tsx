import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    DeviceEventEmitter,
    Dimensions,
    Easing,
    Modal as ReactNativeModal,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";

const MODAL_ANIM_DURATION = 300;
const MODAL_BACKDROP_OPACITY = 0.4;

interface ModalProps {
    onBackdropPress?: () => void;
    onHide?: () => void;
    isVisible: boolean;
    contentStyle?: any;
    backdropStyle?: any;
    children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    onBackdropPress = () => null,
    onHide = () => null,
    isVisible = false,
    contentStyle,
    backdropStyle,
    children,
    ...otherProps
}) => {
    const [deviceDimensions, setDeviceDimensions] = useState({
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    });

    const animVal = useRef(new Animated.Value(0)).current;
    const isMountedRef = useRef(false);
    const deviceEventEmitterRef = useRef<any>(null);

    useEffect(() => {
        isMountedRef.current = true;

        if (isVisible) {
            show();
        }

        deviceEventEmitterRef.current = DeviceEventEmitter.addListener(
            "didUpdateDimensions",
            handleDimensionsUpdate
        );

        return () => {
            if (deviceEventEmitterRef.current) {
                deviceEventEmitterRef.current.remove();
            }
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            show();
        } else {
            hide();
        }
    }, [isVisible]);

    const handleDimensionsUpdate = (dimensionsUpdate: any) => {
        const deviceWidth = dimensionsUpdate.window.width;
        const deviceHeight = dimensionsUpdate.window.height;
        if (
            deviceWidth !== deviceDimensions.width ||
            deviceHeight !== deviceDimensions.height
        ) {
            setDeviceDimensions({ width: deviceWidth, height: deviceHeight });
        }
    };

    const show = () => {
        Animated.timing(animVal, {
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
            duration: MODAL_ANIM_DURATION,
            toValue: 1,
        }).start();
    };

    const hide = () => {
        Animated.timing(animVal, {
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
            duration: MODAL_ANIM_DURATION,
            toValue: 0,
        }).start(() => {
            if (isMountedRef.current) {
                onHide();
            }
        });
    };

    const backdropAnimatedStyle = {
        opacity: animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [0, MODAL_BACKDROP_OPACITY],
        }),
    };

    const contentAnimatedStyle = {
        transform: [
            {
                translateY: animVal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [deviceDimensions.height, 0],
                    extrapolate: "clamp",
                }),
            },
        ],
    };

    return (
        <ReactNativeModal
            transparent
            animationType="none"
            visible={isVisible}
            {...otherProps}
        >
            <TouchableWithoutFeedback onPress={onBackdropPress}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        backdropAnimatedStyle,
                        { width: deviceDimensions.width, height: deviceDimensions.height },
                        backdropStyle,
                    ]}
                />
            </TouchableWithoutFeedback>
            {isVisible && (
                <Animated.View
                    style={[styles.content, contentAnimatedStyle, contentStyle]}
                    pointerEvents="box-none"
                >
                    {children}
                </Animated.View>
            )}
        </ReactNativeModal>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backdrop: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "black",
        opacity: 0,
    },
    content: {
        flex: 1,
        justifyContent: "flex-end",
    },
});

export default Modal;
