import { HttpClient } from './index';
import { Letter, PaginatedResult } from '../types';

class LettersHttp extends HttpClient {
  async getPublic() {
    return this.get<Letter[]>('/letters');
  }

  async list(page?: number, limit?: number) {
    return this.post<PaginatedResult<Letter>>('/letter/list', { page, limit });
  }

  async create(data: Partial<Letter>) {
    return this.post<Letter>('/letter/create', data);
  }

  async save(data: Partial<Letter>) {
    return this.post<Letter>('/letter/save', data);
  }

  async delete(id: number) {
    return this.post<void>('/letter/delete', { id });
  }

  async setVisible(id: number, visible: boolean) {
    return this.post<void>('/letter/visible', { id, visible });
  }

  async sort(ids: number[]) {
    return this.post<void>('/letters/sort', { ids });
  }
}

export const lettersHttp = new LettersHttp();
