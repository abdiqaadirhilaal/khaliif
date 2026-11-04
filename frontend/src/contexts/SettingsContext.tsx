import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";
export interface Settings { companyName: string; logo: string; phone1: string; phone2: string; whatsapp: string; email?: string; address?: string; city?: string; country?: string;
  latitude?: number; longitude?: number; googleMapsUrl?: string; social?: Record<string, string>;
  website?: { heroTitle?: string; heroDescription?: string; aboutText?: string; footerText?: string; mission?: string; vision?: string; values?: string[]; stats?: { label: string; value: string }[] };
  system?: { currency: string; showPrices: boolean } }
const fallback: Settings = { companyName: "KHALIIF SECOND HAND CLOTHES COMPANY", logo: "/logo.png", phone1: "+252619593932", phone2: "+252612588896", whatsapp: "+252619593932" };
const Ctx = createContext<Settings>(fallback);
export const useSettings = () => useContext(Ctx);
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(fallback);
  useEffect(() => { api.get("/settings").then(r => setS({ ...fallback, ...r.data.data })).catch(() => {}); }, []);
  return <Ctx.Provider value={s}>{children}</Ctx.Provider>;
}
