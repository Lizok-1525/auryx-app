import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isActive: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setIsActive: (active: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isActive: false, // Controla si el repartidor está recibiendo pedidos
  loading: true,
  setUser: (user) => set({ user }),
  setIsActive: (active) => set({ isActive: active }),
  setLoading: (loading) => set({ loading }),
}));
