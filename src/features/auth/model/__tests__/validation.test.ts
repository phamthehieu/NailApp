import { validateCredentials, Credentials, ValidationMessages } from '../validation';

describe('validateCredentials', () => {
  const messages: ValidationMessages = {
    usernameRequired: 'Tên đăng nhập là bắt buộc',
    passwordRequired: 'Mật khẩu là bắt buộc',
    passwordMin: 'Mật khẩu phải có ít nhất 6 ký tự',
  };

  it('should return no errors for valid credentials', () => {
    const credentials: Credentials = {
      username: 'testuser',
      password: 'password123',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors).toEqual({});
  });

  it('should return error when username is empty', () => {
    const credentials: Credentials = {
      username: '',
      password: 'password123',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.username).toBe(messages.usernameRequired);
    expect(errors.password).toBeUndefined();
  });

  it('should return error when username is only whitespace', () => {
    const credentials: Credentials = {
      username: '   ',
      password: 'password123',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.username).toBe(messages.usernameRequired);
  });

  it('should return error when password is empty', () => {
    const credentials: Credentials = {
      username: 'testuser',
      password: '',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.password).toBe(messages.passwordRequired);
    expect(errors.username).toBeUndefined();
  });

  it('should return error when password is too short', () => {
    const credentials: Credentials = {
      username: 'testuser',
      password: '12345',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.password).toBe(messages.passwordMin);
  });

  it('should return error when password is exactly 5 characters', () => {
    const credentials: Credentials = {
      username: 'testuser',
      password: '12345',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.password).toBe(messages.passwordMin);
  });

  it('should not return error when password is exactly 6 characters', () => {
    const credentials: Credentials = {
      username: 'testuser',
      password: '123456',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.password).toBeUndefined();
  });

  it('should return multiple errors when both fields are invalid', () => {
    const credentials: Credentials = {
      username: '',
      password: '123',
    };

    const errors = validateCredentials(credentials, messages);

    expect(errors.username).toBe(messages.usernameRequired);
    expect(errors.password).toBe(messages.passwordMin);
  });
});

