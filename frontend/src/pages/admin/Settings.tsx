import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, errMsg } from "../../services/api";
import { Field, PageHead, Skeleton } from "../../components/ui";
import { img } from "../../utils/format";
const num = (v: any) => (v === "" || v == null ? null : Number(v));
export default function Settings() {
  const [s, setS] = useState<any>(null); const [logo, setLogo] = useState<File | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/settings").then(r => { const d = r.data.data; setS({ ...d, social: d.social || {}, website: { ...(d.website || {}), values: (d.website?.values || []).join(", "), stats: (d.website?.stats || []).map((x: any) => `${x.label}: ${x.value}`).join("\n") }, system: d.system || {} }); }).catch(e => toast.error(errMsg(e))); }, []);
  if (!s) return <Skeleton />;
  const top = (k: string) => ({ value: s[k] ?? "", onChange: (e: any) => setS({ ...s, [k]: e.target.value }) });
  const sub = (g: string, k: string) => ({ value: s[g]?.[k] ?? "", onChange: (e: any) => setS({ ...s, [g]: { ...s[g], [k]: e.target.value } }) });
  const save = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { const { _id, __v, createdAt, updatedAt, ...rest } = s;
      const body = { ...rest, latitude: num(s.latitude), longitude: num(s.longitude),
        website: { ...s.website, values: s.website.values.split(",").map((v: string) => v.trim()).filter(Boolean), stats: s.website.stats.split("\n").map((l: string) => l.split(":")).filter((p: string[]) => p[0]?.trim() && p[1]?.trim()).map((p: string[]) => ({ label: p[0].trim(), value: p.slice(1).join(":").trim() })) },
        system: { ...s.system, taxRate: num(s.system.taxRate) ?? 0, lowStockThreshold: num(s.system.lowStockThreshold) ?? 10, showPrices: !!s.system.showPrices } };
      const fd = new FormData(); fd.append("data", JSON.stringify(body)); if (logo) fd.append("logo", logo);
      await api.put("/settings", fd); toast.success("Settings saved"); setTimeout(() => window.location.reload(), 600); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  const T = (label: string, p: any, type = "text") => <Field label={label}><input className="input" type={type} step="any" {...p} /></Field>;
  const Sec = ({ t, children }: any) => <section className="rounded-xl bg-white p-5 shadow-sm"><h2 className="mb-3 font-bold">{t}</h2><div className="grid gap-3 sm:grid-cols-2">{children}</div></section>;
  return (<form onSubmit={save} className="max-w-4xl space-y-5"><PageHead title="Settings"><button className="btn-primary" disabled={busy}>Save settings</button></PageHead>
    <Sec t="Company">{T("Company name", top("companyName"))}{T("Email", top("email"), "email")}{T("Phone 1", top("phone1"))}{T("Phone 2", top("phone2"))}{T("WhatsApp number", top("whatsapp"))}
      <Field label="Logo"><input type="file" accept="image/*" className="text-sm" onChange={e => setLogo(e.target.files?.[0] || null)} />{(logo || s.logo) && <img src={logo ? URL.createObjectURL(logo) : img(s.logo)} alt="" className="mt-2 h-16" />}</Field></Sec>
    <Sec t="Location (shown on the Contact page)">{T("Address", top("address"))}{T("City", top("city"))}{T("Country", top("country"))}{T("Google Maps URL", top("googleMapsUrl"))}{T("Latitude", top("latitude"), "number")}{T("Longitude", top("longitude"), "number")}</Sec>
    <Sec t="Social links">{["facebook", "instagram", "tiktok", "youtube"].map(k => T(k[0].toUpperCase() + k.slice(1), sub("social", k)))}</Sec>
    <Sec t="Website content">{T("Hero title", sub("website", "heroTitle"))}{T("Footer text", sub("website", "footerText"))}
      <div className="sm:col-span-2"><Field label="Hero description"><textarea className="input" rows={2} {...sub("website", "heroDescription")} /></Field></div>
      <div className="sm:col-span-2"><Field label="About text"><textarea className="input" rows={4} {...sub("website", "aboutText")} /></Field></div>
      <Field label="Mission"><textarea className="input" rows={3} {...sub("website", "mission")} /></Field><Field label="Vision"><textarea className="input" rows={3} {...sub("website", "vision")} /></Field>
      {T("Core values (comma separated)", sub("website", "values"))}<Field label="Statistics (one per line, Label: Value)"><textarea className="input" rows={3} {...sub("website", "stats")} /></Field></Sec>
    <Sec t="System">{T("Currency (e.g. USD)", sub("system", "currency"))}{T("Invoice prefix", sub("system", "invoicePrefix"))}{T("Tax rate (%)", sub("system", "taxRate"), "number")}{T("Low stock threshold", sub("system", "lowStockThreshold"), "number")}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!s.system.showPrices} onChange={e => setS({ ...s, system: { ...s.system, showPrices: e.target.checked } })} />Show prices on public website</label></Sec>
  </form>);
}
