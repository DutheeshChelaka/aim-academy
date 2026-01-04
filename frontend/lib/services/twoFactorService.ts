import api from '../api';

export const twoFactorService = {
  // Setup 2FA (get QR code)
  setup2FA: async () => {
    const response = await api.post('/auth/admin/setup-2fa');
    return response.data;
  },

  // Enable 2FA (verify first code)
  enable2FA: async (token: string) => {
    const response = await api.post('/auth/admin/enable-2fa', { token });
    return response.data;
  },

  // Verify 2FA during login
  verify2FA: async (tempToken: string, totpCode: string) => {
    const response = await api.post('/auth/admin/verify-2fa', {
      tempToken,
      totpCode,
    });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (password: string, totpCode: string) => {
    const response = await api.post('/auth/admin/disable-2fa', {
      password,
      totpCode,
    });
    return response.data;
  },

  // Check 2FA status
  get2FAStatus: async () => {
    const response = await api.get('/auth/admin/2fa-status');
    return response.data;
  },
};