import { HttpClient } from './index';
import { Review, PaginatedResult } from '../types';

class ReviewsHttp extends HttpClient {
  async getPublic() {
    return this.get<Review[]>('/reviews');
  }

  async list(page?: number, limit?: number) {
    return this.post<PaginatedResult<Review>>('/review/list', { page, limit });
  }

  async create(data: Partial<Review>) {
    return this.post<Review>('/review/create', data);
  }

  async save(data: Partial<Review>) {
    return this.post<Review>('/review/save', data);
  }

  async delete(id: number) {
    return this.post<void>('/review/delete', { id });
  }

  async setVisible(id: number, visible: boolean) {
    return this.post<void>('/review/visible', { id, visible });
  }

  async sort(ids: number[]) {
    return this.post<void>('/reviews/sort', { ids });
  }
}

export const reviewsHttp = new ReviewsHttp();
