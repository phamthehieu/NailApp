import type { TFunction } from "i18next"

export const BOOKING_STATUS_TRANSLATION_KEYS: Record<number, string> = {
    0: "bookingStatusLabel.waitingCheckin",
    1: "bookingStatusLabel.awaitingPayment",
    2: "bookingStatusLabel.checkedIn",
    3: "bookingStatusLabel.cancelled",
    4: "bookingStatusLabel.completed",
}

type NullableString = string | null | undefined

export const getLocalizedBookingStatusName = (
    status: number | null | undefined,
    fallbackName: NullableString,
    t: TFunction,
) => {
    const translationKey = typeof status === "number" ? BOOKING_STATUS_TRANSLATION_KEYS[status] : undefined
    if (translationKey) {
        const translated = t(translationKey, { defaultValue: fallbackName ?? "" })
        if (typeof translated === "string" && translated.trim().length > 0) {
            return translated
        }  
    }
    return fallbackName ?? ""
}

