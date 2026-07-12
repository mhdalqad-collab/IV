"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/LocaleProvider";

export default function SignupPage() {
  const router = useRouter();
  const t = useT();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wantsToList, setWantsToList] = useState(false);

  function errorFor(code: string | undefined) {
    switch (code) {
      case "email_taken":
        return t("signup.errors.emailTaken");
      case "invalid_email":
        return t("signup.errors.invalidEmail");
      case "password_min_8":
        return t("signup.errors.passwordMin");
      case "password_mismatch":
        return t("signup.errors.passwordMismatch");
      case "invalid_cr_number":
        return t("signup.errors.invalidCrn");
      default:
        return t("common.somethingWrong");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string).trim();
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirm_password") as string;
    const crn = ((form.get("commercial_register_number") as string) || "").trim();

    if (password !== confirmPassword) {
      setError(errorFor("password_mismatch"));
      return;
    }

    if (wantsToList && !crn) {
      setError(errorFor("invalid_cr_number"));
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
        setError(errorFor(data.error));
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(errorFor(undefined));
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(errorFor(undefined));
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-[480px] px-6">
        <div className="bg-white rounded-[16px] shadow-md p-8">
          <h2 className="text-[24px] font-bold text-heading mb-1">
            {t("signup.title")}
          </h2>
          <p className="text-muted text-[14px] mb-5">{t("signup.subtitle")}</p>
          {error && (
            <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold mb-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-heading mb-1">
                {t("signup.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t("signup.emailPlaceholder")}
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-heading mb-1">
                {t("signup.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder={t("signup.passwordPlaceholder")}
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-[13px] font-semibold text-heading mb-1">
                {t("signup.confirmPassword")}
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder={t("signup.confirmPasswordPlaceholder")}
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-heading font-semibold select-none">
              <input
                type="checkbox"
                checked={wantsToList}
                onChange={(e) => setWantsToList(e.target.checked)}
              />
              {t("signup.wantToList")}
            </label>
            {wantsToList && (
              <div>
                <label htmlFor="commercial_register_number" className="block text-[13px] font-semibold text-heading mb-1">
                  {t("signup.crn")}
                </label>
                <input
                  id="commercial_register_number"
                  name="commercial_register_number"
                  type="text"
                  required
                  maxLength={64}
                  placeholder={t("signup.crnPlaceholder")}
                  className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
                />
                <p className="text-muted text-[12px] mt-1">{t("signup.crnHelp")}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bk-cta text-white font-bold py-3 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
            >
              {loading ? t("common.pleaseWait") : t("signup.submit")}
            </button>
          </form>
          <p className="text-center text-[13px] text-muted mt-4">
            {t("signup.haveAccount")}{" "}
            <Link href="/login" className="text-bk-cta font-semibold">
              {t("signup.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
