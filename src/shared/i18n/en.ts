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
};

export default en;
