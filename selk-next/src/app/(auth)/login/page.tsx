"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ERROR_MAP: Record<string, string> = {
  CredentialsSignin: "Email or password is incorrect.",
  invalid_credentials: "Email or password is incorrect.",
  default: "Something went wrong. Please try again.",
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: (form.get("email") as string).trim(),
      password: form.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError(ERROR_MAP[result.error] || ERROR_MAP.default);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-[480px] px-6">
        <div className="bg-white rounded-[16px] shadow-md p-8">
          <h2 className="text-[24px] font-bold text-heading mb-1">
            Welcome back
          </h2>
          <p className="text-muted text-[14px] mb-5">
            Sign in to manage your bookings and listings.
          </p>
          {error && (
            <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold mb-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-heading mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-heading mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bk-cta text-white font-bold py-3 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
            >
              {loading ? "Please wait..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-[13px] text-muted mt-4">
            New to Selk?{" "}
            <Link href="/signup" className="text-bk-cta font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
