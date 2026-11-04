import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { api } from "../services/api";
export default function Notifications() {
  const [d, setD] = useState<any>({ count: 0, items: [] }); const [open, setOpen] = useState(false);
  useEffect(() => { const l = () => api.get("/notifications").then(r => setD(r.data.data)).catch(() => {}); l(); const t = setInterval(l, 60000); window.addEventListener("msgs-changed", l); return () => { clearInterval(t); window.removeEventListener("msgs-changed", l); }; }, []);
  return (<div className="relative"><button aria-label="Notifications" onClick={() => setOpen(!open)} className="relative"><Bell className="h-5 w-5" />{d.count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-brand-red px-1.5 text-[10px] font-bold text-white">{d.count}</span>}</button>
    {open && <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border bg-white p-2 shadow-lg">{d.items.length ? d.items.map((n: any, i: number) => <Link key={i} to={n.link} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50">{n.title}</Link>) : <p className="p-3 text-sm text-gray-500">No notifications</p>}</div>}</div>);
}
