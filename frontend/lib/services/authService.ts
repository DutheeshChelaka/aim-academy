import api from '../api';

export interface RegisterData {
  phoneNumber: string;
  password: string;
  name?: string;
}

export interface LoginData {
  phoneNumber: string;
  password: string;
}

export interface VerifyOtpData {
  phoneNumber: string;
  code: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpData) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};