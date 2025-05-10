import { apiClient } from '@/lib/axios';
import type { Category } from '../../events/types/events';

interface CategoriesResponse {
  data: Category[];
  pagination: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  sort: {
    sortBy: string;
    sortOrder: string;
  };
}

interface CategoryResponse {
  data: Category;
}

interface CategoryFormData {
  name: string;
  description?: string;
}

const getCategories = async (params = {}): Promise<CategoriesResponse> => {
  const response = await apiClient.get('/categories', { params });
  return response.data;
};

const getCategoryById = async (categoryId: string): Promise<CategoryResponse> => {
  const response = await apiClient.get(`/categories/${categoryId}`);
  return response.data;
};

const createCategory = async (categoryData: CategoryFormData): Promise<CategoryResponse> => {
  const response = await apiClient.post('/categories', categoryData);
  return response.data;
};

const updateCategory = async (categoryId: string, categoryData: CategoryFormData): Promise<CategoryResponse> => {
  const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
  return response.data;
};

const deleteCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(`/categories/${categoryId}`);
};

export const categoriesService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
