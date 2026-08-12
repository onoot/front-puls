import { HttpClient } from './index';
import { Slide, PaginatedResult } from '../types';

function toCamel(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const result: any = {};
  for (const [k, v] of Object.entries(item)) {
    result[k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  }
  return result;
}

class SliderHttp extends HttpClient {
  async getPublic() {
    const res = await this.get<Slide[]>('/slides');
    return { ...res, data: res.data.map(toCamel) };
  }

  async list(page?: number, limit?: number) {
    const res = await this.post<PaginatedResult<Slide>>('/slide/list', { page, limit });
    return { ...res, data: { ...res.data, items: res.data.items.map(toCamel) } };
  }

  async create(data: Partial<Slide>) {
    const res = await this.post<Slide>('/slide/create', data);
    return { ...res, data: toCamel(res.data) };
  }

  async save(data: Partial<Slide>) {
    const res = await this.post<Slide>('/slide/save', data);
    return { ...res, data: toCamel(res.data) };
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
