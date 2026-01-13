import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  phoneNumber: string;
  email: string;
  name: string | null;
  role?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
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
      hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
      
      setAuth: (user, token) => {
        console.log('🔐 Setting auth for user:', user.id, user.email);
        
        // Update Zustand state (persist will handle localStorage)
        set({ 
          user, 
          accessToken: token, 
          isAuthenticated: true 
        });
        
        // ✅ ALSO set in plain localStorage for API interceptor
        localStorage.setItem('accessToken', token);
      },
      
      logout: () => {
        console.log('🚪 Logging out - clearing all storage');
        
        // ✅ Clear EVERYTHING
        localStorage.clear();
        sessionStorage.clear();
        
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
        console.log('💾 Rehydrating auth state');
        
        // ✅ Sync accessToken to plain localStorage on rehydration
        if (state?.accessToken) {
          localStorage.setItem('accessToken', state.accessToken);
        }
        
        state?.setHasHydrated(true);
      },
    }
  )
);