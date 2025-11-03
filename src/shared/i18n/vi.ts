const vi = {
  emptyStateComponent: {
    generic: {
      heading: 'Không có dữ liệu',
      content: 'Hiện tại chưa có dữ liệu để hiển thị',
      button: 'Thử lại',
    },
  },
  errorScreen: {
    title: 'Đã xảy ra lỗi',
    friendlySubtitle: 'Có gì đó không ổn. Vui lòng thử lại.',
    reset: 'Thử lại',
  },
  language: {
    selectLanguage: 'Chọn ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    australian: 'Australia',
  },
  login: {
    hello: 'Xin chào bạn!',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    rememberAccount: 'Ghi nhớ tài khoản',
    forgotPassword: 'Quên mật khẩu',
    login: 'Đăng nhập',
    orLoginWith: 'Hoặc đăng nhập với',
    noAccount: 'Chưa có tài khoản?',
    register: 'Đăng ký',
  },
  dateTime: {
    selectTime: 'Chọn giờ',
    selectDate: 'Chọn ngày',
    selectMonthYear: 'Chọn tháng & năm',
    confirm: 'Xác nhận',
    cancel: 'Hủy',
    apply: 'Áp dụng',
    month: 'Tháng',
    year: 'Năm',
    months: {
      january: 'Tháng 1',
      february: 'Tháng 2',
      march: 'Tháng 3',
      april: 'Tháng 4',
      may: 'Tháng 5',
      june: 'Tháng 6',
      july: 'Tháng 7',
      august: 'Tháng 8',
      september: 'Tháng 9',
      october: 'Tháng 10',
      november: 'Tháng 11',
      december: 'Tháng 12',
    },
    weekDays: {
      sun: 'CN',
      mon: 'T2',
      tue: 'T3',
      wed: 'T4',
      thu: 'T5',
      fri: 'T6',
      sat: 'T7',
    },
  },
};

export default vi;
export type Translations = typeof vi;
