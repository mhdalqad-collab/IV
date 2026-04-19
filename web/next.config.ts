import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/search.html", destination: "/search", permanent: true },
      { source: "/login.html", destination: "/login", permanent: true },
      { source: "/signup.html", destination: "/signup", permanent: true },
      { source: "/dashboard.html", destination: "/dashboard", permanent: true },
    ];
  },
};

export default nextConfig;
