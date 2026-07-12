// Shared booking price math — used by both the bookings API (authoritative)
// and the checkout form (estimate), so the two can never disagree.
//
// Billing model: calendar months, pro-rated by day for partial months.
// end_date is inclusive (the renter holds the space through that day), so
// the billable span runs from start_date to end_date + 1 day. Minimum charge
// is one month.

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(value: string): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  )
    return null;
  return date;
}

// Add n months, clamping the day-of-month (Jan 31 + 1 month = Feb 28/29).
function addMonthsClamped(d: Date, n: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, lastDay)));
}

export function billableMonths(
  startDate: string,
  endDate: string
): number | null {
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  if (!start || !end || end <= start) return null;

  const bound = new Date(end.getTime() + DAY_MS); // exclusive occupancy end

  let whole =
    (bound.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (bound.getUTCMonth() - start.getUTCMonth());
  let anchor = addMonthsClamped(start, whole);
  if (anchor > bound) {
    whole -= 1;
    anchor = addMonthsClamped(start, whole);
  }

  const remDays = (bound.getTime() - anchor.getTime()) / DAY_MS;
  if (remDays === 0) return Math.max(1, whole);

  const monthLen =
    (addMonthsClamped(anchor, 1).getTime() - anchor.getTime()) / DAY_MS;
  return Math.max(1, whole + remDays / monthLen);
}

export function bookingTotal(
  priceSqm: number,
  sizeSqm: number,
  startDate: string,
  endDate: string
): { months: number; total: number } | null {
  const months = billableMonths(startDate, endDate);
  if (months === null || !(priceSqm > 0) || !(sizeSqm > 0)) return null;
  // 3 decimals: OMR prices are stored with baisa precision
  const total = Math.round(priceSqm * sizeSqm * months * 1000) / 1000;
  return { months, total };
}
