import { api } from '@/config/api';

export interface RefundPolicy {
  id: string;
  title: string;
  description: string;
  conditions: string[];
  processing_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRefundPolicyData {
  title: string;
  description: string;
  conditions: string[];
  processing_time: string;
  is_active?: boolean;
}

export interface UpdateRefundPolicyData extends Partial<CreateRefundPolicyData> {
  id: string;
}

export interface RefundPolicyResponse {
  success: boolean;
  data: RefundPolicy;
  message?: string;
}

export interface RefundPoliciesResponse {
  success: boolean;
  data: RefundPolicy[];
  message?: string;
}

class RefundPolicyService {
  async getRefundPolicies(): Promise<RefundPoliciesResponse> {
    try {
      const response = await api.get('/refund-policies');
      return response;
    } catch (error: any) {
      console.error('RefundPolicyService error for getRefundPolicies:', error);
      throw error;
    }
  }

  async getRefundPolicy(id: string): Promise<RefundPolicyResponse> {
    try {
      const response = await api.get(`/refund-policies/${id}`);
      return response;
    } catch (error: any) {
      console.error('RefundPolicyService error for getRefundPolicy:', error);
      throw error;
    }
  }

  async createRefundPolicy(data: CreateRefundPolicyData): Promise<RefundPolicyResponse> {
    try {
      const response = await api.post('/refund-policies', data);
      return response;
    } catch (error: any) {
      console.error('RefundPolicyService error for createRefundPolicy:', error);
      throw error;
    }
  }

  async updateRefundPolicy(data: UpdateRefundPolicyData): Promise<RefundPolicyResponse> {
    try {
      const { id, ...updateData } = data;
      const response = await api.put(`/refund-policies/${id}`, updateData);
      return response;
    } catch (error: any) {
      console.error('RefundPolicyService error for updateRefundPolicy:', error);
      throw error;
    }
  }

  async deleteRefundPolicy(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/refund-policies/${id}`);
      return response;
    } catch (error: any) {
      console.error('RefundPolicyService error for deleteRefundPolicy:', error);
      throw error;
    }
  }
}

export const refundPolicyService = new RefundPolicyService();
