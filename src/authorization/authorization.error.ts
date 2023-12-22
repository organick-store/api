export class AuthorizationError extends Error {
  constructor (message: string) {
    super(message);
  }

  public static UserAlreadyExists() {
    return new AuthorizationError('User already exists');
  }

  public static WrongPassword() {
    return new AuthorizationError('Wrong password');
  }

  public static UserNotFound() {
    return new AuthorizationError('User not found');
  }

  public static AuthorizationHeaderNotFound() {
    return new AuthorizationError('Authorization header not found');
  }

  public static InvalidToken() {
    return new AuthorizationError('Invalid token');
  }
}