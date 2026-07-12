export function ratingLabel(rating: number): string {
  if (rating >= 9) return "Excellent";
  if (rating >= 8) return "Very good";
  if (rating >= 7) return "Good";
  return "Pleasant";
}

export type RatingLabelKey = "excellent" | "veryGood" | "good" | "pleasant";

export function ratingLabelKey(rating: number): RatingLabelKey {
  if (rating >= 9) return "excellent";
  if (rating >= 8) return "veryGood";
  if (rating >= 7) return "good";
  return "pleasant";
}

export function starCount(rating: number): number {
  return Math.min(5, Math.ceil(rating / 2));
}

export function monthlyEstimate(priceSqm: number, sizeSqm: number): number {
  return priceSqm * Math.min(sizeSqm, 120);
}

export function calcBookingPrice(
  priceSqm: number,
  sizeSqm: number,
  startDate: string,
  endDate: string
): { months: number; total: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const months = Math.max(1, Math.ceil(days / 30));
  const total = Number((priceSqm * sizeSqm * months).toFixed(2));
  return { months, total };
}

export function formatCurrency(amount: number, currency = "OMR"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
