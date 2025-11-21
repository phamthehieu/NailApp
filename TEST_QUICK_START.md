# Hướng dẫn nhanh - Unit Testing

## 🚀 Bắt đầu nhanh

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy tất cả tests
```bash
npm test
```

### 3. Chạy tests với coverage
```bash
npm run test:coverage
```

### 4. Chạy tests ở chế độ watch
```bash
npm run test:watch
```

## 📝 Các test đã được tạo

### ✅ Redux Slices
- `src/features/auth/model/__tests__/authSlice.test.ts` - Test cho auth slice (setCredentials, setUserInfo, clearAuthState)

### ✅ Utility Functions
- `src/features/auth/model/__tests__/validation.test.ts` - Test validation credentials
- `src/shared/lib/__tests__/formatDate.test.ts` - Test format date functions
- `src/shared/lib/__tests__/hasValidStringProp.test.ts` - Test string property validation
- `src/features/manage/utils/__tests__/bookingStatusColor.test.ts` - Test booking status color mapping

### ✅ Components
- `src/shared/ui/__tests__/Button.test.tsx` - Test Button component

## 🎯 Chạy test cụ thể

### Chạy một file test
```bash
npm test -- validation.test.ts
```

### Chạy tests với pattern
```bash
npm test -- --testNamePattern="should set credentials"
```

### Chạy tests trong một thư mục
```bash
npm test -- src/features/auth
```

## 📊 Coverage Report

Sau khi chạy `npm run test:coverage`, bạn sẽ thấy:
- Coverage report trong terminal
- HTML report trong thư mục `coverage/`

Mục tiêu coverage hiện tại: **50%** cho tất cả metrics

## ⚠️ Lưu ý

1. **Một số tests có thể cần mock thêm** - Nếu gặp lỗi, kiểm tra `jest.setup.js` để thêm mocks cần thiết

2. **Tests cho components phức tạp** - Các component có nhiều dependencies có thể cần mock thêm navigation, Redux store, etc.

3. **Tests cho hooks** - Sử dụng `@testing-library/react-hooks` hoặc test thông qua component

## 🔧 Troubleshooting

### Test không chạy được
```bash
# Xóa cache
npm test -- --clearCache

# Xóa node_modules và cài lại
rm -rf node_modules && npm install
```

### Lỗi import
- Kiểm tra `jest.config.js` có đúng path mapping
- Kiểm tra `babel.config.js` có đúng alias

## 📚 Tài liệu tham khảo

Xem `README_TESTING.md` để biết chi tiết về cách viết tests và best practices.

