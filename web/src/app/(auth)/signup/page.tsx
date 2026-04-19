"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ERROR_MAP: Record<string, string> = {
  email_taken: "That email is already registered.",
  invalid_email: "Please enter a valid email.",
  password_min_8: "Password must be at least 8 characters.",
  password_mismatch: "Passwords don't match.",
  invalid_cr_number: "Please enter a valid commercial register number.",
  default: "Something went wrong. Please try again.",
};

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wantsToList, setWantsToList] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string).trim();
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirm_password") as string;
    const crn = ((form.get("commercial_register_number") as string) || "").trim();

    if (password !== confirmPassword) {
      setError(ERROR_MAP.password_mismatch);
      return;
    }

    if (wantsToList && !crn) {
      setError(ERROR_MAP.invalid_cr_number);
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string> = { email, password };
      if (wantsToList && crn) payload.commercial_register_number = crn;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(ERROR_MAP[data.error] || ERROR_MAP.default);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MAP.default);
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(ERROR_MAP.default);
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-[480px] px-6">
        <div className="bg-white rounded-[16px] shadow-md p-8">
          <h2 className="text-[24px] font-bold text-heading mb-1">
            Create your account
          </h2>
          <p className="text-muted text-[14px] mb-5">
            Get started with Selk — list or book storage space.
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
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-[13px] font-semibold text-heading mb-1">
                Confirm password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-heading font-semibold select-none">
              <input
                type="checkbox"
                checked={wantsToList}
                onChange={(e) => setWantsToList(e.target.checked)}
              />
              I want to list storage
            </label>
            {wantsToList && (
              <div>
                <label htmlFor="commercial_register_number" className="block text-[13px] font-semibold text-heading mb-1">
                  Commercial register number
                </label>
                <input
                  id="commercial_register_number"
                  name="commercial_register_number"
                  type="text"
                  required
                  maxLength={64}
                  placeholder="e.g. 1234567"
                  className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
                />
                <p className="text-muted text-[12px] mt-1">
                  Required to verify your business when listing storage.
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bk-cta text-white font-bold py-3 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
            >
              {loading ? "Please wait..." : "Create account"}
            </button>
          </form>
          <p className="text-center text-[13px] text-muted mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-bk-cta font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
