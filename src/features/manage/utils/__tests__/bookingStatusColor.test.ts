import { getBookingStatusColor } from '../bookingStatusColor';
import { colors } from '@/shared/theme/colors';

describe('getBookingStatusColor', () => {
  const mockColors = colors;

  it('should return correct color for status 0 (blue)', () => {
    const color = getBookingStatusColor(0, mockColors);
    expect(color).toBe(mockColors.blue);
  });

  it('should return correct color for status 1 (yellow)', () => {
    const color = getBookingStatusColor(1, mockColors);
    expect(color).toBe(mockColors.yellow);
  });

  it('should return correct color for status 2 (purple)', () => {
    const color = getBookingStatusColor(2, mockColors);
    expect(color).toBe(mockColors.purple);
  });

  it('should return correct color for status 3 (green)', () => {
    const color = getBookingStatusColor(3, mockColors);
    expect(color).toBe(mockColors.green);
  });

  it('should return correct color for status 5 (red)', () => {
    const color = getBookingStatusColor(5, mockColors);
    expect(color).toBe(mockColors.red);
  });

  it('should return correct color for status name "Chờ xác nhận"', () => {
    const color = getBookingStatusColor('Chờ xác nhận', mockColors);
    expect(color).toBe(mockColors.blue);
  });

  it('should return correct color for status name "Đã hủy"', () => {
    const color = getBookingStatusColor('Đã hủy', mockColors);
    expect(color).toBe(mockColors.red);
  });

  it('should return fallback color for unknown status', () => {
    const color = getBookingStatusColor(999, mockColors);
    expect(color).toBe(mockColors.yellow); // default fallback
  });

  it('should return fallback color for null status', () => {
    const color = getBookingStatusColor(null, mockColors);
    expect(color).toBe(mockColors.yellow);
  });

  it('should return fallback color for undefined status', () => {
    const color = getBookingStatusColor(undefined, mockColors);
    expect(color).toBe(mockColors.yellow);
  });

  it('should use custom fallback color', () => {
    const color = getBookingStatusColor(999, mockColors, 'red');
    expect(color).toBe(mockColors.red);
  });

  it('should handle status name with whitespace', () => {
    const color = getBookingStatusColor('  Chờ xác nhận  ', mockColors);
    expect(color).toBe(mockColors.blue);
  });
});

