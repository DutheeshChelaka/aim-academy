import api from '../api';

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  lesson: {
    id: string;
    title: string;
    price: number;
  };
}

export interface VerifyPaymentResponse {
  payment: {
    id: string;
    status: string;
    amount: number;
  };
  enrollment: {
    id: string;
    lessonId: string;
    enrolledAt: string;
    lesson: {
      id: string;
      title: string;
      subject: {
        name: string;
        grade: {
          number: number;
          name: string;
        };
      };
    };
  };
  session: any;
}

export const paymentService = {
  // Create Stripe checkout session
  async createCheckoutSession(lessonId: string): Promise<CreateCheckoutSessionResponse> {
    const response = await api.post('/payments/create-checkout-session', {
      lessonId,
    });
    return response.data;
  },

  // Verify payment after Stripe redirect
  async verifyPayment(sessionId: string): Promise<VerifyPaymentResponse> {
    const response = await api.get(`/payments/verify?session_id=${sessionId}`);
    return response.data;
  },

  // Get payment details
  async getPayment(paymentId: string) {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Get user payment history
  async getPaymentHistory() {
    const response = await api.get('/payments/user/history');
    return response.data;
  },
};