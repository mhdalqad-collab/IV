export const VALID_TYPES = [
  "warehouse",
  "container",
  "climate",
  "basement",
  "garage",
  "outdoor",
] as const;

export type ListingType = (typeof VALID_TYPES)[number];

export const SORT_MAP: Record<string, string> = {
  price_asc: "price_sqm ASC",
  price_desc: "price_sqm DESC",
  size_asc: "size_sqm ASC",
  size_desc: "size_sqm DESC",
  rating: "rating DESC",
  newest: "created_at DESC",
};

export const TYPE_LABELS: Record<ListingType, string> = {
  warehouse: "Warehouse",
  container: "Container",
  climate: "Climate-controlled",
  basement: "Basement",
  garage: "Garage",
  outdoor: "Outdoor",
};
