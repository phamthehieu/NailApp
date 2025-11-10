import {Translations} from './vi';

const en: Translations = {
    splash: {
        version: 'Version: {{version}}',
    },
    login: {
        hello: 'Hello',
        username: 'Username',
        usernamePlaceholder: 'Enter your username',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        loginButton: 'Login',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        usernameRequired: 'Please enter your username',
        passwordRequired: 'Please enter your password',
        passwordMin: 'Password must be at least 6 characters',
    },
    checkin: {
        checkin: 'Verify appointment',
        sologanhapsoDT: 'Please enter your phone number to verify your appointment',
        nhapsoDT: 'Enter phone number',
        confirmButton: 'Confirm booking',
    },
    loading: {
        processing: 'Processing...',
    },
    chooseShop: {
        chooseShop: 'Choose shop',
        searchPlaceholder: 'Search shop',
        noShopFound: 'No shop found',
    },
    errorScreen: {
        title: 'Oops!',
        friendlySubtitle: 'Something went wrong. Please try again later.',
        reset: 'Reset',
    },
    network: {
        noConnection: 'No network connection',
        noConnectionMessage: 'Please check your internet connection',
        checkConnection: 'Check connection',
        connectionRestored: 'Network connection restored',
    },
    emptyStateComponent: {
        generic: {
          heading: 'Không tìm thấy dữ liệu',
          content: 'Vui lòng thử lại sau',
          button: 'Thử lại',
        },
      },
    bookingManage: {
        title: 'Booking Management',
        searchPlaceholder: 'Search booking',
        selectMonthAndYear: 'Select month and year',
        month: 'Month',
        year: 'Year',
        cancel: 'Cancel',
        done: 'Done',
    },
    bottomNavigator: {
        bookingManage: 'Booking Management',
        report: 'Report',
        system: 'System',
        account: 'Account',
    },
    calenderDashboard: {
        calenderHeader: {
            day: 'Day',
            week: 'Week',
            month: 'Month',
            searchPlaceholder: 'Search...',
            search: 'Search',
            title: 'Select date',
            confirm: 'Confirm',
            cancel: 'Cancel',
            selectWeek: 'Select week in month',
            selectMonth: 'Select month',
            selectYear: 'Select year',
            selectDay: 'Select day',
            today: 'Today',
            year: 'Year',
            range: 'Range',
            monthPicker: 'Select month',
            yearPicker: 'Select year',
        },
        calenderTab: {
            schedule: 'Schedule',
            list: 'List',
            book: 'Book',
        },
        calenderMonth: {
            title: 'Month',
            year: 'Year',
            month: 'Month',
            day: 'Day',
            week: 'Week',
            dayName: "Thứ {dayName}",
        },
    }
};

export default en;
