import { Phone, MessageCircle } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { waLink } from "../utils/format";
export default function ContactButtons({ message = "Hello, I would like more information." }: { message?: string }) {
  const s = useSettings();
  return (<div className="flex flex-wrap gap-3">
    <a className="btn-primary" href={waLink(s.whatsapp, message)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp</a>
    <a className="btn-outline" href={`tel:${s.phone1}`}><Phone className="h-4 w-4" />{s.phone1}</a>
    <a className="btn-outline" href={`tel:${s.phone2}`}><Phone className="h-4 w-4" />{s.phone2}</a></div>);
}
