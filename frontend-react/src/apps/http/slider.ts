import { HttpClient } from './index';
import { Slide, PaginatedResult } from '../types';

class SliderHttp extends HttpClient {
  async getPublic() {
    return this.get<Slide[]>('/slides');
  }

  async list(page?: number, limit?: number) {
    return this.post<PaginatedResult<Slide>>('/slide/list', { page, limit });
  }

  async create(data: Partial<Slide>) {
    return this.post<Slide>('/slide/create', data);
  }

  async save(data: Partial<Slide>) {
    return this.post<Slide>('/slide/save', data);
  }

  async delete(id: number) {
    return this.post<void>('/slide/delete', { id });
  }

  async setVisible(id: number, visible: boolean) {
    return this.post<void>('/slide/visible', { id, visible });
  }

  async sort(ids: number[]) {
    return this.post<void>('/slides/sort', { ids });
  }
}

export const sliderHttp = new SliderHttp();
