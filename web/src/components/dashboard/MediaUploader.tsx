"use client";

import { useRef, useState } from "react";
import { useT } from "@/components/i18n/LocaleProvider";

type UploadResult = { url: string; kind: "image" | "video" };

export default function MediaUploader({
  images,
  videos,
  onImagesChange,
  onVideosChange,
}: {
  images: string[];
  videos: string[];
  onImagesChange: (next: string[]) => void;
  onVideosChange: (next: string[]) => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function errorFor(code: unknown): string {
    switch (code) {
      case "unauthorized":
        return t("media.errors.unauthorized");
      case "image_too_large":
        return t("media.errors.imageTooLarge");
      case "video_too_large":
        return t("media.errors.videoTooLarge");
      case "unsupported_video":
      case "unsupported_type":
        return t("media.errors.unsupported");
      case "too_many_files":
        return t("media.errors.tooMany");
      default:
        return t("media.errors.generic");
    }
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of arr) fd.append("files", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(errorFor(data?.error));
        return;
      }
      const results: UploadResult[] = data.files || [];
      const newImages = results.filter((r) => r.kind === "image").map((r) => r.url);
      const newVideos = results.filter((r) => r.kind === "video").map((r) => r.url);
      if (newImages.length) onImagesChange([...images, ...newImages]);
      if (newVideos.length) onVideosChange([...videos, ...newVideos]);
    } catch {
      setError(t("media.errors.network"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    onImagesChange(images.filter((u) => u !== url));
  }
  function removeVideo(url: string) {
    onVideosChange(videos.filter((u) => u !== url));
  }
  function makeCover(url: string) {
    onImagesChange([url, ...images.filter((u) => u !== url)]);
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-bk-cta bg-bk-cta-soft"
            : "border-border hover:border-bk-cta hover:bg-feature"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7 text-bk-cta">
          <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 16.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5" strokeLinecap="round" />
        </svg>
        <div className="text-[14px] font-semibold text-heading">
          {uploading ? t("media.uploading") : t("media.dropHere")}
        </div>
        <div className="text-[11px] text-muted">{t("media.hint")}</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-[12px] font-semibold text-bk-red">{error}</p>
      )}

      {/* Image thumbnails */}
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative group aspect-square rounded-[8px] overflow-hidden border border-border bg-feature"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 start-1 bg-bk-cta text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[999px]">
                  {t("media.cover")}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    className="text-white text-[10px] font-semibold hover:underline"
                  >
                    {t("media.setCover")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="ms-auto text-white text-[10px] font-semibold hover:underline"
                >
                  {t("media.remove")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video previews */}
      {videos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {videos.map((url) => (
            <div
              key={url}
              className="relative group rounded-[8px] overflow-hidden border border-border bg-black"
            >
              <video src={url} className="w-full h-24 object-cover" muted preload="metadata" />
              <span className="absolute top-1 start-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[999px]">
                {t("media.video")}
              </span>
              <button
                type="button"
                onClick={() => removeVideo(url)}
                className="absolute top-1 end-1 bg-black/60 text-white text-[12px] leading-none w-5 h-5 rounded-full flex items-center justify-center hover:bg-bk-red"
                aria-label={t("media.remove")}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
