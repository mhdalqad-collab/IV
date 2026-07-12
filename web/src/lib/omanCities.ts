// Client-safe module: map-marker type, the city list used by the listing
// form's dropdown, and a fallback resolver used to position listings whose
// row has no lat/lng. Markers themselves always come from the listings
// table — these coordinates are only city centers.

export type MapListing = {
  id: number;
  title: string;
  city: string;
  type: string;
  priceSqm: number;
  sizeSqm: number;
  lat: number;
  lng: number;
  /** true when positioned at the city center because the row has no lat/lng */
  approx: boolean;
};

type Coords = { lat: number; lng: number };

export type CityOption = {
  key: string;
  en: string;
  ar: string;
  lat: number;
  lng: number;
};

// Muscat first (most common), then alphabetical. `en` is the canonical value
// stored in listings.city.
export const CITY_OPTIONS: CityOption[] = [
  { key: "muscat", en: "Muscat", ar: "مسقط", lat: 23.588, lng: 58.3829 },
  { key: "adam", en: "Adam", ar: "أدم", lat: 22.3792, lng: 57.5272 },
  { key: "amerat", en: "Al Amerat", ar: "العامرات", lat: 23.5241, lng: 58.4983 },
  { key: "buraimi", en: "Al Buraimi", ar: "البريمي", lat: 24.26, lng: 55.79 },
  { key: "khaburah", en: "Al Khaburah", ar: "الخابورة", lat: 23.9714, lng: 57.0937 },
  { key: "musannah", en: "Al Musannah", ar: "المصنعة", lat: 23.7661, lng: 57.628 },
  { key: "suwaiq", en: "Al Suwaiq", ar: "السويق", lat: 23.8494, lng: 57.4386 },
  { key: "bahla", en: "Bahla", ar: "بهلاء", lat: 22.9714, lng: 57.3025 },
  { key: "barka", en: "Barka", ar: "بركاء", lat: 23.707, lng: 57.8886 },
  { key: "bawshar", en: "Bawshar", ar: "بوشر", lat: 23.5773, lng: 58.3995 },
  { key: "bidbid", en: "Bidbid", ar: "بدبد", lat: 23.4072, lng: 58.1289 },
  { key: "duqm", en: "Duqm", ar: "الدقم", lat: 19.6681, lng: 57.7045 },
  { key: "haima", en: "Haima", ar: "هيما", lat: 19.959, lng: 56.276 },
  { key: "ibra", en: "Ibra", ar: "إبراء", lat: 22.6906, lng: 58.5334 },
  { key: "ibri", en: "Ibri", ar: "عبري", lat: 23.2257, lng: 56.5158 },
  { key: "izki", en: "Izki", ar: "إزكي", lat: 22.9333, lng: 57.7666 },
  { key: "khasab", en: "Khasab", ar: "خصب", lat: 26.1839, lng: 56.248 },
  { key: "mirbat", en: "Mirbat", ar: "مرباط", lat: 16.9925, lng: 54.6929 },
  { key: "muttrah", en: "Muttrah", ar: "مطرح", lat: 23.6167, lng: 58.5667 },
  { key: "nizwa", en: "Nizwa", ar: "نزوى", lat: 22.9333, lng: 57.5333 },
  { key: "rustaq", en: "Rustaq", ar: "الرستاق", lat: 23.3908, lng: 57.4244 },
  { key: "saham", en: "Saham", ar: "صحم", lat: 24.1722, lng: 56.8886 },
  { key: "salalah", en: "Salalah", ar: "صلالة", lat: 17.0151, lng: 54.0924 },
  { key: "samail", en: "Samail", ar: "سمائل", lat: 23.3, lng: 57.9833 },
  { key: "seeb", en: "Seeb", ar: "السيب", lat: 23.6703, lng: 58.1891 },
  { key: "shinas", en: "Shinas", ar: "شناص", lat: 24.7426, lng: 56.467 },
  { key: "sohar", en: "Sohar", ar: "صحار", lat: 24.3643, lng: 56.7461 },
  { key: "sur", en: "Sur", ar: "صور", lat: 22.5666, lng: 59.5288 },
  { key: "thumrait", en: "Thumrait", ar: "ثمريت", lat: 17.666, lng: 54.0237 },
];

const CITIES: Record<string, Coords> = Object.fromEntries(
  CITY_OPTIONS.map((c) => [c.key, { lat: c.lat, lng: c.lng }])
);

// alias (any spelling users type in the city field) -> canonical key above
const ALIASES: Record<string, string> = {
  مسقط: "muscat",
  السيب: "seeb",
  مطرح: "muttrah",
  بوشر: "bawshar",
  العامرات: "amerat",
  "al amerat": "amerat",
  "al amarat": "amerat",
  amarat: "amerat",
  بركاء: "barka",
  صحار: "sohar",
  صلالة: "salalah",
  الدقم: "duqm",
  "al duqm": "duqm",
  نزوى: "nizwa",
  صور: "sur",
  عبري: "ibri",
  خصب: "khasab",
  البريمي: "buraimi",
  "al buraimi": "buraimi",
  الرستاق: "rustaq",
  السويق: "suwaiq",
  المصنعة: "musannah",
  "al musanaah": "musannah",
  "al musannah": "musannah",
  musanaah: "musannah",
  إبراء: "ibra",
  بهلاء: "bahla",
  سمائل: "samail",
  إزكي: "izki",
  أدم: "adam",
  صحم: "saham",
  الخابورة: "khaburah",
  "al khaburah": "khaburah",
  khabura: "khaburah",
  شناص: "shinas",
  بدبد: "bidbid",
  ثمريت: "thumrait",
  مرباط: "mirbat",
  هيما: "haima",
  // Governorates — users often enter these instead of a city; map them to
  // the governorate's main hub. Includes common misspellings seen in data.
  dhofar: "salalah",
  dofhar: "salalah", // common misspelling
  ظفار: "salalah",
  musandam: "khasab",
  مسندم: "khasab",
  "al wusta": "haima",
  الوسطى: "haima",
  "ad dakhiliyah": "nizwa",
  dakhiliyah: "nizwa",
  الداخلية: "nizwa",
  "ad dhahirah": "ibri",
  dhahirah: "ibri",
  الظاهرة: "ibri",
  "al batinah": "sohar",
  batinah: "sohar",
  الباطنة: "sohar",
  "north al batinah": "sohar",
  "شمال الباطنة": "sohar",
  "south al batinah": "rustaq",
  "جنوب الباطنة": "rustaq",
  sharqiyah: "sur",
  "ash sharqiyah": "sur",
  الشرقية: "sur",
  "north ash sharqiyah": "ibra",
  "شمال الشرقية": "ibra",
  "south ash sharqiyah": "sur",
  "جنوب الشرقية": "sur",
};

function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[ً-ْ]/g, "") // Arabic diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ء/g, "")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[-_,.]/g, " ")
    .replace(/\bgovernorate\b|\bwilayat\b|محافظه|ولايه/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^ال/, "")
    .replace(/^al /, "");
}

const LOOKUP: Record<string, Coords> = {};
for (const [key, coords] of Object.entries(CITIES)) LOOKUP[normalize(key)] = coords;
for (const c of CITY_OPTIONS) {
  LOOKUP[normalize(c.en)] = { lat: c.lat, lng: c.lng };
  LOOKUP[normalize(c.ar)] = { lat: c.lat, lng: c.lng };
}
for (const [alias, key] of Object.entries(ALIASES)) {
  if (CITIES[key]) LOOKUP[normalize(alias)] = CITIES[key];
}

export function resolveCityCoords(city: string): Coords | null {
  return LOOKUP[normalize(city)] ?? null;
}
