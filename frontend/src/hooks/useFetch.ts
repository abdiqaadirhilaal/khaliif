import { useEffect, useState } from "react";
import { api, errMsg } from "../services/api";
export function useFetch<T = any>(url: string, params?: object) {
  const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const key = url + JSON.stringify(params || {});
  useEffect(() => { let on = true; setLoading(true); setError("");
    api.get(url, { params }).then(r => on && setData(r.data.data)).catch(e => on && setError(errMsg(e))).finally(() => on && setLoading(false));
    return () => { on = false; }; }, [key]);
  return { data, loading, error };
}
