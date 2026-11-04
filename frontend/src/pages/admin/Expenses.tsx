import CrudPage from "../../components/CrudPage";
import { img, money } from "../../utils/format";
const CATS: [string, string][] = ["shipping", "customs", "transport", "rent", "salary", "electricity", "internet", "marketing", "packaging", "maintenance", "other"].map(c => [c, c[0].toUpperCase() + c.slice(1)]);
export default function Expenses() {
  return <CrudPage title="Expenses" singular="Expense" endpoint="/expenses" canEdit blank={{ category: "other", date: new Date().toISOString().slice(0, 10) }} filters={[{ key: "category", label: "All categories", options: CATS }]}
    fromRow={r => ({ ...r, date: r.date?.slice(0, 10) || "" })}
    columns={[["Title", r => <span className="font-semibold">{r.title}</span>], ["Category", r => <span className="capitalize">{r.category}</span>], ["Amount", r => money(r.amount)], ["Date", r => new Date(r.date).toLocaleDateString()], ["By", r => r.user?.name || "-"],
      ["Receipt", r => r.receipt ? <a className="text-brand-navy underline" href={img(r.receipt)} target="_blank" rel="noreferrer">View</a> : "-"]]}
    fields={[{ key: "title", label: "Title", required: true }, { key: "category", label: "Category", type: "select", options: CATS, required: true }, { key: "amount", label: "Amount", type: "number", required: true }, { key: "date", label: "Date", type: "date" },
      { key: "description", label: "Description", type: "textarea" }, { key: "receipt", label: "Receipt / image", type: "file" }]} />;
}
