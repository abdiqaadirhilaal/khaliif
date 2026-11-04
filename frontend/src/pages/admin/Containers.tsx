import CrudPage from "../../components/CrudPage";
import { money } from "../../utils/format";
const ST: [string, string][] = [["ordered", "Ordered"], ["in_transit", "In Transit"], ["arrived", "Arrived"], ["unloading", "Unloading"], ["completed", "Completed"]];
const nf = (key: string, label: string) => ({ key, label, type: "number" as const });
export default function Containers() {
  return <CrudPage title="Containers" singular="Container" endpoint="/containers" canEdit filters={[{ key: "status", label: "All statuses", options: ST }]}
    blank={{ status: "ordered" }} fromRow={r => ({ ...r, arrivalDate: r.arrivalDate?.slice(0, 10) || "" })}
    columns={[["Container", r => <><p className="font-semibold">{r.containerNumber}</p><p className="text-xs text-gray-500">{r.reference}</p></>], ["Supplier", r => r.supplier || "-"], ["Arrival", r => r.arrivalDate ? new Date(r.arrivalDate).toLocaleDateString() : "-"],
      ["Status", r => <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize">{r.status.replace("_", " ")}</span>], ["Total cost", r => money(r.totalCost)], ["Bundles", r => r.bundleCount],
      ["Expected revenue", r => money(r.expectedRevenue)], ["Expected profit", r => <span className={r.expectedProfit < 0 ? "font-semibold text-red-600" : "font-semibold text-green-700"}>{money(r.expectedProfit)}</span>]]}
    fields={[{ key: "containerNumber", label: "Container number", required: true }, { key: "reference", label: "Reference" }, { key: "arrivalDate", label: "Arrival date", type: "date" }, { key: "supplier", label: "Supplier" },
      { key: "originCountry", label: "Origin country" }, { key: "shippingCompany", label: "Shipping company" }, nf("purchaseCost", "Purchase cost"), nf("shippingCost", "Shipping cost"), nf("customsCost", "Customs cost"),
      nf("transportCost", "Transport cost"), nf("otherCosts", "Other costs"), { key: "status", label: "Status", type: "select", options: ST, required: true }, { key: "notes", label: "Notes", type: "textarea" }]} />;
}
