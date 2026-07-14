import { HttpClient } from './index';
import { PageContent } from '../types';

class PagesHttp extends HttpClient {
  async getPage(page: string) {
    return this.get<PageContent>(`/page/${page}`);
  }

  async savePage(page: string, data: Record<string, string>) {
    return this.post<void>('/page/save', { page, data });
  }

  async getPageNames() {
    return this.get<Record<string, string>>('/page-names');
  }

  async savePageNames(names: Record<string, string>) {
    return this.post<void>('/page-names/save', names);
  }
}

export const pagesHttp = new PagesHttp();
