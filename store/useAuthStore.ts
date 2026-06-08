import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (username: string) =>
        set({
          user: { id: "mock-uid-12345", username },
          isLoggedIn: true,
        }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
