"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function HeaderAuth() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[13px] opacity-80">{session.user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="border border-white/30 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10 transition-colors"
        >
          Sign out
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
        Register
      </Link>
      <Link
        href="/login"
        className="border border-white/30 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10 transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}
