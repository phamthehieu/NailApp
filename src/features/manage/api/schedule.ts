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
    const endHours = parseInt(item.endTime.substring(0, 2));
    const endMinutes = parseInt(item.endTime.substring(2, 4));

    const itemStartDecimal = startHours + startMinutes / 60;
    const itemEndDecimal = endHours + endMinutes / 60;

    // Kiểm tra xem item có overlap với timeSlot không
    return (
      itemStartDecimal >= timeSlotStart && itemStartDecimal < timeSlotEnd ||
      (itemStartDecimal < timeSlotStart && itemEndDecimal > timeSlotStart)
    );
  });

  // Sắp xếp các items theo thời gian bắt đầu
  const sorted = filtered.sort((a, b) => {
    const aStart = parseInt(a.startTime.substring(0, 2)) + parseInt(a.startTime.substring(2, 4)) / 60;
    const bStart = parseInt(b.startTime.substring(0, 2)) + parseInt(b.startTime.substring(2, 4)) / 60;
    return aStart - bStart;
  });

  // Tính toán index cho các items chồng lấn nhau
  const blocks: Array<{item: ScheduleItem; index: number; heightInPixels: number}> = [];
  const columns: Array<Array<ScheduleItem>> = [];

  sorted.forEach(item => {
    const startHours = parseInt(item.startTime.substring(0, 2));
    const startMinutes = parseInt(item.startTime.substring(2, 4));
    const endHours = parseInt(item.endTime.substring(0, 2));
    const endMinutes = parseInt(item.endTime.substring(2, 4));

    const startDecimal = startHours + startMinutes / 60;
    const endDecimal = endHours + endMinutes / 60;
    const duration = endDecimal - startDecimal;
    const calculatedHeight = duration * 100;
    const heightInPixels = Math.max(calculatedHeight, 25);

    // Tìm cột đầu tiên không có overlap với item này
    let columnIndex = 0;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const hasOverlap = column.some(existingItem => {
        const existingStart = parseInt(existingItem.startTime.substring(0, 2)) + 
                             parseInt(existingItem.startTime.substring(2, 4)) / 60;
        const existingEnd = parseInt(existingItem.endTime.substring(0, 2)) + 
                           parseInt(existingItem.endTime.substring(2, 4)) / 60;
        
        // Kiểm tra overlap: một trong hai item bắt đầu trước khi item kia kết thúc
        return !(endDecimal <= existingStart || startDecimal >= existingEnd);
      });

      if (!hasOverlap) {
        columnIndex = i;
        break;
      }
      columnIndex = i + 1;
    }

    // Tạo cột mới nếu cần
    if (columnIndex >= columns.length) {
      columns.push([]);
    }

    columns[columnIndex].push(item);
    blocks.push({item, index: columnIndex, heightInPixels});
  });

  return blocks;
};
