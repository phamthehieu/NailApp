const vi = {
  splash: {
    version: 'Phiên bản: {{version}}',
  },
  login: {
    hello: 'Xin chào',
    username: 'Tên đăng nhập',
    usernamePlaceholder: 'Nhập tên đăng nhập',
    password: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    loginButton: 'Đăng nhập',
    rememberMe: 'Lưu tài khoản',
    forgotPassword: 'Quên mật khẩu?',
    usernameRequired: 'Vui lòng nhập tên đăng nhập',
    passwordRequired: 'Vui lòng nhập mật khẩu',
    passwordMin: 'Mật khẩu phải có ít nhất 6 ký tự',
  },
  checkin: {
    checkin: 'Xác thực đặt lịch',
    sologanhapsoDT: 'Vui lòng nhập số điện thoại đã đặt lịch của bạn để cửa hàng có thể xác thực',
    nhapsoDT: 'Nhập số điện thoại',
    confirmButton: 'Xác nhận đặt lịch',
  }
};

export default vi;
export type Translations = typeof vi;
