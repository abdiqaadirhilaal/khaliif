import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useFetch } from "../../hooks/useFetch";
import { ErrorBox, Loading } from "../../components/States";
import { img, money } from "../../utils/format";
export default function Invoice() {
  const { id } = useParams(); const { data, loading, error } = useFetch<any>(`/sales/${id}`);
  if (loading) return <Loading />; if (error || !data) return <ErrorBox text={error || "Not found"} />;
  const { sale, items, company: c } = data; const cur = c?.system?.currency; const m = (n: number) => money(n, cur); const name = c?.companyName || "KHALIIF SECOND HAND CLOTHES COMPANY";
  const pdf = () => { const d = new jsPDF(); d.setFontSize(16); d.text(name, 14, 18); d.setFontSize(10); d.text(`Phone: ${c?.phone1 || ""}  ${c?.phone2 || ""}`, 14, 25); d.text([c?.address, c?.city, c?.country].filter(Boolean).join(", "), 14, 30);
    d.setFontSize(14); d.text("INVOICE", 150, 18); d.setFontSize(10); d.text(`No: ${sale.invoiceNumber}`, 150, 25); d.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, 150, 30);
    d.text(`Customer: ${sale.customer?.name || "Walk-in customer"}${sale.customer?.phone ? " · " + sale.customer.phone : ""}`, 14, 42);
    autoTable(d, { startY: 48, head: [["Item", "Qty", "Unit price", "Total"]], body: items.map((i: any) => [`${i.name} (${i.sku})`, i.quantity, m(i.unitPrice), m(i.lineTotal)]), headStyles: { fillColor: [59, 85, 168] } });
    const y = (d as any).lastAutoTable.finalY + 8; [["Subtotal", sale.subtotal], ["Discount", sale.discount], ["Total", sale.total], ["Paid", sale.paid], ["Balance", sale.balance]].forEach(([l, v], k) => { d.text(String(l), 130, y + k * 6); d.text(m(v as number), 196, y + k * 6, { align: "right" }); });
    d.save(`${sale.invoiceNumber}.pdf`); };
  return (<div className="mx-auto max-w-3xl"><div className="no-print mb-4 flex flex-wrap gap-2"><Link to="/dashboard/sales" className="btn-outline"><ArrowLeft className="h-4 w-4" />Back</Link><button className="btn-outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</button><button className="btn-primary" onClick={pdf}><Download className="h-4 w-4" />Download PDF</button></div>
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <div className="flex flex-wrap justify-between gap-4 border-b pb-4"><div className="flex items-center gap-3"><img src={img(c?.logo || "/logo.png")} alt="" className="h-16 w-16 object-contain" /><div><p className="text-lg font-extrabold">{name}</p><p className="text-sm text-gray-600">Phone: {c?.phone1} · {c?.phone2}</p>{c?.address && <p className="text-sm text-gray-600">{[c.address, c.city, c.country].filter(Boolean).join(", ")}</p>}</div></div>
        <div className="text-right"><p className="text-2xl font-extrabold text-brand-navy">INVOICE</p><p className="font-semibold">{sale.invoiceNumber}</p><p className="text-sm">{new Date(sale.saleDate).toLocaleDateString()}</p></div></div>
      <p className="mt-4 text-sm"><span className="text-gray-500">Customer: </span><b>{sale.customer?.name || "Walk-in customer"}</b>{sale.customer?.phone && ` · ${sale.customer.phone}`}</p>
      <div className="overflow-x-auto"><table className="mt-4 w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2">Item</th><th className="px-3">Qty</th><th className="px-3">Unit price</th><th className="px-3 text-right">Total</th></tr></thead>
        <tbody>{items.map((i: any) => <tr key={i._id} className="border-t"><td className="px-3 py-2">{i.name} <span className="text-xs text-gray-500">{i.sku}</span></td><td className="px-3">{i.quantity}</td><td className="px-3">{m(i.unitPrice)}</td><td className="px-3 text-right">{m(i.lineTotal)}</td></tr>)}</tbody></table></div>
      <div className="ml-auto mt-4 w-64 space-y-1 text-sm">{[["Subtotal", sale.subtotal], ["Discount", sale.discount], ["Total", sale.total], ["Paid", sale.paid], ["Balance", sale.balance]].map(([l, v]) => <p key={l as string} className={`flex justify-between ${l === "Total" ? "text-base font-bold" : ""}`}><span>{l}</span>{m(v as number)}</p>)}</div>
      {sale.notes && <p className="mt-4 text-sm text-gray-600">Notes: {sale.notes}</p>}<p className="mt-8 text-center text-xs text-gray-500">Thank you for your business.</p></div></div>);
}
