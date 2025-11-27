import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Eye, Pencil, Trash2, User, Info, Calendar, Ban } from "lucide-react-native";
import { TextFieldLabel } from "@/shared/ui/Text";
import { useAppTheme } from "@/shared/theme";
import { scheduleItemsList } from "../../data/scheduleItems";
import type { Colors } from "@/shared/theme";
import { AutoImage } from "@/shared/ui/AutoImage";
import { useTranslation } from "react-i18next";
import { useIsTablet } from "@/shared/lib/useIsTablet";
import { RootScreenProps } from "@/app/navigation/types";
import { Paths } from "@/app/navigation/paths";
import { alertService } from "@/services/alertService";
import BookingConfirmationModal from "./BookingConfirmationModal";
import CheckinBookingModal from "./CheckinBookingModal";
import BookingPaymentModal from "./BookingPaymentModal";
import { useBookingForm } from "../../hooks/useBookingForm";
import { useAppSelector } from "@/app/store";
import { BookingManagerItem } from "../../api/types";
import Loader from "@/shared/ui/Loader";
import { getBookingStatusColor } from "@/features/manage/utils/bookingStatusColor";
import { useEditBookingForm } from "../../hooks/useEditBookingForm";
import { useFocusEffect } from "@react-navigation/native";
interface BookingListComponentProps {
    navigation: RootScreenProps<Paths.BookingManage>['navigation'];
}

const BookingListComponent = ({ navigation }: BookingListComponentProps) => {
    const { theme: { colors } } = useAppTheme();
    const isTablet = useIsTablet();
    const styles = $styles(colors, isTablet);
    const { t } = useTranslation();
    const { getListBookingManager, loadMoreBookings, loading, loadingMore, resetPagination, getDetailBookingItem, getHistoryBookingItem, postCancelBooking } = useBookingForm();
    const { listBookingManager, pageIndex, totalPages } = useAppSelector((state) => state.booking);
    const { getListPromotion, getListPaymentType, getListService } = useEditBookingForm();

    const [isBookingConfirmationModalVisible, setIsBookingConfirmationModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCheckinBookingModalVisible, setIsCheckinBookingModalVisible] = useState(false);
    const [isBookingPaymentModalVisible, setIsBookingPaymentModalVisible] = useState(false);
    const isLoadingMoreRef = useRef(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleView = (item: any) => {
        getDetailBookingItem(item.id);
        getHistoryBookingItem(item.customer.id);
        navigation.navigate(Paths.DetailBookingItem, { bookingId: item.id });
    };

    const handleEdit = (item: any) => {
        getDetailBookingItem(item.id);
        navigation.navigate(Paths.EditBooking);
    };

    const handleDelete = (item: any) => {
        alertService.showAlert({
            title: t('detailBookingItem.deleteBooking.title'),
            message: t('detailBookingItem.deleteBooking.message'),
            typeAlert: 'Delete',
            okText: t('detailBookingItem.deleteBooking.okText'),
            cancelText: t('detailBookingItem.deleteBooking.cancelText'),
            onConfirm: () => {
                handleCancelBooking(item);
            },
            onCancel: () => {
                console.log('Cancel booking:');
            },
        });
    };

    const handleCancelBooking = (item: any) => {
        postCancelBooking(item.id).then((response) => {
            if (response) {
                alertService.showAlert({
                    title: t('bookingList.successTitle'),
                    message: t('bookingList.successMessage'),
                    typeAlert: 'Confirm',
                    onConfirm: () => { getListBookingManager() },
                });

            } else {
                alertService.showAlert({
                    title: t('bookingList.errorTitle'),
                    message: t('bookingList.errorMessage'),
                    typeAlert: 'Error',
                    onConfirm: () => { },
                });
            }
        });
    };

    const handleMainAction = (item: any) => {
        getDetailBookingItem(item.id);
        if (item.status === 0) {
            getListService(item.bookingDate, item.bookingHours);
            setIsCheckinBookingModalVisible(true);
        } else if (item.status === 1 || item.status === 2) {
            getListService(item.bookingDate, item.bookingHours);
            getListPaymentType();
            setIsBookingPaymentModalVisible(true);
        }
    };

    const nameAction = (status: number) => {
        if (status === 0) {
            return t('bookingList.checkingBooking');
        } else if (status === 1 || status === 2) {
            return t('bookingList.paymentBooking');
        }
    };
    const renderBookingItem = ({ item }: { item: BookingManagerItem }) => {
        const statusColor = getBookingStatusColor(item.status, colors, 'border');
        const formattedDate = formatDate(item.bookingDate);
        const nameService = item.services.map((service) => service.serviceName).join(', ');
        return (
            <View style={styles.bookingCard}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.statusBadge, { borderColor: statusColor, borderWidth: 1 }]}>
                            <TextFieldLabel style={[styles.statusText, { color: statusColor }]}>{item.statusObj.name}</TextFieldLabel>
                        </View>
                        {isTablet && (
                            <TextFieldLabel style={styles.bookingId}>{item.code}</TextFieldLabel>
                        )}
                    </View>
                    <TextFieldLabel style={styles.dateText}>{formattedDate}</TextFieldLabel>
                </View>

                <View style={styles.infoRow}>
                    <User size={16} color={colors.text} />
                    <TextFieldLabel style={styles.infoText}>{item.customer.name}</TextFieldLabel>
                    <TextFieldLabel style={styles.phoneText}>{item.customer.phoneNumber}</TextFieldLabel>
                </View>

                <View style={styles.infoRow}>
                    <Info size={16} color={colors.text} />
                    <TextFieldLabel style={styles.infoText}>{nameService}</TextFieldLabel>
                </View>

                {item.bookingHours && (
                    <View style={styles.infoRow}>
                        <Calendar size={16} color={colors.text} />
                        <TextFieldLabel style={styles.infoText}>
                            {formattedDate} {item.bookingHours}
                        </TextFieldLabel>
                    </View>
                )}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleView(item)}
                    >
                        <Eye size={18} color={colors.text} />
                    </TouchableOpacity>
                    {item.status === 0 && (
                        <React.Fragment>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => handleEdit(item)}
                            >
                                <Pencil size={18} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, styles.deleteButton]}
                                onPress={() => handleDelete(item)}
                            >
                                <Ban size={18} color={colors.red} />
                            </TouchableOpacity>
                        </React.Fragment>
                    )}
                    {(item.status === 0 || item.status === 1 || item.status === 2) && (
                        <TouchableOpacity
                            style={[styles.mainActionButton, { backgroundColor: item.status === 0 ? colors.blue : colors.yellow }]}
                            onPress={() => handleMainAction(item)}
                        >
                            <TextFieldLabel style={[styles.mainActionText, { color: colors.white }]}>{nameAction(item.status)}</TextFieldLabel>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const handleLoadMore = useCallback(() => {
        if (isLoadingMoreRef.current || loadingMore || loading) {
            return;
        }

        const canLoadMore = totalPages > 0 && pageIndex < totalPages;

        if (canLoadMore) {
            isLoadingMoreRef.current = true;
            loadMoreBookings()
                .catch((error) => {
                    alertService.showAlert({
                        title: t('bookingList.errorTitle'),
                        message: t('bookingList.errorMessage'),
                        typeAlert: 'Error',
                        onConfirm: () => { },
                    });
                })
                .finally(() => {
                    isLoadingMoreRef.current = false;
                });
        }
    }, [loadingMore, loading, pageIndex, totalPages, loadMoreBookings, listBookingManager.length]);

    const hasMoreData = totalPages > 0 && pageIndex < totalPages;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            resetPagination();
            await getListBookingManager();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, [getListBookingManager, resetPagination]);

    useFocusEffect(useCallback(() => {
        getListBookingManager();
    }, [navigation]));

    return (
        <>
            <FlatList
                data={listBookingManager}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBookingItem}
                numColumns={isTablet ? 3 : 1}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.yellow]}
                        tintColor={colors.yellow}
                    />
                }
                ListEmptyComponent={

                    <View style={styles.emptyContainer}>

                        <AutoImage source={require('@assets/icon/no_data.png')} style={styles.emptyImage} />

                        <TextFieldLabel style={styles.emptyText}>{t('bookingList.noBookingFound')}</TextFieldLabel>

                    </View>
                }
                ListFooterComponent={
                    loadingMore && hasMoreData ? (
                        <View style={styles.footerLoader}>
                            <TextFieldLabel style={styles.footerText}>{t('bookingList.loadingMore')}</TextFieldLabel>
                        </View>
                    ) : null
                }
            />

            <BookingConfirmationModal
                visible={isBookingConfirmationModalVisible}
                onClose={() => setIsBookingConfirmationModalVisible(false)}
                onConfirm={() => { }}
            />

            <CheckinBookingModal
                visible={isCheckinBookingModalVisible}
                onClose={() => setIsCheckinBookingModalVisible(false)}
                onConfirm={() => { }}
            />

            <BookingPaymentModal
                visible={isBookingPaymentModalVisible}
                onClose={() => setIsBookingPaymentModalVisible(false)}
                onConfirm={() => { getListBookingManager() }}
            />
            <Loader loading={loading} title={t('bookingList.loading')} />
        </>
    );
};

const $styles = (colors: Colors, isTablet: boolean) =>
    StyleSheet.create({
        listContainer: {
            padding: 16,
            paddingBottom: 32,
        },
        columnWrapper: {
            justifyContent: 'space-between',
        },
        bookingCard: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 0.2,
            borderColor: colors.border,
            ...(isTablet && {
                width: '33%',
            }),
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
        },
        headerLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginRight: 8,
            minWidth: 100,
            textAlign: "center",
        },
        statusText: {
            color: colors.white,
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
        },
        bookingId: {
            fontSize: 14,
            color: colors.text,
            fontWeight: "500",
        },
        dateText: {
            fontSize: 14,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        infoText: {
            fontSize: 14,
            color: colors.text,
            marginLeft: 8,
            flex: 1,
        },
        phoneText: {
            fontSize: 14,
            color: colors.text,
            marginLeft: 8,
        },
        actionButtons: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            gap: 8,
        },
        iconButton: {
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: colors.backgroundDisabled,
            justifyContent: "center",
            alignItems: "center",
        },
        deleteButton: {
            backgroundColor: colors.backgroundDisabled,
        },
        mainActionButton: {
            flex: 1,
            height: 36,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "auto",
            maxWidth: 150,
        },
        mainActionText: {
            color: colors.black,
            fontSize: 14,
            fontWeight: "600",
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 16,
            color: colors.text,
        },
        emptyImage: {
            width: 100,
            height: 100,
            marginBottom: 16,
        },
        footerLoader: {
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        footerText: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.6,
        },
    });

export default BookingListComponent;
