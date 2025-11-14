import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModalProps } from "react-native";
import DatePicker from 'react-native-date-picker';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps extends Partial<ModalProps> {
  value: Date;
  mode?: DatePickerMode;
  minimumDate?: Date;
  maximumDate?: Date;
  visible: boolean;
  onChange: (date: Date) => void;
  onClose: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  allowFutureDates?: boolean;
  allowPastDates?: boolean;
  autoCloseOnConfirm?: boolean;
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
  autoCloseOnConfirm = true,
  ...rest
}) => {
  const resolvedMin = useMemo((): Date | undefined => {
    if (minimumDate) return minimumDate;
    if (!allowPastDates) return new Date();
    return undefined;
  }, [minimumDate, allowPastDates]);

  const resolvedMax = useMemo((): Date | undefined => {
    if (maximumDate) return maximumDate;
    if (!allowFutureDates) {
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return endOfToday;
    }
    return undefined;
  }, [maximumDate, allowFutureDates]);

  const clampDate = useCallback((d: Date): Date => {
    if (resolvedMin && d < resolvedMin) return resolvedMin;
    if (resolvedMax && d > resolvedMax) return resolvedMax;
    return d;
  }, [resolvedMin, resolvedMax]);

  const initialDate = useMemo(() => {
    const dateToClamp = value ?? new Date();
    return clampDate(dateToClamp);
  }, [value, clampDate]);

  const resolvedMode = useMemo(() => {
    return mode === 'datetime' ? 'datetime' : mode === 'time' ? 'time' : 'date';
  }, [mode]);

  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const prevValueRef = useRef<Date>(value);
  const prevVisibleRef = useRef<boolean>(visible);

  useEffect(() => {
    const valueChanged = prevValueRef.current.getTime() !== value.getTime();
    const visibleChanged = prevVisibleRef.current !== visible;

    if (visible && (visibleChanged || valueChanged)) {
      const dateToClamp = value ?? new Date();
      let clampedValue = dateToClamp;

      if (resolvedMin && dateToClamp < resolvedMin) {
        clampedValue = resolvedMin;
      } else if (resolvedMax && dateToClamp > resolvedMax) {
        clampedValue = resolvedMax;
      }

      setTempDate(clampedValue);
    }

    prevValueRef.current = value;
    prevVisibleRef.current = visible;
  }, [visible, value, resolvedMin, resolvedMax]);

  const handleConfirm = useCallback((selectedDate: Date) => {
    onChange(selectedDate);
    if (autoCloseOnConfirm) {
      onClose();
    }
  }, [onChange, onClose, autoCloseOnConfirm]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <DatePicker
      modal
      open={visible}
      date={tempDate}
      mode={resolvedMode}
      minimumDate={resolvedMin}
      maximumDate={resolvedMax}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      {...rest}
    />
  );
});

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
