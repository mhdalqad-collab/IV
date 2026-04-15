import Link from "next/link";

const categories = [
  { type: "warehouse", label: "Warehouses", icon: "M3 10v10h18V10 M2 10l10-7 10 7 M9 20v-6h6v6" },
  { type: "container", label: "Containers", icon: "M3 8h18v10H3z M7 8v10 M17 8v10" },
  { type: "climate", label: "Climate-controlled", icon: "M12 2v6 M4 12a8 8 0 0116 0v8H4z M8 16h8" },
  { type: "basement", label: "Basements", icon: "M3 21V7l9-4 9 4v14 M9 21v-8h6v8" },
  { type: "garage", label: "Garages", icon: "M2 9h20v10H2z M7 19a2 2 0 100-4 2 2 0 000 4z M17 19a2 2 0 100-4 2 2 0 000 4z" },
  { type: "outdoor", label: "Outdoor", icon: "M3 9h18 M5 9V5h14v4 M5 9v12h14V9" },
];

export default function CategoryNav() {
  return (
    <div className="border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-6">
        <nav className="flex gap-1 overflow-x-auto py-1" aria-label="Categories">
          {categories.map((cat) => (
            <Link
              key={cat.type}
              href={`/search?type=${cat.type}`}
              className="flex flex-col items-center gap-1 px-4 py-2.5 text-[12px] font-medium text-white/70 hover:text-white border-b-2 border-transparent hover:border-white/80 transition-all whitespace-nowrap"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-5 h-5"
              >
                {cat.icon.split(" M").map((d, i) => (
                  <path key={i} d={i === 0 ? d : `M${d}`} />
                ))}
              </svg>
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
