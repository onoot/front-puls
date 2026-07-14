import { HttpClient } from './index';
import { Project, ProjectCategory, PaginatedResult } from '../types';

class ProjectsHttp extends HttpClient {
  async getPublic(categoryId?: number) {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return this.get<Project[]>(`/projects${params}`);
  }

  async getPublicCategories() {
    return this.get<ProjectCategory[]>('/project-categories');
  }

  async list(categoryId?: number, page?: number, limit?: number) {
    return this.post<PaginatedResult<Project>>('/project/list', { categoryId, page, limit });
  }

  async create(data: Partial<Project>) {
    return this.post<Project>('/project/create', data);
  }

  async save(data: Partial<Project>) {
    return this.post<Project>('/project/save', data);
  }

  async delete(id: number) {
    return this.post<void>('/project/delete', { id });
  }

  async setVisible(id: number, visible: boolean) {
    return this.post<void>('/project/visible', { id, visible });
  }

  async listCategories() {
    return this.post<ProjectCategory[]>('/project-category/list');
  }

  async createCategory(data: Partial<ProjectCategory>) {
    return this.post<ProjectCategory>('/project-category/create', data);
  }

  async saveCategory(data: Partial<ProjectCategory>) {
    return this.post<ProjectCategory>('/project-category/save', data);
  }

  async deleteCategory(id: number) {
    return this.post<void>('/project-category/delete', { id });
  }

  async sortCategories(ids: number[]) {
    return this.post<void>('/project-categories/sort', { ids });
  }
}

export const projectsHttp = new ProjectsHttp();
