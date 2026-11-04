import CrudPage from "../../components/CrudPage";
import { useFetch } from "../../hooks/useFetch";
import { money } from "../../utils/format";
const ST: [string, string][] = [["available", "Available"], ["opened", "Opened"], ["sold", "Sold"], ["partially_sold", "Partially Sold"]];
export default function Bundles() {
  const cont = useFetch<any>("/containers", { limit: 100 }); const cats = useFetch<any[]>("/categories/manage");
  const co: [string, string][] = (cont.data?.items || []).map((c: any) => [c._id, c.containerNumber]); const ca: [string, string][] = (cats.data || []).map(c => [c._id, c.name]);
  return <CrudPage title="Bundles" singular="Bundle" endpoint="/bundles" canEdit blank={{ status: "available" }} reloadKey={co.length}
    filters={[{ key: "container", label: "All containers", options: co }, { key: "status", label: "All statuses", options: ST }]}
    fromRow={r => ({ ...r, container: r.container?._id || "", category: r.category?._id || "" })}
    columns={[["Bundle", r => <span className="font-semibold">{r.bundleNumber}</span>], ["Container", r => r.container?.containerNumber || "-"], ["Type", r => r.clothingType || "-"], ["Gender", r => r.gender || "-"], ["Weight", r => r.weight ?? "-"],
      ["Qty", r => r.quantity], ["Cost", r => money(r.cost)], ["Price", r => money(r.sellingPrice)], ["Profit", r => money(r.sellingPrice - r.cost)],
      ["Status", r => <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize">{r.status.replace("_", " ")}</span>]]}
    fields={[{ key: "bundleNumber", label: "Bundle number", required: true }, { key: "container", label: "Container", type: "select", options: co, required: true }, { key: "category", label: "Category", type: "select", options: ca },
      { key: "clothingType", label: "Clothing type" }, { key: "gender", label: "Gender" }, { key: "weight", label: "Weight (kg)", type: "number" }, { key: "quantity", label: "Quantity", type: "number" },
      { key: "cost", label: "Cost", type: "number" }, { key: "sellingPrice", label: "Selling price", type: "number" }, { key: "status", label: "Status", type: "select", options: ST, required: true }, { key: "notes", label: "Notes", type: "textarea" }]} />;
}
