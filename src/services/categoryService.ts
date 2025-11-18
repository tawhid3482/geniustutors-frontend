import { API_BASE_URL } from '@/config/api';

export interface CategoryCount {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface CategoryData {
  id: string; // Changed to string to match backend
  name: string;
  tuitions: number;
  icon: string;
  color: string;
  iconUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

class CategoryService {
  private baseUrl = `${API_BASE_URL}/categories`;

  async getPopularCategories(): Promise<CategoryData[]> {
    try {
      // Direct fetch from your backend API
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      // Transform backend data to match frontend interface - EXACT DESIGN
      const transformedData: CategoryData[] = data.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        tuitions: 0, // Set to 0 as per your design
        icon: category.icon || '📚',
        color: this.getColorClass(category.color),
        iconUrl: category.iconUrl
      }));

      return transformedData;

    } catch (error) {
      console.error('Error fetching popular categories:', error);
      // Return empty array if API fails
      return [];
    }
  }

  async getAllCategories(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      // Transform backend data to match frontend interface
      const transformedData: CategoryData[] = data.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        tuitions: 0, // Set to 0 as per your design
        icon: category.icon || '📚',
        color: this.getColorClass(category.color),
        iconUrl: category.iconUrl
      }));

      return transformedData;

    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Helper function to convert hex color to Tailwind class
  private getColorClass(hexColor: string): string {
    const colorMap: { [key: string]: string } = {
      '#4A90E2': 'text-blue-500',
      '#50E3C2': 'text-teal-500', 
      '#B8E986': 'text-green-500',
      '#BD10E0': 'text-purple-500',
      '#FF6B6B': 'text-red-500',
      '#FFD166': 'text-yellow-500',
    };
    
    return colorMap[hexColor] || 'text-primary';
  }

  async getCategoriesFromTaxonomy(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      // Transform backend data
      const transformedData: CategoryData[] = data.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        tuitions: 0,
        icon: category.icon || '📚',
        color: this.getColorClass(category.color),
        iconUrl: category.iconUrl
      }));

      return transformedData;

    } catch (error) {
      console.error('Error fetching categories from taxonomy:', error);
      return [];
    }
  }
}

export const categoryService = new CategoryService();