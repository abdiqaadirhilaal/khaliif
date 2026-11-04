import { Loader2, PackageOpen, AlertCircle } from "lucide-react";
export const Loading = () => <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="h-8 w-8 animate-spin" /></div>;
export const Empty = ({ text }: { text: string }) => <div className="grid place-items-center gap-2 py-16 text-gray-500"><PackageOpen className="h-10 w-10" /><p>{text}</p></div>;
export const ErrorBox = ({ text }: { text: string }) => <div className="mx-auto my-10 flex max-w-md items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{text}</div>;
