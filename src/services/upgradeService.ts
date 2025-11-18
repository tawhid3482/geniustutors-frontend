import { API_BASE_URL } from '@/config/api';

export interface UpgradePackage {
  id: string;
  name: string;
  type: 'premium' | 'verified';
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpgradeApplication {
  id: string;
  user_id: string;
  package_id: string;
  application_type: 'premium' | 'verified';
  payment_amount: number;
  payment_method: string;
  transaction_id: string;
  phone_number: string;
  kyc_documents?: KYCDocuments;
  kyc_status: 'pending' | 'approved' | 'rejected';
  application_status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  full_name?: string;
  email?: string;
  phone?: string;
  package_name?: string;
  package_type?: string;
}

export interface UserUpgrade {
  id: string;
  user_id: string;
  package_id: string;
  upgrade_type: 'premium' | 'verified';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  package_name?: string;
  package_type?: string;
  features?: string[];
}

export interface UpgradeStatus {
  hasPremium: boolean;
  hasVerified: boolean;
  activeUpgrades: UserUpgrade[];
  pendingApplications: UpgradeApplication[];
}

export interface KYCDocuments {
  national_id?: string;
  passport?: string;
  driving_license?: string;
  utility_bill?: string;
  bank_statement?: string;
  employment_letter?: string;
  education_certificate?: string;
  other_documents?: string[];
}

// Get all active upgrade packages
export const getUpgradePackages = async (): Promise<{ success: boolean; data: UpgradePackage[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/upgrade-packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching upgrade packages:', error);
    throw new Error('Failed to fetch upgrade packages');
  }
};

// Get package by ID
export const getUpgradePackage = async (id: string): Promise<{ success: boolean; data: UpgradePackage }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/upgrade-packages/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching upgrade package:', error);
    throw new Error('Failed to fetch upgrade package');
  }
};

// Get user's upgrade status
export const getUpgradeStatus = async (): Promise<{ success: boolean; data: UpgradeStatus }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upgrade-applications/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching upgrade status:', error);
    throw new Error('Failed to fetch upgrade status');
  }
};

// Apply for upgrade
export const applyForUpgrade = async (
  packageId: string,
  paymentMethod: string,
  transactionId: string,
  phoneNumber: string,
  kycDocuments?: KYCDocuments
): Promise<{ success: boolean; message: string; data: { applicationId: string } }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upgrade-applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        package_id: packageId,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        phone_number: phoneNumber,
        kyc_documents: kycDocuments,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error applying for upgrade:', error);
    throw new Error('Failed to apply for upgrade');
  }
};

// Admin: Get all upgrade applications
export const getUpgradeApplications = async (
  status?: string,
  type?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  data: {
    applications: UpgradeApplication[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}> => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/upgrade-applications?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching upgrade applications:', error);
    throw new Error('Failed to fetch upgrade applications');
  }
};

// Admin: Get application by ID
export const getUpgradeApplication = async (id: string): Promise<{ success: boolean; data: UpgradeApplication }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upgrade-applications/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching upgrade application:', error);
    throw new Error('Failed to fetch upgrade application');
  }
};

// Admin: Approve or reject application
export const updateApplicationStatus = async (
  id: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upgrade-applications/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        admin_note: adminNote,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

// Admin: Create new package
export const createUpgradePackage = async (packageData: {
  name: string;
  type: 'premium' | 'verified';
  description: string;
  price: number;
  duration_days: number;
  features: string[];
}): Promise<{ success: boolean; message: string; data: { id: string } }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upgrade-packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(packageData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating upgrade package:', error);
    throw new Error('Failed to create upgrade package');
  }
};

// Admin: Update package
export const updateUpgradePackage = async (
  id: string,
  packageData: Partial<{
    name: string;
    type: 'premium' | 'verified';
    description: string;
    price: number;
    duration_days: number;
    features: string[];
    is_active: boolean;
  }>
): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upgrade-packages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(packageData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating upgrade package:', error);
    throw new Error('Failed to update upgrade package');
  }
};

// Admin: Delete package
export const deleteUpgradePackage = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch(`${API_BASE_URL}/upgrade-packages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete package');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting upgrade package:', error);
    throw new Error((error as Error).message || 'Failed to delete upgrade package');
  }
};

// Admin: Delete upgrade application
export const deleteUpgradeApplication = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await fetch(`${API_BASE_URL}/upgrade-applications/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete application');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting upgrade application:', error);
    throw new Error((error as Error).message || 'Failed to delete upgrade application');
  }
};
