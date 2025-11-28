import { Colors } from "@/shared/theme"

type BookingStatus = string | number | null | undefined
type ColorToken = keyof Colors

const STATUS_NAME_COLOR_MAP: Record<string, ColorToken> = {
    "Chờ CheckIn": "blue",
    "Chờ Thanh toán": "yellow",
    "Người dùng CheckIn": "purple",
    "Đã hủy": "red",
    "Hoàn thành": "green",
}

const STATUS_ID_COLOR_MAP: Record<number, ColorToken> = {
    0: "blue",
    1: "yellow",
    2: "purple",
    3: "red",
    4: "green",
}

const DEFAULT_FALLBACK_COLOR: ColorToken = "yellow"

export const getBookingStatusColor = (
    status: BookingStatus,
    colors: Colors,
    fallbackColor: ColorToken = DEFAULT_FALLBACK_COLOR,
) => {
    const normalizeStatusName = (value?: string | null) => value?.trim() ?? ""

    const statusColorKey =
        typeof status === "number"
            ? STATUS_ID_COLOR_MAP[status]
            : STATUS_NAME_COLOR_MAP[normalizeStatusName(status)]

    const resolvedColorKey = statusColorKey ?? fallbackColor ?? DEFAULT_FALLBACK_COLOR

    return colors[resolvedColorKey] ?? colors[DEFAULT_FALLBACK_COLOR]
}

