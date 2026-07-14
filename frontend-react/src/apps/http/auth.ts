import { HttpClient } from './index';
import { Manager } from '../types';

class AuthHttp extends HttpClient {
  async login(username: string, password: string) {
    return this.post<{ accessToken: string; manager: { id: number; username: string } }>(
      '/auth/login',
      { username, password },
    );
  }

  async getProfile() {
    return this.get<Manager>('/manager/profile');
  }
}

export const authHttp = new AuthHttp();
