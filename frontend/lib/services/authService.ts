import api from '../api';

interface RegisterData {
  phoneNumber: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  message: string;
  phoneNumber: string;
  otp: string;
}

interface VerifyOTPResponse {
  accessToken: string;
  user: {
    id: string;
    phoneNumber: string;
    name: string;
    role?: string;
  };
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    phoneNumber: string;
    name: string;
    role?: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', {
      phoneNumber: data.phoneNumber,
      password: data.password,
      name: data.name,
    });
    return {
      message: response.data.message,
      phoneNumber: response.data.phoneNumber,
      otp: response.data.otp,
    };
  },

  async verifyOTP(phoneNumber: string, code: string): Promise<VerifyOTPResponse> {
    const response = await api.post('/auth/verify-otp', {
      phoneNumber,
      code,
    });
    return response.data;
  },

  async login(phoneNumber: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', {
      phoneNumber,
      password,
    });
    return response.data;
  },

  async resendOTP(phoneNumber: string) {
    const response = await api.post('/auth/resend-otp', {
      phoneNumber,
    });
    return response.data;
  },
};