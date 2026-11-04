import { useState } from "react";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";
import CrudPage from "../../components/CrudPage";
import { Modal } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../layouts/DashboardLayout";
import { api, errMsg } from "../../services/api";
import { money } from "../../utils/format";
export default function Customers() {
  const { user } = useAuth(); const [st, setSt] = useState<any>(null);
  const open = (id: string) => api.get(`/customers/${id}/statement`).then(r => setSt(r.data.data)).catch(e => toast.error(errMsg(e)));
  return (<>
    <CrudPage title="Customers" singular="Customer" endpoint="/customers" canEdit={can(user?.role, ["manager", "sales"])} blank={{}}
      columns={[["Customer", r => <><p className="font-semibold">{r.name}</p><p className="text-xs text-gray-500">{r.businessName}</p></>], ["Phone", r => r.phone], ["Total purchases", r => money(r.totalPurchases)], ["Total paid", r => money(r.totalPaid)],
        ["Balance", r => <span className={r.balance > 0 ? "font-semibold text-red-600" : ""}>{money(r.balance)}</span>]]}
      actions={r => <button aria-label="Statement" title="Statement" className="p-1.5" onClick={() => open(r._id)}><FileText className="h-4 w-4" /></button>}
      fields={[{ key: "name", label: "Customer name", required: true }, { key: "phone", label: "Phone", required: true }, { key: "email", label: "Email", type: "email" }, { key: "businessName", label: "Business name" },
        { key: "address", label: "Address", wide: true }, { key: "notes", label: "Notes", type: "textarea" }]} />
    <Modal open={!!st} onClose={() => setSt(null)} title={`Statement: ${st?.customer.name}`}>{st && <div className="space-y-4 text-sm">
      <div className="grid grid-cols-3 gap-2 text-center">{[["Purchases", st.customer.totalPurchases], ["Paid", st.customer.totalPaid], ["Balance", st.customer.balance]].map(([l, v]: any) => <div key={l} className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">{l}</p><p className="font-bold">{money(v)}</p></div>)}</div>
      <div><h3 className="mb-1 font-bold">Purchase history</h3>{st.sales.length ? st.sales.map((s: any) => <p key={s._id} className="flex justify-between border-t py-1"><span>{s.invoiceNumber} · {new Date(s.saleDate).toLocaleDateString()}</span><span>{money(s.total)} (due {money(s.balance)})</span></p>) : <p className="text-gray-500">No purchases yet.</p>}</div>
      <div><h3 className="mb-1 font-bold">Payment history</h3>{st.payments.length ? st.payments.map((p: any) => <p key={p._id} className="flex justify-between border-t py-1"><span>{new Date(p.date).toLocaleDateString()} · {p.method.replace("_", " ")}</span><span>{money(p.amount)}</span></p>) : <p className="text-gray-500">No payments yet.</p>}</div></div>}</Modal></>);
}
