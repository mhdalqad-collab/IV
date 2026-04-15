import { NextRequest, NextResponse } from "next/server";

function buildUrl(path: string, request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "selk.om";
  return new URL(path, `${proto}://${host}`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle old .html URL redirects
  if (pathname === "/listing.html") {
    const id = request.nextUrl.searchParams.get("id");
    if (id) return NextResponse.redirect(buildUrl(`/listing/${id}`, request));
    return NextResponse.redirect(buildUrl("/search", request));
  }
  if (pathname === "/booking.html") {
    const listingId = request.nextUrl.searchParams.get("listing");
    if (listingId)
      return NextResponse.redirect(
        buildUrl(`/booking/${listingId}`, request)
      );
    return NextResponse.redirect(buildUrl("/search", request));
  }

  // Auth protection is handled in the page components themselves
  // (dashboard and booking pages check auth server-side and redirect)

  return NextResponse.next();
}

export const config = {
  matcher: ["/listing.html", "/booking.html"],
};
