export class StorageService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'current_user';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly KEEP_LOGGED_IN_KEY = 'keep_logged_in';

  private static getSession(): Storage {
    return window.sessionStorage;
  }

  private static getLocal(): Storage {
    return window.localStorage;
  }

  private static usePersistent(): boolean {
    const flag = this.getLocal().getItem(this.KEEP_LOGGED_IN_KEY);
    if (flag === 'true') return true;
    if (flag === 'false') return false;
    // Fallback: if token exists only in localStorage, treat as persistent
    const hasLocalToken = !!this.getLocal().getItem(this.TOKEN_KEY);
    const hasSessionToken = !!this.getSession().getItem(this.TOKEN_KEY);
    return hasLocalToken && !hasSessionToken;
  }

  static getToken(): string | null {
    // Prefer session token for non-persistent sessions, fall back to local
    return this.getSession().getItem(this.TOKEN_KEY) ?? this.getLocal().getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    const persistent = this.usePersistent();
    if (persistent) {
      this.getLocal().setItem(this.TOKEN_KEY, token);
      this.getSession().removeItem(this.TOKEN_KEY);
    } else {
      this.getSession().setItem(this.TOKEN_KEY, token);
      this.getLocal().removeItem(this.TOKEN_KEY);
    }
  }

  static removeToken(): void {
    this.getLocal().removeItem(this.TOKEN_KEY);
    this.getSession().removeItem(this.TOKEN_KEY);
  }

  static getUser(): string | null {
    // User metadata can live alongside the active token store
    return this.usePersistent()
      ? this.getLocal().getItem(this.USER_KEY)
      : this.getSession().getItem(this.USER_KEY);
  }

  static setUser(user: string): void {
    if (this.usePersistent()) {
      this.getLocal().setItem(this.USER_KEY, user);
      this.getSession().removeItem(this.USER_KEY);
    } else {
      this.getSession().setItem(this.USER_KEY, user);
      this.getLocal().removeItem(this.USER_KEY);
    }
  }

  static removeUser(): void {
    this.getLocal().removeItem(this.USER_KEY);
    this.getSession().removeItem(this.USER_KEY);
  }

  static clear(): void {
    this.removeToken();
    this.removeUser();
    this.getLocal().removeItem(this.REFRESH_TOKEN_KEY);
    this.getSession().removeItem(this.REFRESH_TOKEN_KEY);
    this.getLocal().removeItem(this.KEEP_LOGGED_IN_KEY);
  }

  static setAuth(token: string, refreshToken: string, rememberMe: boolean): void {
    // Persist preference in localStorage so it survives restarts when enabled
    this.getLocal().setItem(this.KEEP_LOGGED_IN_KEY, rememberMe ? 'true' : 'false');

    if (rememberMe) {
      this.getLocal().setItem(this.TOKEN_KEY, token);
      this.getLocal().setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      this.getSession().removeItem(this.TOKEN_KEY);
      this.getSession().removeItem(this.REFRESH_TOKEN_KEY);
    } else {
      this.getSession().setItem(this.TOKEN_KEY, token);
      this.getSession().setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      this.getLocal().removeItem(this.TOKEN_KEY);
      this.getLocal().removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static getRefreshToken(): string | null {
    return this.getSession().getItem(this.REFRESH_TOKEN_KEY) ?? this.getLocal().getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokensAfterRefresh(token: string, refreshToken: string): void {
    const rememberMe = this.usePersistent();
    this.setAuth(token, refreshToken, rememberMe);
  }

  static getRememberMe(): boolean {
    return this.usePersistent();
  }
}
