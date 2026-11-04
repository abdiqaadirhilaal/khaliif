import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { errMsg } from "../services/api";
import Logo from "../components/Logo";
export default function Login() {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await login(email, password); toast.success("Welcome back"); nav("/dashboard"); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex justify-center"><img src="/logo.png" alt="Khaliif logo" className="h-32 w-32 object-contain" /></div>
        <h1 className="text-center text-xl font-bold">Manager login</h1>
        <label className="block text-sm font-medium">Email<input className="input mt-1" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label>
        <label className="block text-sm font-medium">Password<input className="input mt-1" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
      </form>
    </main>
  );
}
