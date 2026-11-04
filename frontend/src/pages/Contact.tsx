import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { api, errMsg } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import ContactButtons from "../components/ContactButtons";
export default function Contact() {
  const s = useSettings(); const [sp] = useSearchParams(); const [pn, sku] = (sp.get("product") || "").split("|");
  const [f, setF] = useState({ name: "", phone: "", email: "", subject: pn ? `Inquiry: ${pn}` : "", message: pn ? `I am interested in ${pn}, SKU ${sku}. Please provide more information.` : "" });
  const [busy, setBusy] = useState(false); const up = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { await api.post("/messages", { ...f, email: f.email || undefined, productRef: pn ? `${pn} (${sku})` : undefined }); toast.success("Message sent. We will contact you soon."); setF({ name: "", phone: "", email: "", subject: "", message: "" }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  const { latitude: la, longitude: lo } = s; const hasGeo = la != null && lo != null;
  const dir = s.googleMapsUrl || (hasGeo ? `https://www.google.com/maps/dir/?api=1&destination=${la},${lo}` : "");
  const addr = [s.address, s.city, s.country].filter(Boolean).join(", ");
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <h1 className="text-3xl font-extrabold">Contact us</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-6 shadow-sm">
          <input className="input" placeholder="Name" required value={f.name} onChange={up("name")} />
          <input className="input" placeholder="Phone" required value={f.phone} onChange={up("phone")} />
          <input className="input" type="email" placeholder="Email (optional)" value={f.email} onChange={up("email")} />
          <input className="input" placeholder="Subject" required value={f.subject} onChange={up("subject")} />
          <textarea className="input" rows={5} placeholder="Message" required value={f.message} onChange={up("message")} />
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Send message</button></form>
        <div className="space-y-4"><p className="text-gray-700">Call or message us directly:</p><ContactButtons />
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {hasGeo ? <iframe title="Map" className="h-64 w-full border-0" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${lo! - 0.01},${la! - 0.01},${lo! + 0.01},${la! + 0.01}&layer=mapnik&marker=${la},${lo}`} />
              : <div className="grid h-64 place-items-center bg-gray-100 px-6 text-center text-sm text-gray-500"><div><MapPin className="mx-auto mb-2 h-8 w-8" />The company location has not been set yet.</div></div>}
            <div className="space-y-2 p-4">{addr && <p className="text-sm">{addr}</p>}{dir && <a className="btn-outline w-full" href={dir} target="_blank" rel="noreferrer"><Navigation className="h-4 w-4" />Get Directions</a>}</div></div></div>
      </div>
    </div>
  );
}
