"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(page));
    router.push(`/search?${params.toString()}`);
  }

  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 text-[13px] font-semibold text-muted rounded-[8px] hover:bg-feature disabled:opacity-30"
      >
        &larr; Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={`w-9 h-9 rounded-[8px] text-[13px] font-semibold transition-colors ${
            p === currentPage
              ? "bg-bk-cta text-white"
              : "text-body hover:bg-feature"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 text-[13px] font-semibold text-muted rounded-[8px] hover:bg-feature disabled:opacity-30"
      >
        Next &rarr;
      </button>
    </div>
  );
}
