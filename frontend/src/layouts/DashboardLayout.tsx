import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Tags, Container, Boxes, Warehouse, ShoppingCart, Users, CreditCard, Receipt, MessageSquare, BarChart3, UserCog, Settings, LogOut, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import Logo from "../components/Logo";
import Notifications from "../components/Notifications";
import type { Role } from "../types";
const M: Role[] = ["manager"], S: Role[] = ["manager", "sales"], C: Role[] = ["manager", "sales", "cashier"];
const nav: [string, string, any, Role[]][] = [
  ["/dashboard", "Dashboard", LayoutDashboard, C], ["/dashboard/products", "Products", Package, C], ["/dashboard/categories", "Categories", Tags, S],
  ["/dashboard/containers", "Containers", Container, M], ["/dashboard/bundles", "Bundles", Boxes, M], ["/dashboard/inventory", "Inventory", Warehouse, M],
  ["/dashboard/sales", "Sales", ShoppingCart, C], ["/dashboard/customers", "Customers", Users, S], ["/dashboard/payments", "Payments", CreditCard, ["manager", "cashier"]],
  ["/dashboard/expenses", "Expenses", Receipt, M], ["/dashboard/messages", "Messages", MessageSquare, M], ["/dashboard/reports", "Reports", BarChart3, M],
  ["/dashboard/users", "Users", UserCog, []], ["/dashboard/settings", "Settings", Settings, M],
];
export const can = (role: Role | undefined, roles: Role[]) => role === "super_admin" || (!!role && roles.includes(role));
export default function DashboardLayout() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false); const [unread, setUnread] = useState(0);
  const load = useCallback(() => { if (can(user?.role, M)) api.get("/messages/unread-count").then(r => setUnread(r.data.data.count)).catch(() => {}); }, [user]);
  useEffect(() => { load(); const t = setInterval(load, 30000); window.addEventListener("msgs-changed", load); return () => { clearInterval(t); window.removeEventListener("msgs-changed", load); }; }, [load]);
  const side = (
    <aside className="flex h-full w-64 flex-col bg-brand-ink text-gray-300">
      <div className="bg-white p-3"><Logo size={40} /></div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.filter(n => can(user?.role, n[3])).map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === "/dashboard"} onClick={() => setOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-red text-white" : "hover:bg-white/10"}`}>
            <Icon className="h-4 w-4" />{label}{label === "Messages" && unread > 0 && <span className="ml-auto rounded-full bg-brand-cyan px-2 text-xs font-bold text-black">{unread}</span>}
          </NavLink>))}
      </nav>
      <button onClick={logout} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/10"><LogOut className="h-4 w-4" />Logout</button>
    </aside>);
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="no-print hidden lg:block">{side}</div>
      {open && <div className="fixed inset-0 z-40 flex lg:hidden"><div className="h-full">{side}</div><div className="flex-1 bg-black/50" onClick={() => setOpen(false)} /></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between border-b bg-white px-4 py-3">
          <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <span className="hidden text-sm text-gray-500 lg:block">Manager dashboard</span>
          <div className="flex items-center gap-4"><Notifications />
            <div className="text-right text-xs leading-tight"><p className="font-semibold">{user?.name}</p><p className="capitalize text-gray-500">{user?.role.replace("_", " ")}</p></div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>);
}
