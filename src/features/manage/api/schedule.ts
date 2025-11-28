import type {ScheduleItem} from '../data/scheduleItems';

export const parseHour = (hhmm: string): number =>
  parseInt(hhmm.substring(0, 2));
export const parseMinute = (hhmm: string): number =>
  parseInt(hhmm.substring(2, 4));
export const toDecimalHour = (hhmm: string): number =>
  parseHour(hhmm) + parseMinute(hhmm) / 60;

export const formatTime = (time24h: string): string => {
  const hours = parseInt(time24h.substring(0, 2));
  const minutes = time24h.substring(2, 4);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
};

export const isWorkingHours = (
  slotTimeHHmm: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): boolean => {
  const slotHour = parseInt(slotTimeHHmm.substring(0, 2));
  const slotMinutes = parseInt(slotTimeHHmm.substring(2, 4));
  const slotTimeDecimal = slotHour + slotMinutes / 60;

  const startTimeDecimal = startHour + startMinute / 60;
  const endTimeDecimal = endHour + endMinute / 60;

  return (
    (slotTimeDecimal >= startTimeDecimal && slotTimeDecimal < endTimeDecimal) ||
    (slotHour === startHour && slotMinutes === 0)
  );
};

export const getScheduleBlocksForHour = (
  items: ScheduleItem[],
  userId: string,
  timeSlotHHmm: string,
) => {
  const timeSlotHour = parseInt(timeSlotHHmm.substring(0, 2));
  const timeSlotMinutes = parseInt(timeSlotHHmm.substring(2, 4));
  const timeSlotStart = timeSlotHour + timeSlotMinutes / 60;
  const timeSlotEnd = timeSlotStart + 1;

  const filtered = items.filter(item => {
    if (item.userId !== userId) return false;

    const startHours = parseInt(item.startTime.substring(0, 2));
    const startMinutes = parseInt(item.startTime.substring(2, 4));

    const itemStartDecimal = startHours + startMinutes / 60;

    return itemStartDecimal >= timeSlotStart && itemStartDecimal < timeSlotEnd;
  });

  return filtered
    .map((item, index) => {
      const startHours = parseInt(item.startTime.substring(0, 2));
      const startMinutes = parseInt(item.startTime.substring(2, 4));
      const endHours = parseInt(item.endTime.substring(0, 2));
      const endMinutes = parseInt(item.endTime.substring(2, 4));

      const startDecimal = startHours + startMinutes / 60;
      const endDecimal = endHours + endMinutes / 60;
      const duration = endDecimal - startDecimal;
      const calculatedHeight = duration * 100;
      const heightInPixels = Math.max(calculatedHeight, 25);

      return {item, index, heightInPixels};
    })
    .filter(Boolean) as {
    item: ScheduleItem;
    index: number;
    heightInPixels: number;
  }[];
};
