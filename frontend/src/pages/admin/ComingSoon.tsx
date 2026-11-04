import { useLocation } from "react-router-dom";
export default function ComingSoon() { const n = useLocation().pathname.split("/").pop(); return <div className="py-20 text-center text-gray-500"><h1 className="text-2xl font-bold capitalize text-brand-ink">{n}</h1><p className="mt-2">This module is built in a later phase.</p></div>; }
