import Link from "next/link";

const columns = [
  {
    title: "Support",
    links: [
      { label: "Manage your bookings", href: "#" },
      { label: "Contact customer service", href: "#" },
      { label: "Safety resource center", href: "#" },
      { label: "Insurance & liability", href: "#" },
      { label: "Dispute resolution", href: "#" },
      { label: "Cancel booking", href: "#" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Selk Pro", href: "#" },
      { label: "Seasonal offers", href: "#" },
      { label: "Market index", href: "#" },
      { label: "Selk for enterprise", href: "#" },
      { label: "Logistics directory", href: "#" },
      { label: "Editorial", href: "#" },
    ],
  },
  {
    title: "Terms & settings",
    links: [
      { label: "Privacy notice", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Cookie preferences", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Extranet login", href: "/dashboard" },
      { label: "List your space", href: "/dashboard" },
      { label: "Partner help", href: "#" },
      { label: "Become an affiliate", href: "#" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Selk", href: "#" },
      { label: "How we work", href: "#" },
      { label: "Sustainability", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press center", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-bk-blue text-white/80 text-[13px] pt-12 pb-8">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="text-white font-bold text-[14px] mb-3">
                {col.title}
              </h5>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-8">
          <div>
            <div className="text-[20px] font-extrabold text-white mb-2">
              Selk.com
            </div>
            <p className="max-w-md">
              Selk is a registered B2B marketplace for unused industrial storage
              space. Berlin &middot; Rotterdam &middot; Singapore &middot; New York.
            </p>
            <p className="mt-1.5 text-white/50">
              Copyright &copy; 2026 Selk Logistics GmbH. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-[11px] font-bold text-white/40 tracking-wider">
            <span>SELK.COM</span>
            <span>SELK PRO</span>
            <span>SELK CUSTOMS</span>
            <span>SELK INSURE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
