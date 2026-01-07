import api from '../api';

interface RegisterData {
  email: string;
  phoneNumber: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  message: string;
  email: string;
  otp?: string; // Only in development mode
}

interface VerifyOTPResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    phoneNumber: string;
    name: string;
    role?: string;
  };
}

// Updated to support 2FA flow
interface LoginResponse {
  // Normal login response
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    phoneNumber: string;
    name: string;
    role?: string;
  };
  // 2FA response (when 2FA is required)
  requiresTwoFactor?: boolean;
  tempToken?: string;
  message?: string;
}

export const authService = {
  /**
   * Register new user with email
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', {
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      name: data.name,
    });
    return {
      message: response.data.message,
      email: response.data.email,
      otp: response.data.otp, // Only present in development
    };
  },

  /**
   * Verify OTP using email
   */
  async verifyOTP(email: string, code: string): Promise<VerifyOTPResponse> {
    const response = await api.post('/auth/verify-otp', {
      email,
      code,
    });
    return response.data;
  },

  /**
   * Login with identifier (email or phone number)
   */
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', {
      identifier,
      password,
    });
    return response.data;
  },

  /**
   * Resend OTP to email
   */
  async resendOTP(email: string) {
    const response = await api.post('/auth/resend-otp', {
      email,
    });
    return response.data;
  },
};