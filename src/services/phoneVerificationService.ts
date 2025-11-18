import { API_BASE_URL } from '../config/api';

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    expiresIn: number;
  };
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    phoneNumber: string;
    verifiedAt: string;
  };
}

class PhoneVerificationService {
  private baseUrl = `${API_BASE_URL}/phone-verification`;

  async sendOTP(phoneNumber: string, fullName?: string): Promise<SendOTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          fullName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async verifyOTP(phoneNumber: string, otpCode: string): Promise<VerifyOTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async resendOTP(phoneNumber: string, fullName?: string): Promise<SendOTPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          fullName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }
}

export const phoneVerificationService = new PhoneVerificationService();

