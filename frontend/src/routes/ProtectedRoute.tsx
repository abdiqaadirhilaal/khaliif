import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";
export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <div className="grid h-screen place-items-center text-sm text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles && user.role !== "super_admin" && !roles.includes(user.role)) return <div className="p-10 text-center">You do not have access to this page.</div>;
  return <Outlet />;
}
