import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
export default function About() {
  const s = useSettings(); const w = s.website || {};
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <h1 className="text-3xl font-extrabold">About {s.companyName}</h1>
      <p className="text-gray-700">{w.aboutText || `${s.companyName} sells quality second-hand clothes to wholesale and retail customers.`}</p>
      <section><h2 className="text-xl font-bold">How containers and bundles work</h2>
        <p className="mt-2 text-gray-700">Clothes arrive in shipping containers. Each container is unloaded and sorted into bundles by clothing type, gender and grade. Bundles can be sold whole, or opened and sold as individual items.</p></section>
      {w.mission && <section><h2 className="text-xl font-bold">Mission</h2><p className="mt-2 text-gray-700">{w.mission}</p></section>}
      {w.vision && <section><h2 className="text-xl font-bold">Vision</h2><p className="mt-2 text-gray-700">{w.vision}</p></section>}
      {!!w.values?.length && <section><h2 className="text-xl font-bold">Core values</h2><ul className="mt-2 flex flex-wrap gap-2">{w.values.map(v => <li key={v} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">{v}</li>)}</ul></section>}
      <Link to="/contact" className="btn-primary">Contact us</Link>
    </div>
  );
}
