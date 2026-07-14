import { HttpClient } from './index';
import { Brand, PaginatedResult } from '../types';

class BrandsHttp extends HttpClient {
  async getPublic() {
    return this.get<Brand[]>('/brands');
  }

  async list(page?: number, limit?: number) {
    return this.post<PaginatedResult<Brand>>('/brand/list', { page, limit });
  }

  async create(data: Partial<Brand>) {
    return this.post<Brand>('/brand/create', data);
  }

  async save(data: Partial<Brand>) {
    return this.post<Brand>('/brand/save', data);
  }

  async delete(id: number) {
    return this.post<void>('/brand/delete', { id });
  }

  async setVisible(id: number, visible: boolean) {
    return this.post<void>('/brand/visible', { id, visible });
  }

  async sort(ids: number[]) {
    return this.post<void>('/brands/sort', { ids });
  }
}

export const brandsHttp = new BrandsHttp();
