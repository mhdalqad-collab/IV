import Link from "next/link";
import HeaderAuth from "./HeaderAuth";
import CategoryNav from "./CategoryNav";
import CurrencySelector from "@/components/currency/CurrencySelector";

export default function Header() {
  return (
    <header className="bg-bk-blue text-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-[22px] font-extrabold tracking-tight">
            Selk.com <sup className="text-[10px] font-bold text-bk-amber">B2B</sup>
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            <CurrencySelector />
            <Link href="/dashboard" className="opacity-90 hover:opacity-100">
              List your space
            </Link>
            <HeaderAuth />
          </div>
        </div>
      </div>
      <CategoryNav />
    </header>
  );
}
