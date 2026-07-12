"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VALID_TYPES } from "@/lib/constants";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { CITY_OPTIONS } from "@/lib/omanCities";
import MediaUploader from "./MediaUploader";
import LocationPicker from "./LocationPicker";
import type { PinValue } from "./LocationPickerMap";

export default function CreateListingForm() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [pin, setPin] = useState<PinValue | null>(null);

  const cityOption = CITY_OPTIONS.find((c) => c.en === city) || null;

  function humanizeError(code: unknown): string {
    switch (code) {
      case "unauthorized":
        return t("createListing.errors.unauthorized");
      case "invalid_title":
        return t("createListing.errors.invalidTitle");
      case "invalid_type":
        return t("createListing.errors.invalidType");
      case "invalid_city":
        return t("createListing.errors.invalidCity");
      case "invalid_size":
        return t("createListing.errors.invalidSize");
      case "invalid_price":
        return t("createListing.errors.invalidPrice");
      case "invalid_slots":
        return t("createListing.errors.invalidSlots");
      case "server_error":
        return t("createListing.errors.serverError");
      default:
        return "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const splitCsv = (v: FormDataEntryValue | null) =>
      ((v as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const body = {
      title: (fd.get("title") as string)?.trim(),
      city,
      lat: pin ? Number(pin.lat.toFixed(6)) : null,
      lng: pin ? Number(pin.lng.toFixed(6)) : null,
      country: ((fd.get("country") as string) || "OM").trim(),
      address: ((fd.get("address") as string) || "").trim(),
      type: fd.get("type"),
      size_sqm: Number(fd.get("size_sqm")),
      slots: Number(fd.get("slots")) || 1,
      price_sqm: Number(fd.get("price_sqm")),
      description: ((fd.get("description") as string) || "").trim(),
      amenities: splitCsv(fd.get("amenities")),
      images,
      videos,
      free_cancel: fd.get("free_cancel") === "on",
      insurance: fd.get("insurance") === "on",
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(humanizeError(data?.error) || t("createListing.errors.generic"));
        setLoading(false);
        return;
      }
      setSuccess(t("createListing.success", { title: body.title }));
      formRef.current?.reset();
      setImages([]);
      setVideos([]);
      setCity("");
      setPin(null);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setError("");
          setSuccess("");
        }}
        className="bg-bk-cta text-white font-bold px-4 py-2.5 rounded-[8px] text-[13px] hover:bg-bk-cta-hover transition-colors"
      >
        {open ? t("createListing.close") : t("createListing.open")}
      </button>

      {open && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-4 bg-white rounded-[16px] p-6 border border-border space-y-4"
        >
          {error && (
            <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-bk-green-soft text-bk-green p-3 rounded-[8px] text-[13px] font-semibold">
              {success}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.title")}</label>
              <input
                name="title"
                required
                maxLength={200}
                className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.city")}</label>
              <select
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta bg-white"
              >
                <option value="" disabled>
                  {t("createListing.fields.cityPlaceholder")}
                </option>
                {CITY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.en}>
                    {locale === "ar" ? c.ar : c.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.country")}</label>
              <input
                name="country"
                defaultValue="OM"
                maxLength={2}
                className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta uppercase"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.type")}</label>
              <select
                name="type"
                required
                defaultValue=""
                className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta bg-white"
              >
                <option value="" disabled>
                  {t("createListing.fields.typePlaceholder")}
                </option>
                {VALID_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`listingType.${tp}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">
                {t("createListing.fields.size")}
              </label>
              <input
                name="size_sqm"
                type="number"
                required
                min={1}
                step={1}
                className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.slots")}</label>
              <input
                name="slots"
                type="number"
                required
                min={1}
                step={1}
                defaultValue={1}
                className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">
              {t("createListing.fields.price")}
            </label>
            <input
              name="price_sqm"
              type="number"
              required
              min={0.001}
              step={0.001}
              className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
            />
            <p className="text-[11px] text-muted mt-1">{t("createListing.fields.priceHelp")}</p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.address")}</label>
            <input
              name="address"
              placeholder={t("createListing.fields.addressPlaceholder")}
              className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">
              {t("createListing.fields.location")}
            </label>
            <LocationPicker
              value={pin}
              cityCenter={
                cityOption ? { lat: cityOption.lat, lng: cityOption.lng } : null
              }
              onChange={setPin}
              onClear={() => setPin(null)}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">{t("createListing.fields.description")}</label>
            <textarea
              name="description"
              rows={3}
              className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">
              {t("createListing.fields.media")}
            </label>
            <MediaUploader
              images={images}
              videos={videos}
              onImagesChange={setImages}
              onVideosChange={setVideos}
            />
            <p className="text-[11px] text-muted mt-1">{t("createListing.fields.mediaHelp")}</p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">
              {t("createListing.fields.amenities")}
            </label>
            <input
              name="amenities"
              placeholder={t("createListing.fields.amenitiesPlaceholder")}
              className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" name="free_cancel" /> {t("createListing.fields.freeCancel")}
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" name="insurance" /> {t("createListing.fields.insurance")}
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-bk-cta text-white font-bold px-5 py-2.5 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
            >
              {loading ? t("createListing.creating") : t("createListing.submit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError("");
                setSuccess("");
              }}
              className="text-[13px] font-semibold text-muted hover:text-heading"
            >
              {t("createListing.done")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
