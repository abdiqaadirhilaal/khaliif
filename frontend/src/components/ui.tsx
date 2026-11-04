import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); if (open) window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [open, onClose]);
  if (!open) return null;
  return (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={e => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button></div>{children}</div></div>);
}
export function Confirm({ open, text, onYes, onNo }: { open: boolean; text: string; onYes: () => void; onNo: () => void }) {
  return (<Modal open={open} onClose={onNo} title="Please confirm"><p className="text-sm text-gray-700">{text}</p>
    <div className="mt-5 flex justify-end gap-2"><button className="btn-outline" onClick={onNo}>Cancel</button><button className="btn-primary" onClick={onYes}>Yes, continue</button></div></Modal>);
}
export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="block text-sm font-medium">{label}<div className="mt-1">{children}</div></label>;
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (<div className="mt-4 flex items-center justify-center gap-3 text-sm"><button className="btn-outline py-1.5" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn-outline py-1.5" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button></div>);
}
export const Skeleton = ({ rows = 5 }: { rows?: number }) => <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />)}</div>;
export const PageHead = ({ title, children }: { title: string; children?: ReactNode }) => <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{title}</h1>{children}</div>;
