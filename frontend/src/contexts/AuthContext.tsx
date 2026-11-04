import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, TOKEN_KEY } from "../services/api";
import type { User } from "../types";
interface Ctx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void }
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get("/auth/me").then(r => setUser(r.data.data.user)).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, r.data.data.token); setUser(r.data.data.user);
  };
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null); };
  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
