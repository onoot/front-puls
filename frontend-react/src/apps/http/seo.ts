import { HttpClient } from './index';
import { Seo, PaginatedResult } from '../types';

class SeoHttp extends HttpClient {
  async getPageSeo(page: string) {
    return this.get<Seo>(`/seo/${page}`);
  }

  async list(page?: number, limit?: number) {
    return this.post<PaginatedResult<Seo>>('/seo/list', { page, limit });
  }

  async save(data: { page: string; title: string; description?: string; keywords?: string }) {
    return this.post<Seo>('/seo/save', data);
  }
}

export const seoHttp = new SeoHttp();
