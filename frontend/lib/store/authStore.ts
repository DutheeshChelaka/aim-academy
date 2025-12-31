import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  role?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean; // NEW: Track if state is loaded from storage
  setHasHydrated: (state: boolean) => void; // NEW
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false, // NEW
      
      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
      
      setAuth: (user, token) => {
        // Save token to localStorage
        localStorage.setItem('accessToken', token);
        
        // Update Zustand state
        set({ 
          user, 
          accessToken: token, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('accessToken');
        
        // Clear Zustand state
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false 
        });
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when state is loaded from storage
        state?.setHasHydrated(true);
      },
    }
  )
);