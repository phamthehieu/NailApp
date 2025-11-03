export type Credentials = {
    username: string;
    password: string;
};

export type ValidationMessages = {
    usernameRequired: string;
    passwordRequired: string;
    passwordMin: string;
};

export function validateCredentials(
    { username, password }: Credentials,
    messages: ValidationMessages
) {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
        errors.username = messages.usernameRequired;
    }
    if (!password) {
        errors.password = messages.passwordRequired;
    } else if (password.length < 6) {
        errors.password = messages.passwordMin;
    }
    return errors;
}


