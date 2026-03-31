import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="w-10 h-10 bg-[var(--brand-blue)] rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
          <span className="text-white font-bold text-xl">TS</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--brand-orange)] rounded-sm"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-[var(--brand-blue)] font-extrabold text-xl leading-none">TS COURIERS</span>
        <span className="text-[var(--brand-orange)] font-bold text-[10px] tracking-[0.2em] leading-tight">DOMINICAN SHIPPING</span>
      </div>
    </Link>
  );
}
