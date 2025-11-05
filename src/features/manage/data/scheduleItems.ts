export type ScheduleItem = {
  id: string;
  userId: string;
  startTime: string; // HHmm
  endTime: string; // HHmm
  title: string;
  color: string;
  borderColor: string;
};

export const scheduleItems: ScheduleItem[] = [
  {
    id: '1',
    userId: '1',
    startTime: '0900',
    endTime: '0930',
    title: 'Chăm sóc móng',
    color: '#E1F5FE',
    borderColor: '#4FC3F7',
  },
  {
    id: '2',
    userId: '3',
    startTime: '1300',
    endTime: '1430',
    title: 'Làm móng tay',
    color: '#E8F5E9',
    borderColor: '#66BB6A',
  },
  {
    id: '3',
    userId: '2',
    startTime: '1100',
    endTime: '1200',
    title: 'Đánh giá sản phẩm',
    color: '#FFF3E0',
    borderColor: '#FFB74D',
  },
  {
    id: '4',
    userId: '5',
    startTime: '1400',
    endTime: '1600',
    title: 'Tư vấn',
    color: '#F3E5F5',
    borderColor: '#AB47BC',
  },
  {
    id: '5',
    userId: '6',
    startTime: '1000',
    endTime: '1030',
    title: 'Sửa móng tay',
    color: '#E1F5FE',
    borderColor: '#4FC3F7',
  },
  {
    id: '6',
    userId: '1',
    startTime: '1100',
    endTime: '1230',
    title: 'Đính đá móng',
    color: '#E1F5FE',
    borderColor: '#4FC3F7',
  },
  {
    id: '7',
    userId: '6',
    startTime: '2000',
    endTime: '2030',
    title: 'Nối + dưỡng móng',
    color: '#E1F5FE',
    borderColor: '#4FC3F7',
  },
];
