import { formatDate, loadDateFnsLocale } from '../formatDate';

// Mock i18next
jest.mock('i18next', () => ({
  language: 'vi',
}));

describe('formatDate', () => {
  beforeEach(() => {
    loadDateFnsLocale();
  });

  it('should format date with default format', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);

    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('should format date with custom format', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date, 'dd/MM/yyyy');

    expect(formatted).toBe('15/01/2024');
  });

  it('should format date with time format', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date, 'dd/MM/yyyy HH:mm');

    expect(formatted).toContain('15/01/2024');
  });

  it('should handle different date formats', () => {
    const date1 = '2024-12-25T00:00:00Z';
    const date2 = '2024-06-01T12:00:00Z';

    const formatted1 = formatDate(date1, 'dd/MM/yyyy');
    const formatted2 = formatDate(date2, 'dd/MM/yyyy');

    expect(formatted1).toBe('25/12/2024');
    expect(formatted2).toBe('01/06/2024');
  });

  it('should handle options parameter', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date, 'dd/MM/yyyy', {});

    expect(formatted).toBe('15/01/2024');
  });
});

