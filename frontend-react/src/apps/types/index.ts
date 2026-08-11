export interface Brand {
  id: number;
  name: string;
  photo: string | null;
  sort: number;
  visible: boolean;
}

export interface CompanyInfo {
  [key: string]: string;
}

export interface Statistic {
  id: number;
  value: string;
  label: string;
  sort: number;
  visible: boolean;
}

export interface Document {
  id: number;
  name: string;
  contentType: string;
  filename: string;
  visible: boolean;
  sort: number;
  productId: number | null;
}

export interface Letter {
  id: number;
  name: string;
  photo: string | null;
  sort: number;
  visible: boolean;
}

export interface Manager {
  id: number;
  username: string;
  active: boolean;
  lastActive: string;
  createdAt: string;
}

export interface PageContent {
  [key: string]: string;
}

export interface Product {
  id: number;
  sku: string;
  name?: string | null;
  displayName?: string | null;
  description: string | null;
  photo: string | null;
  categoryId: number | null;
  sort: number;
  visible: boolean;
  categoryName?: string;
  categoryPhoto?: string;
  photos?: ProductPhoto[];
  documents?: Document[];
  properties?: Record<string, string> | null;
  excludedProperties?: string[];
  mainPhoto?: string | null;
  ownPhotos?: string[];
}

export interface ProductCategory {
  id: number;
  name: string;
  photo: string | null;
  parentId: number | null;
  sort: number;
  visible: boolean;
  children?: ProductCategory[];
  properties?: PropertyField[] | null;
}

export interface PropertyField {
  label: string;
}

export interface ProductPhoto {
  id: number;
  name: string;
  productId: number;
  sort: number;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  categoryId: number | null;
  sort: number;
  visible: boolean;
}

export interface ProjectCategory {
  id: number;
  name: string;
  sort: number;
  visible: boolean;
}

export interface Review {
  id: number;
  name: string;
  photo: string | null;
  sort: number;
  visible: boolean;
}

export interface Seo {
  id: number;
  page: string;
  title: string;
  description: string | null;
  keywords: string | null;
}

export interface Slide {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  link: string | null;
  sort: number;
  visible: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  error?: { message: string; statusCode: number };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
