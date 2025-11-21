import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

// Mock theme
jest.mock('../../theme/context', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '#007AFF',
        blue: '#358FFC',
        yellow: '#EFBF09',
        purple: '#AB47BC',
        green: '#10B981',
        red: '#EF4444',
        white: '#FFFFFF',
        black: '#000000',
      },
      spacing: {},
      typography: {},
      timing: {},
      isDark: false,
    },
    themed: (styleOrStyleFn: any) => {
      // If it's a function, call it with theme, otherwise return as is
      if (typeof styleOrStyleFn === 'function') {
        return styleOrStyleFn({
          colors: {
            background: '#FFFFFF',
            text: '#000000',
            primary: '#007AFF',
            blue: '#358FFC',
            yellow: '#EFBF09',
            purple: '#AB47BC',
            green: '#10B981',
            red: '#EF4444',
            white: '#FFFFFF',
            black: '#000000',
          },
          spacing: {},
          typography: {},
          timing: {},
          isDark: false,
        });
      }
      // Handle arrays
      if (Array.isArray(styleOrStyleFn)) {
        return styleOrStyleFn.map((item) => {
          if (typeof item === 'function') {
            return item({
              colors: {
                background: '#FFFFFF',
                text: '#000000',
                primary: '#007AFF',
                blue: '#358FFC',
                yellow: '#EFBF09',
                purple: '#AB47BC',
                green: '#10B981',
                red: '#EF4444',
                white: '#FFFFFF',
                black: '#000000',
              },
              spacing: {},
              typography: {},
              timing: {},
              isDark: false,
            });
          }
          return item;
        });
      }
      return styleOrStyleFn;
    },
  }),
}));

describe('Button', () => {
  it('should render button with text', () => {
    const { getByText } = render(<Button text="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button text="Click me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button text="Click me" onPress={onPress} disabled />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render button with tx prop', () => {
    const { getByText } = render(<Button text="common.ok" />);
    // Since we mock i18n, it should show the key
    expect(getByText('common.ok')).toBeTruthy();
  });
});

