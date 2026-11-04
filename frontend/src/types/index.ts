export type Role = "super_admin" | "manager" | "sales" | "cashier";
export interface User { _id: string; name: string; email: string; role: Role }
