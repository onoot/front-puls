import { HttpClient } from './index';
import { Product, ProductCategory, PaginatedResult } from '../types';

class CatalogHttp extends HttpClient {
  async getPublicCategories() {
    return this.get<ProductCategory[]>('/catalog/categories');
  }

  async getCategoryTree() {
    return this.get<ProductCategory[]>('/catalog/category-tree');
  }

  async getPublicProducts(categoryId?: number, page = 1, search?: string) {
    const params = new URLSearchParams();
    if (categoryId !== undefined) params.set('categoryId', String(categoryId));
    params.set('page', String(page));
    if (search) params.set('search', search);
    return this.get<PaginatedResult<Product>>(`/catalog/products?${params}`);
  }

  async getProduct(id: number) {
    return this.get<Product>(`/catalog/product/${id}`);
  }

  async listCategories(page?: number, limit?: number) {
    return this.post<PaginatedResult<ProductCategory>>('/product-category/list', { page, limit });
  }

  async createCategory(data: Partial<ProductCategory>) {
    return this.post<ProductCategory>('/product-category/create', data);
  }

  async saveCategory(data: Partial<ProductCategory>) {
    return this.post<ProductCategory>('/product-category/save', data);
  }

  async deleteCategory(id: number) {
    return this.post<void>('/product-category/delete', { id });
  }

  async setCategoryVisible(id: number, visible: boolean) {
    return this.post<void>('/product-category/visible', { id, visible });
  }

  async sortCategories(ids: number[]) {
    return this.post<void>('/product-categories/sort', { ids });
  }

  async listProducts(categoryId?: number, page?: number, limit?: number) {
    return this.post<PaginatedResult<Product>>('/product/list', { categoryId, page, limit });
  }

  async createProduct(data: Partial<Product>) {
    return this.post<Product>('/product/create', data);
  }

  async saveProduct(data: Partial<Product>) {
    return this.post<Product>('/product/save', data);
  }

  async deleteProduct(id: number) {
    return this.post<void>('/product/delete', { id });
  }

  async setProductVisible(id: number, visible: boolean) {
    return this.post<void>('/product/visible', { id, visible });
  }

  async addPhoto(productId: number, name: string) {
    return this.post<any>('/product/photo/add', { productId, name });
  }

  async deletePhoto(id: number) {
    return this.post<void>('/product/photo/delete', { id });
  }

  async sortPhotos(ids: number[]) {
    return this.post<void>('/product/photos/sort', { ids });
  }

  async uploadPhoto(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.upload<{ filename: string }>('/upload/photo', fd);
  }

  async listUploadedPhotos() {
    return this.post<{ files: string[] }>('/uploads/list');
  }
}

export const catalogHttp = new CatalogHttp();
