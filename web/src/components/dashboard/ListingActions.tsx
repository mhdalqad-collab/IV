"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VALID_TYPES } from "@/lib/constants";
import { useT } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import type { Listing } from "@/types";
import MediaUploader from "./MediaUploader";

export default function ListingActions({ listing }: { listing: Listing }) {
  const router = useRouter();
  const t = useT();
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>(listing.images || []);
  const [videos, setVideos] = useState<string[]>(listing.videos || []);

  function openEditor() {
    setImages(listing.images || []);
    setVideos(listing.videos || []);
    setError("");
    setEditing(true);
  }

  function humanizeError(code: unknown): string {
    switch (code) {
      case "unauthorized":
        return t("listingActions.errors.unauthorized");
      case "forbidden":
        return t("listingActions.errors.forbidden");
      case "not_found":
        return t("listingActions.errors.notFound");
      case "invalid_type":
        return t("listingActions.errors.invalidType");
      case "invalid_body":
        return t("listingActions.errors.invalidBody");
      case "no_fields":
        return t("listingActions.errors.noFields");
      case "server_error":
        return t("listingActions.errors.serverError");
      default:
        return "";
    }
  }

  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEditing(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const splitCsv = (v: FormDataEntryValue | null) =>
      ((v as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const body = {
      title: (fd.get("title") as string)?.trim(),
      city: (fd.get("city") as string)?.trim(),
      country: ((fd.get("country") as string) || "OM").trim(),
      address: ((fd.get("address") as string) || "").trim(),
      type: fd.get("type"),
      size_sqm: Number(fd.get("size_sqm")),
      price_sqm: Number(fd.get("price_sqm")),
      description: ((fd.get("description") as string) || "").trim(),
      amenities: splitCsv(fd.get("amenities")),
      images,
      videos,
      free_cancel: fd.get("free_cancel") === "on",
      insurance: fd.get("insurance") === "on",
    };

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(humanizeError(data?.error) || t("listingActions.errors.generic"));
        setLoading(false);
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        setEditing(false);
        setSuccess(false);
      }, 600);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("listingActions.deleteConfirm", { title: listing.title })))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(humanizeError(data?.error) || t("listingActions.errors.deleteFailed"));
        return;
      }
      router.refresh();
    } catch {
      alert(t("common.networkError"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex gap-3 text-[12px] font-semibold">
        <button
          type="button"
          onClick={openEditor}
          className="text-bk-cta hover:underline"
        >
          {t("listingActions.edit")}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || !listing.is_active}
          className="text-bk-red hover:underline disabled:opacity-40 disabled:no-underline"
          title={!listing.is_active ? t("listingActions.titleAlreadyHidden") : t("listingActions.titleHide")}
        >
          {deleting ? "…" : listing.is_active ? t("listingActions.delete") : t("listingActions.hidden")}
        </button>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(false);
          }}
        >
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[720px] my-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-heading">
                {t("listingActions.modalTitle", { id: listing.id })}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-muted hover:text-heading text-[20px] leading-none"
                aria-label={t("common.close")}
              >
                &times;
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-bk-green-soft text-bk-green p-3 rounded-[8px] text-[13px] font-semibold">
                  {t("listingActions.saved")}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("createListing.fields.title")}>
                  <input
                    name="title"
                    required
                    maxLength={200}
                    defaultValue={listing.title}
                    className={inputCls}
                  />
                </Field>
                <Field label={t("createListing.fields.city")}>
                  <input
                    name="city"
                    required
                    defaultValue={listing.city}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label={t("createListing.fields.country")}>
                  <input
                    name="country"
                    maxLength={2}
                    defaultValue={listing.country}
                    className={`${inputCls} uppercase`}
                  />
                </Field>
                <Field label={t("createListing.fields.type")}>
                  <select
                    name="type"
                    required
                    defaultValue={listing.type}
                    className={`${inputCls} bg-white`}
                  >
                    {VALID_TYPES.map((tp) => (
                      <option key={tp} value={tp}>
                        {t(`listingType.${tp}` as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("createListing.fields.size")}>
                  <input
                    name="size_sqm"
                    type="number"
                    required
                    min={1}
                    step={1}
                    defaultValue={Number(listing.size_sqm)}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label={t("createListing.fields.price")}>
                <input
                  name="price_sqm"
                  type="number"
                  required
                  min={0.001}
                  step={0.001}
                  defaultValue={Number(listing.price_sqm)}
                  className={inputCls}
                />
              </Field>

              <Field label={t("createListing.fields.address")}>
                <input
                  name="address"
                  defaultValue={listing.address || ""}
                  className={inputCls}
                />
              </Field>

              <Field label={t("createListing.fields.description")}>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={listing.description || ""}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label={t("createListing.fields.media")}>
                <MediaUploader
                  images={images}
                  videos={videos}
                  onImagesChange={setImages}
                  onVideosChange={setVideos}
                />
              </Field>

              <Field label={t("createListing.fields.amenities")}>
                <input
                  name="amenities"
                  defaultValue={(listing.amenities || []).join(", ")}
                  className={inputCls}
                />
              </Field>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    name="free_cancel"
                    defaultChecked={listing.free_cancel}
                  />{" "}
                  {t("createListing.fields.freeCancel")}
                </label>
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    name="insurance"
                    defaultChecked={listing.insurance}
                  />{" "}
                  {t("createListing.fields.insurance")}
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-bk-cta text-white font-bold px-5 py-2.5 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
                >
                  {loading ? t("listingActions.saving") : t("listingActions.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-[13px] font-semibold text-muted hover:text-heading"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const inputCls =
  "w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-heading mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
