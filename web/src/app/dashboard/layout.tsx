export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navSections = [
    {
      title: "Property",
      items: [
        { label: "Overview", href: "/dashboard", active: true },
        { label: "Listings", href: "/dashboard" },
        { label: "Reservations", href: "/dashboard" },
      ],
    },
    {
      title: "Finance",
      items: [
        { label: "Earnings", href: "/dashboard" },
        { label: "Payouts", href: "#" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Company profile", href: "#" },
        { label: "Settings", href: "#" },
      ],
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="grid grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-6">
          <h2 className="text-[18px] font-bold text-heading">Partner extranet</h2>
          {navSections.map((sec) => (
            <div key={sec.title}>
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                {sec.title}
              </div>
              <ul className="space-y-0.5">
                {sec.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`block px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                        item.active
                          ? "bg-bk-cta-soft text-bk-cta font-semibold"
                          : "text-body hover:bg-feature"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
