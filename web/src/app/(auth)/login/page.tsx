"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/LocaleProvider";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
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
      const code = result.error;
      const msg =
        code === "CredentialsSignin" || code === "invalid_credentials"
          ? t("login.errors.credentials")
          : t("common.somethingWrong");
      setError(msg);
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
            {t("login.title")}
          </h2>
          <p className="text-muted text-[14px] mb-5">{t("login.subtitle")}</p>
          {error && (
            <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold mb-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-heading mb-1">
                {t("login.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-heading mb-1">
                {t("login.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder={t("login.passwordPlaceholder")}
                className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta focus:ring-2 focus:ring-bk-cta-soft transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bk-cta text-white font-bold py-3 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
            >
              {loading ? t("common.pleaseWait") : t("login.submit")}
            </button>
          </form>
          <p className="text-center text-[13px] text-muted mt-4">
            {t("login.newToSelk")}{" "}
            <Link href="/signup" className="text-bk-cta font-semibold">
              {t("login.createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
