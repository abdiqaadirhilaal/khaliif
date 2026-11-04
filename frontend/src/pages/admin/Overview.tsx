import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../layouts/DashboardLayout";
import { Skeleton, PageHead } from "../../components/ui";
import { ErrorBox } from "../../components/States";
import { money } from "../../utils/format";
export default function Overview() {
  const { user } = useAuth();
  if (!can(user?.role, ["manager"])) return <div><PageHead title={`Hello, ${user?.name}`} /><div className="flex gap-3"><Link className="btn-primary" to="/dashboard/sales">New sale</Link><Link className="btn-outline" to="/dashboard/products">Products</Link></div></div>;
  return <Full />;
}
function Full() {
  const { data, loading, error } = useFetch<any>("/reports/dashboard"); if (loading) return <Skeleton rows={6} />; if (error || !data) return <ErrorBox text={error || "Failed to load"} />;
  const c = data.cards, m = data.month;
  const cards: [string, string | number][] = [["Today's sales", money(c.today)], ["Monthly sales", money(c.month)], ["Total products", c.products], ["Current stock (units)", c.stock], ["Containers received", c.containers], ["Total customers", c.customers], ["Outstanding debt", money(c.debt)], ["Monthly expenses", money(c.monthExpenses)], ["Estimated profit (month)", money(c.profit)]];
  const Box = ({ t, children }: any) => <div className="rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-bold">{t}</h2><div className="h-64">{children}</div></div>;
  return (<div><PageHead title="Dashboard" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{cards.map(([l, v]) => <div key={l} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs text-gray-500">{l}</p><p className={`mt-1 text-xl font-extrabold md:text-2xl ${l.startsWith("Estimated") && c.profit < 0 ? "text-red-600" : ""}`}>{v}</p></div>)}</div>
    <div className="mt-4 rounded-xl bg-white p-4 shadow-sm"><h2 className="mb-2 font-bold">This month's profit</h2><div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">{[["Revenue", m.revenue], ["Cost of goods", m.cogs], ["Gross profit", m.gross], ["Expenses", m.expenses], ["Net profit", m.net]].map(([l, v]: any) => <div key={l}><p className="text-gray-500">{l}</p><p className={`font-bold ${v < 0 ? "text-red-600" : ""}`}>{money(v)}</p></div>)}</div></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Box t="Sales and expenses (30 days)"><ResponsiveContainer><LineChart data={data.series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Line type="monotone" dataKey="sales" stroke="#3B55A8" dot={false} /><Line type="monotone" dataKey="expenses" stroke="#E31E24" dot={false} /></LineChart></ResponsiveContainer></Box>
      <Box t="Profit (30 days)"><ResponsiveContainer><LineChart data={data.series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Line type="monotone" dataKey="profit" stroke="#16a34a" dot={false} /></LineChart></ResponsiveContainer></Box>
      <Box t="Top-selling products (units)">{data.top.length ? <ResponsiveContainer><BarChart data={data.top} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={110} fontSize={11} /><Tooltip /><Bar dataKey="qty" fill="#27AAE1" /></BarChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-gray-500">No sales yet.</p>}</Box>
      <Box t="Stock by category (units)"><ResponsiveContainer><BarChart data={data.byCat}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} interval={0} angle={-25} textAnchor="end" height={60} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="qty" fill="#4285C5" /></BarChart></ResponsiveContainer></Box></div></div>);
}
