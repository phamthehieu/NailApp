# Hướng dẫn Unit Testing cho NailApp

## Tổng quan

Dự án này sử dụng **Jest** và **React Native Testing Library** để viết và chạy unit tests.

## Cài đặt

Các thư viện testing đã được cài đặt trong `package.json`. Chạy lệnh sau để cài đặt:

```bash
npm install
```

## Cấu trúc Test

Tests được tổ chức theo cấu trúc sau:

```
src/
  features/
    auth/
      model/
        __tests__/
          authSlice.test.ts
          validation.test.ts
  shared/
    lib/
      __tests__/
        formatDate.test.ts
        hasValidStringProp.test.ts
    ui/
      __tests__/
        Button.test.tsx
```

## Chạy Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy tests ở chế độ watch (tự động chạy lại khi có thay đổi)
```bash
npm run test:watch
```

### Chạy tests với coverage report
```bash
npm run test:coverage
```

### Chạy một file test cụ thể
```bash
npm test -- authSlice.test.ts
```

### Chạy tests với pattern
```bash
npm test -- --testNamePattern="should set credentials"
```

## Viết Tests

### 1. Test Redux Slices

Ví dụ test cho Redux slice:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials } from '../authSlice';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  it('should set credentials correctly', () => {
    store.dispatch(setCredentials({ token: 'test-token' }));
    const state = store.getState().auth;
    expect(state.token).toBe('test-token');
  });
});
```

### 2. Test Utility Functions

Ví dụ test cho utility function:

```typescript
import { validateCredentials } from '../validation';

describe('validateCredentials', () => {
  it('should return no errors for valid credentials', () => {
    const errors = validateCredentials(
      { username: 'test', password: 'password123' },
      messages
    );
    expect(errors).toEqual({});
  });
});
```

### 3. Test React Components

Ví dụ test cho component:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button text="Click" onPress={onPress} />);
    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 4. Test Hooks

Để test hooks, sử dụng `@testing-library/react-hooks` hoặc render hook trong component test:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthForm } from '../useAuthForm';

describe('useAuthForm', () => {
  it('should validate credentials', () => {
    const { result } = renderHook(() => useAuthForm(messages));
    act(() => {
      result.current.setUsername('test');
      result.current.setPassword('password');
    });
    const isValid = result.current.validate();
    expect(isValid).toBe(true);
  });
});
```

## Best Practices

### 1. Tên Test rõ ràng
- Sử dụng mô tả rõ ràng về hành vi được test
- Ví dụ: `should return error when username is empty`

### 2. Arrange-Act-Assert Pattern
```typescript
it('should calculate total correctly', () => {
  // Arrange: Chuẩn bị dữ liệu
  const items = [1, 2, 3];
  
  // Act: Thực hiện hành động
  const total = calculateTotal(items);
  
  // Assert: Kiểm tra kết quả
  expect(total).toBe(6);
});
```

### 3. Test một điều tại một thời điểm
- Mỗi test nên kiểm tra một hành vi cụ thể
- Tránh test quá nhiều thứ trong một test case

### 4. Sử dụng beforeEach/afterEach
- Setup và cleanup code chung cho các tests

### 5. Mock external dependencies
- Mock API calls, storage, navigation, etc.
- Sử dụng `jest.mock()` để mock modules

## Coverage Goals

Dự án đặt mục tiêu coverage tối thiểu:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Xem coverage report sau khi chạy `npm run test:coverage`

## Mocks đã được cấu hình

Các mocks sau đã được setup trong `jest.setup.js`:
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-gesture-handler`
- `react-native-keychain`
- `react-native-mmkv`
- `react-native-device-info`
- `react-native-localize`
- `@react-native-community/netinfo`
- `lottie-react-native`
- `i18next` và `react-i18next`

## Troubleshooting

### Test không chạy được
1. Xóa cache: `npm test -- --clearCache`
2. Xóa node_modules và cài lại: `rm -rf node_modules && npm install`

### Import errors
- Kiểm tra `jest.config.js` có đúng path mapping không
- Kiểm tra `babel.config.js` có đúng alias không

### Mock không hoạt động
- Kiểm tra mock được đặt trong `jest.setup.js` hoặc ở đầu file test
- Đảm bảo mock được định nghĩa trước khi import module

## Tài liệu tham khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Redux](https://redux.js.org/usage/writing-tests)

