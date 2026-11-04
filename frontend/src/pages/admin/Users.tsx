import CrudPage from "../../components/CrudPage";
const ROLES: [string, string][] = [["super_admin", "Super Admin"], ["manager", "Manager"], ["sales", "Sales"], ["cashier", "Cashier"]];
export default function Users() {
  return <CrudPage title="Users" singular="User" endpoint="/users" canEdit blank={{ role: "sales", active: "true" }} filters={[{ key: "role", label: "All roles", options: ROLES }]} fromRow={r => ({ ...r, active: String(r.active), password: "" })}
    columns={[["Name", r => <span className="font-semibold">{r.name}</span>], ["Email", r => r.email], ["Role", r => ROLES.find(x => x[0] === r.role)?.[1]], ["Status", r => <span className={r.active ? "text-green-700" : "text-gray-500"}>{r.active ? "Active" : "Disabled"}</span>]]}
    fields={[{ key: "name", label: "Name", required: true }, { key: "email", label: "Email", type: "email", required: true }, { key: "password", label: "Password (min 8, leave empty to keep)", type: "password" },
      { key: "role", label: "Role", type: "select", options: ROLES, required: true }, { key: "active", label: "Status", type: "select", options: [["true", "Active"], ["false", "Disabled"]], required: true }]} />;
}
