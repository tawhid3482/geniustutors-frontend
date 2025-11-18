import { API_BASE_URL } from "@/constants/api";

export interface Subject {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClassLevel {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon_url?: string; // Add icon_url to the Category interface
  subjects: Subject[];
  classLevels: ClassLevel[];
  created_at?: string;
  updated_at?: string;
}

export interface TaxonomyData {
  categories: Category;
}

class TaxonomyService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Get all taxonomy data
  async getTaxonomyData(): Promise<TaxonomyData> {
    try {
      // First try with authentication
      // const token = localStorage.getItem('token');
      // if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          // headers: this.getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
                  // console.log(data.data);

          return data.data || { categories: [] };
        }
      } catch (authError) {
        console.log("Authenticated request failed, trying public endpoint...");
      }
      // }

      // Fallback to public endpoint
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/public`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || { categories: [] };
    } catch (error) {
      console.error("Error fetching taxonomy data:", error);
      throw error;
    }
  }

  // Create new category
  async createCategory(
    name: string,
    description: string,
    iconFile: File | null
  ): Promise<Category> {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (iconFile) {
        formData.append("category_icon", iconFile);
      }

      const headers = this.getAuthHeaders();
      delete (headers as any)["Content-Type"]; // Let the browser set the Content-Type for FormData

      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/categories`,
        {
          method: "POST",
          headers: headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  // Update category
  async updateCategory(
    id: number,
    name: string,
    description: string,
    iconFile: File | null
  ): Promise<Category> {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (iconFile) {
        formData.append("category_icon", iconFile);
      }

      const headers = this.getAuthHeaders();
      delete (headers as any)["Content-Type"]; // Let the browser set the Content-Type for FormData

      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/categories/${id}`,
        {
          method: "PUT",
          headers: headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/categories/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Create new subject
  async createSubject(categoryId: number, name: string): Promise<Subject> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/subjects`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ category_id: categoryId, name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subject");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error creating subject:", error);
      throw error;
    }
  }

  // Delete subject
  async deleteSubject(id: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/subjects/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete subject");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      throw error;
    }
  }

  // Create new class level
  async createClassLevel(
    categoryId: number,
    name: string
  ): Promise<ClassLevel> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/class-levels`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ category_id: categoryId, name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class level");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error creating class level:", error);
      throw error;
    }
  }

  // Delete class level
  async deleteClassLevel(id: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy/class-levels/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete class level");
      }
    } catch (error) {
      console.error("Error deleting class level:", error);
      throw error;
    }
  }

  // Update entire taxonomy (legacy method for backward compatibility)
  async updateTaxonomy(taxonomyData: TaxonomyData): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/website-management/taxonomy`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(taxonomyData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update taxonomy");
      }
    } catch (error) {
      console.error("Error updating taxonomy:", error);
      throw error;
    }
  }
}

export const taxonomyService = new TaxonomyService();
