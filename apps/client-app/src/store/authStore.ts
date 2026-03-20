import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  points: number;
  loading: boolean;
  setUser: (user: User | null) => void;
  setPoints: (points: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  points: 0,
  loading: true,
  setUser: (user) => set({ user }),
  setPoints: (points) => set({ points }),
  setLoading: (loading) => set({ loading }),
}));
