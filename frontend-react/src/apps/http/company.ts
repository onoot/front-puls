import { HttpClient } from './index';
import { CompanyInfo, Statistic } from '../types';

class CompanyHttp extends HttpClient {
  async getInfo() {
    return this.get<CompanyInfo>('/company/info');
  }

  async saveInfo(data: Record<string, string>) {
    return this.post<void>('/company/info/save', data);
  }

  async getStatistics() {
    return this.get<Statistic[]>('/statistics');
  }

  async saveStatistics(items: Statistic[]) {
    return this.post<void>('/statistics/save', { items });
  }
}

export const companyHttp = new CompanyHttp();
