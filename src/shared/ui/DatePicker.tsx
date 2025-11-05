import React, { memo, useCallback, useMemo, useState } from "react";
import { Modal, ModalProps, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps extends Partial<ModalProps> {
  /** Giá trị ngày giờ hiện tại */
  value: Date;
  /** Chế độ hiển thị của picker */
  mode?: DatePickerMode;
  /** Ngày tối thiểu có thể chọn */
  minimumDate?: Date;
  /** Ngày tối đa có thể chọn */
  maximumDate?: Date;
  /** Trạng thái hiển thị của modal */
  visible: boolean;
  /** Callback khi người dùng chọn ngày giờ */
  onChange: (date: Date) => void;
  /** Callback khi người dùng đóng picker */
  onClose: () => void;
  /** Tiêu đề của modal */
  title?: string;
  /** Text cho nút xác nhận */
  confirmText?: string;
  /** Text cho nút hủy */
  cancelText?: string;
  /** Có thể chọn ngày giờ trong tương lai không */
  allowFutureDates?: boolean;
  /** Có thể chọn ngày giờ trong quá khứ không */
  allowPastDates?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = memo(({
  value,
  mode = "datetime",
  minimumDate,
  maximumDate,
  visible,
  onChange,
  onClose,
  title = "Chọn thời gian",
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  allowFutureDates = true,
  allowPastDates = true,
  ...rest
}) => {
  // Tự động tính toán min/max date dựa trên props
  const getMinimumDate = useCallback((): Date | undefined => {
    if (minimumDate) return minimumDate;
    if (!allowPastDates) return new Date();
    return undefined;
  }, [minimumDate, allowPastDates]);

  const getMaximumDate = useCallback((): Date | undefined => {
    if (maximumDate) return maximumDate;
    if (!allowFutureDates) return new Date();
    return undefined;
  }, [maximumDate, allowFutureDates]);

  const initialDate = useMemo(() => value ?? new Date(), [value]);
  const resolvedMode = useMemo(() => {
    if (Platform.OS === 'android' && mode === 'datetime') return 'date';
    return mode;
  }, [mode]);
  const [tempDate, setTempDate] = useState<Date>(initialDate);

  const handlePickerChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
      onClose();
      return;
    }
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  }, [onChange, onClose]);

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    onClose();
  }, [tempDate, onChange, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      {Platform.OS === 'ios' ? (
        <Modal
          transparent
          animationType="slide"
          visible={visible}
          onRequestClose={handleCancel}
          {...rest}
        >
          <View style={styles.backdrop}>
            <View style={styles.container}>
              <View style={styles.header}>
                <Pressable onPress={handleCancel} hitSlop={8}>
                  <Text style={styles.actionText}>{cancelText}</Text>
                </Pressable>
                <Text style={styles.title}>{title}</Text>
                <Pressable onPress={handleConfirm} hitSlop={8}>
                  <Text style={styles.actionText}>{confirmText}</Text>
                </Pressable>
              </View>
              <RNDateTimePicker
                value={tempDate}
                mode={resolvedMode as any}
                display="spinner"
                minimumDate={getMinimumDate()}
                maximumDate={getMaximumDate()}
                onChange={handlePickerChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        visible && (
          <RNDateTimePicker
            value={value}
            mode={resolvedMode as any}
            display="default"
            minimumDate={getMinimumDate()}
            maximumDate={getMaximumDate()}
            onChange={handlePickerChange}
          />
        )
      )}
    </>
  );
});

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionText: {
    color: '#007AFF',
    fontSize: 15,
  },
  picker: {
    backgroundColor: '#fff',
  },
});
