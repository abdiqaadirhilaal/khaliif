import { Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/admin/Overview";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import Messages from "./pages/admin/Messages";
import Settings from "./pages/admin/Settings";
import Containers from "./pages/admin/Containers";
import Bundles from "./pages/admin/Bundles";
import Customers from "./pages/admin/Customers";
import Inventory from "./pages/admin/Inventory";
import Sales from "./pages/admin/Sales";
import Invoice from "./pages/admin/Invoice";
import Payments from "./pages/admin/Payments";
import Expenses from "./pages/admin/Expenses";
import Users from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import ComingSoon from "./pages/admin/ComingSoon";
import ProtectedRoute from "./routes/ProtectedRoute";
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} /><Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}><Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} /><Route path="products" element={<AdminProducts />} /><Route path="categories" element={<AdminCategories />} />
        <Route path="containers" element={<Containers />} /><Route path="bundles" element={<Bundles />} /><Route path="customers" element={<Customers />} /><Route path="inventory" element={<Inventory />} />
        <Route path="sales" element={<Sales />} /><Route path="sales/:id" element={<Invoice />} /><Route path="payments" element={<Payments />} /><Route path="expenses" element={<Expenses />} /><Route path="users" element={<Users />} /><Route path="reports" element={<Reports />} />
        <Route path="messages" element={<Messages />} /><Route path="settings" element={<Settings />} /><Route path="*" element={<ComingSoon />} /></Route></Route>
    </Routes>
  );
}
