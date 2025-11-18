export interface TuitionTaxonomy {
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  subjects: Subject[];
  classLevels: ClassLevel[];
}

export interface Subject {
  id: number;
  name: string;
}

export interface ClassLevel {
  id: number;
  name: string;
}

class LocalTaxonomyService {
  private cachedTaxonomy: TuitionTaxonomy | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(): boolean {
    return this.cachedTaxonomy !== null && Date.now() < this.cacheExpiry;
  }

  private setCache(taxonomy: TuitionTaxonomy): void {
    this.cachedTaxonomy = taxonomy;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  async getTuitionTaxonomy(): Promise<TuitionTaxonomy> {
    // Check if we have valid cached data
    if (this.isCacheValid()) {
      return this.cachedTaxonomy!;
    }

    try {
      // Fetch from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/website/taxonomy`);
      const result = await response.json();
      
      if (result.success) {
        this.setCache(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch taxonomy data');
      }
    } catch (error) {
      console.error('Error fetching taxonomy data:', error);
      // Return empty taxonomy if API fails
      const emptyTaxonomy: TuitionTaxonomy = {
        categories: []
      };
      return emptyTaxonomy;
    }
  }

  // Get all subjects from all categories
  async getAllSubjects(): Promise<Subject[]> {
    const taxonomy = await this.getTuitionTaxonomy();
    return taxonomy.categories.flatMap(category => category.subjects);
  }

  // Get all class levels from all categories
  async getAllClassLevels(): Promise<ClassLevel[]> {
    const taxonomy = await this.getTuitionTaxonomy();
    return taxonomy.categories.flatMap(category => category.classLevels);
  }

  // Get subjects for a specific category
  async getSubjectsByCategory(categoryId: number): Promise<Subject[]> {
    const taxonomy = await this.getTuitionTaxonomy();
    const category = taxonomy.categories.find(cat => cat.id === categoryId);
    return category ? category.subjects : [];
  }

  // Get class levels for a specific category
  async getClassLevelsByCategory(categoryId: number): Promise<ClassLevel[]> {
    const taxonomy = await this.getTuitionTaxonomy();
    const category = taxonomy.categories.find(cat => cat.id === categoryId);
    return category ? category.classLevels : [];
  }

  // Get category by ID
  async getCategoryById(categoryId: number): Promise<Category | null> {
    const taxonomy = await this.getTuitionTaxonomy();
    return taxonomy.categories.find(cat => cat.id === categoryId) || null;
  }

  // Get category by name
  async getCategoryByName(categoryName: string): Promise<Category | null> {
    const taxonomy = await this.getTuitionTaxonomy();
    return taxonomy.categories.find(cat => cat.name === categoryName) || null;
  }

  // Clear cache (useful for testing or when data needs to be refreshed)
  clearCache(): void {
    this.cachedTaxonomy = null;
    this.cacheExpiry = 0;
  }
}

export const localTaxonomyService = new LocalTaxonomyService();
