import React from "react";
import Toast from "react-native-toast-message";
import { toastConfig } from "./ToastConfig";

export const ToastProvider = () => {
    return <Toast config={toastConfig} />;
};
