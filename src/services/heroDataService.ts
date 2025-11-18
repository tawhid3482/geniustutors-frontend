


import { API_BASE_URL } from '@/config/api';

export interface Division {
  id: string;
  name: string;
  count: number;
  color: string;
  createdAt: string;
}

export interface TutorDivision {
  id: string;
  name: string;
  count: number;
  avgRating: number;
  topRatedCount: number;
  color: string;
  createdAt: string;
}

export interface HeroData {
  divisions: Division[];
  tutorDivisions: TutorDivision[];
}

export const heroDataService = {
  async getHeroData(): Promise<HeroData> {
    try {
      const response = await fetch(`${API_BASE_URL}/hero-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Backend response:', data); // Debug log
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch hero data');
      }

      // Transform backend data to match frontend interface - EXACT DESIGN
      const transformedData: HeroData = {
        // Districts from data.data.district
        divisions: data.data.district?.map((item: any) => ({
          id: item.id,
          name: item.name,
          count: item.count || 0,
          color: item.color || "from-green-100 to-green-200",
          createdAt: item.createdAt
        })) || [],
        
        // Tutor preferred areas from data.data.tutorInfo
        tutorDivisions: data.data.tutorInfo?.map((item: any, index: number) => ({
          id: `tutor-${index}`,
          name: item.preferred_area,
          count: item.count || 0,
          avgRating: item.avgRating || 4.5,
          topRatedCount: item.topRatedCount || 0,
          color: item.color || "from-emerald-100 to-emerald-200",
          createdAt: new Date().toISOString()
        })) || []
      };

      // console.log('Transformed data for exact design:', transformedData);
      return transformedData;

    } catch (error) {
      console.error('Error fetching hero data:', error);
      // Return fallback data if API fails - EXACT DESIGN STYLE
      return {
        divisions: [
          { id: "1", name: "Dhaka", count: 0, color: "from-emerald-100 to-emerald-200", createdAt: new Date().toISOString() },
          { id: "2", name: "Chattogram", count: 0, color: "from-teal-100 to-teal-200", createdAt: new Date().toISOString() },
          { id: "3", name: "Sylhet", count: 0, color: "from-cyan-100 to-cyan-200", createdAt: new Date().toISOString() },
          { id: "4", name: "Rajshahi", count: 0, color: "from-green-100 to-teal-200", createdAt: new Date().toISOString() },
          { id: "5", name: "Sylhet", count: 0, color: "from-cyan-100 to-cyan-200", createdAt: new Date().toISOString() },
          { id: "6", name: "Rajshahi", count: 0, color: "from-green-100 to-teal-200", createdAt: new Date().toISOString() }
        ],
        tutorDivisions: [
          { id: "tutor-1", name: "madhupur", count: 1, avgRating: 4.5, topRatedCount: 0, color: "from-emerald-100 to-emerald-200", createdAt: new Date().toISOString() },
          { id: "tutor-2", name: "mirzapur", count: 1, avgRating: 4.5, topRatedCount: 0, color: "from-emerald-100 to-emerald-200", createdAt: new Date().toISOString() }
        ]
      };
    }
  }
};