import { Colors } from "@/shared/theme"

type BookingStatus = string | number | null | undefined
type ColorToken = keyof Colors

const STATUS_NAME_COLOR_MAP: Record<string, ColorToken> = {
    "Chờ xác nhận": "blue",
    "Đã xác nhận": "yellow",
    "Đang thực hiện": "purple",
    "Đã hoàn thành": "green",
    "Hoàn tất": "green",
    "Đã hủy": "red",
}

const STATUS_ID_COLOR_MAP: Record<number, ColorToken> = {
    0: "blue",
    1: "yellow",
    2: "purple",
    3: "green",
    4: "green",
    5: "red",
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

