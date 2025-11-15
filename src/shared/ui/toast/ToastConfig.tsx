import React from "react";
import { View, Text } from "react-native";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: "green" }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 12,
                fontWeight: "500",
                color: "green",
            }}
            text1NumberOfLines={3}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{ borderLeftColor: "red" }}
            text1Style={{
                fontSize: 12,
                fontWeight: "700",
            }}
            text1NumberOfLines={3}
            text2Style={{
                fontSize: 12,
                color: "darkred",
            }}
            text2NumberOfLines={3}
        />
    ),
    custom: ({ text1, props }) => (
        <View
            style={{
                height: 60,
                width: "100%",
                backgroundColor: "purple",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >
            <Text style={{ color: "white", fontWeight: "bold" }}>{text1}</Text>
            {props?.extra && <Text style={{ color: "white" }}>{props.extra}</Text>}
        </View>
    ),
};
