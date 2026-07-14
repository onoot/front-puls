import { HttpClient } from './index';
import { PageContent } from '../types';

class PagesHttp extends HttpClient {
  async getPage(page: string) {
    return this.get<PageContent>(`/page/${page}`);
  }

  async savePage(page: string, data: Record<string, string>) {
    return this.post<void>('/page/save', { page, data });
  }
}

export const pagesHttp = new PagesHttp();
