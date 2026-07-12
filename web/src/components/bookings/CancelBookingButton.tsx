"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/LocaleProvider";

export default function CancelBookingButton({ id }: { id: number }) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm(t("myBookings.cancelConfirm", { id }))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || t("myBookings.cancelFailed"));
        return;
      }
      router.refresh();
    } catch {
      alert(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="text-[12px] font-semibold text-bk-red hover:underline disabled:opacity-40 disabled:no-underline"
    >
      {loading ? t("myBookings.cancelling") : t("myBookings.cancelBooking")}
    </button>
  );
}
