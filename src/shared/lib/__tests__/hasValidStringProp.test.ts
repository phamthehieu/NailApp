import { hasValidStringProp } from '../hasValidStringProp';

describe('hasValidStringProp', () => {
  it('should return true for valid string property', () => {
    const obj = { name: 'John' };
    expect(hasValidStringProp(obj, 'name')).toBe(true);
  });

  it('should return false for undefined property', () => {
    const obj: any = {};
    expect(hasValidStringProp(obj, 'name')).toBe(false);
  });

  it('should return false for null property', () => {
    const obj = { name: null };
    expect(hasValidStringProp(obj, 'name')).toBe(false);
  });

  it('should return true for empty string (only checks type, not content)', () => {
    const obj = { name: '' };
    // Note: hasValidStringProp only checks if it's a string type, not if it's empty
    expect(hasValidStringProp(obj, 'name')).toBe(true);
  });

  it('should return true for whitespace-only string (only checks type)', () => {
    const obj = { name: '   ' };
    // Note: hasValidStringProp only checks if it's a string type, not if it's empty
    expect(hasValidStringProp(obj, 'name')).toBe(true);
  });

  it('should return true for string with content', () => {
    const obj = { name: '  John  ' };
    expect(hasValidStringProp(obj, 'name')).toBe(true);
  });

  it('should return false for non-string property', () => {
    const obj = { name: 123 };
    expect(hasValidStringProp(obj, 'name')).toBe(false);
  });

  it('should return false for boolean property', () => {
    const obj = { name: true };
    expect(hasValidStringProp(obj, 'name')).toBe(false);
  });
});

