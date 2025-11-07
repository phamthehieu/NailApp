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
  },
  loading: {
    processing: 'Đang xử lý...',
  },
  chooseShop: {
    chooseShop: 'Chọn cửa hàng',
    searchPlaceholder: 'Tìm kiếm cửa hàng',
    noShopFound: 'Không tìm thấy cửa hàng',
  },
  errorScreen: {
    title: 'Đã xảy ra lỗi',
    friendlySubtitle: 'Vui lòng thử lại sau',
    reset: 'Thử lại',
  },
  network: {
    noConnection: 'Không có kết nối mạng',
    noConnectionMessage: 'Vui lòng kiểm tra kết nối internet của bạn',
    checkConnection: 'Kiểm tra kết nối',
    connectionRestored: 'Kết nối mạng đã được khôi phục',
  },
  emptyStateComponent: {
    generic: {
      heading: 'Không tìm thấy dữ liệu',
      content: 'Vui lòng thử lại sau',
      button: 'Thử lại',
    },
  },
  bookingManage: {
    title: 'Quản lý đặt lịch',
    searchPlaceholder: 'Tìm kiếm đặt lịch',
    selectMonthAndYear: 'Chọn tháng và năm',
    month: 'Tháng',
    year: 'Năm',
    cancel: 'Hủy',
    done: 'Xong',
  },
  bottomNavigator: {
    bookingManage: 'Quản lý',
    report: 'Báo cáo',
    system: 'Hệ thống',
    account: 'Tài khoản',
  },
  calenderHeader: {
    day: 'Ngày',
    week: 'Tuần',
    month: 'Tháng',
    searchPlaceholder: 'Tìm kiếm...',
    search: 'Tìm kiếm',
    title: 'Chọn ngày',
    confirm: 'Đồng ý',
    cancel: 'Hủy',
    selectWeek: 'Chọn tuần trong tháng',
    selectMonth: 'Chọn tháng',
    selectYear: 'Chọn năm',
    selectDay: 'Chọn ngày',
    today: 'Hôm nay',
    year: 'Năm',
    range: 'Phạm vi',
  },
};

export default vi;
export type Translations = typeof vi;
