import {create} from "zustand";

interface AuthState {
    user: any;
    status: "loading" | "authenticated" | "unauthenticated";
    setUser: (user: any) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: "loading",
    setUser: (user) => set({user, status: "authenticated"}),
    clearUser: () => set({user: null, status: "unauthenticated"}),
}));