const origin = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
export const img = (p?: string) => !p ? "" : p.startsWith("http") || p === "/logo.png" ? p : `${origin}${p}`;
export const digits = (s = "") => s.replace(/\D/g, "");
export const waLink = (phone: string, text: string) => `https://wa.me/${digits(phone)}?text=${encodeURIComponent(text)}`;
export const money = (n: number, c = "USD") => new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);
