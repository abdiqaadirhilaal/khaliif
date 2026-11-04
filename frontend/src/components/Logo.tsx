export default function Logo({ size = 48, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo.png" alt="Khaliif Second Hand Clothes Company" style={{ height: size, width: size }} className="rounded-full object-contain" />
      {showText && (
        <div className="leading-tight">
          <div className="text-lg font-extrabold tracking-[0.2em] text-brand-ink">KHALIIF</div>
          <div className="text-[10px] font-semibold text-brand-blue">SECOND HAND CLOTHES COMPANY</div>
        </div>
      )}
    </div>
  );
}
