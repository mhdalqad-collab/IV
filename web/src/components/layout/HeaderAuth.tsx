"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useT } from "@/components/i18n/LocaleProvider";

export default function HeaderAuth() {
  const { data: session } = useSession();
  const t = useT();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/bookings"
          className="text-[13px] opacity-90 hover:opacity-100"
        >
          {t("header.myBookings")}
        </Link>
        <span className="text-[13px] opacity-80">{session.user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="border border-white/30 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10 transition-colors"
        >
          {t("header.signOut")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/signup"
        className="border border-white/30 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10 transition-colors"
      >
        {t("header.register")}
      </Link>
      <Link
        href="/login"
        className="border border-white/30 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10 transition-colors"
      >
        {t("header.signIn")}
      </Link>
    </div>
  );
}
