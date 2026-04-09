# Booking.com — Complete UI/UX Design Principles & System Guide

> A comprehensive design specification for building a travel booking website modeled after Booking.com. Use this document as a reference for layout, components, colors, typography, UX patterns, and interactions.

---

## 1. BRAND IDENTITY & COLOR SYSTEM

### Primary Colors
| Role | Color | Hex |
|------|-------|-----|
| Primary Blue (Header, Hero BG) | Deep Blue | `#003B95` |
| Primary Blue (Hover) | Dark Blue | `#00266b` |
| CTA / Search Button | Bright Blue | `#0071c2` |
| CTA Hover | Darker Blue | `#005999` |
| Accent / Borders (Gold/Yellow) | Amber | `#FEBB02` |
| Genius Label | Blue | `#003580` |

### Secondary / Neutral Colors
| Role | Color | Hex |
|------|-------|-----|
| Page Background | Off-White | `#F5F5F5` |
| Card Background | White | `#FFFFFF` |
| Feature Card BG | Light Grey | `#F2F2F2` |
| Heading Text | Near Black | `#1A1A1A` |
| Body Text | Dark Grey | `#333333` |
| Muted Text / Subtitles | Medium Grey | `#6B6B6B` |
| Borders / Dividers | Light Grey | `#E0E0E0` |
| Input Border Focused | Amber/Gold | `#FEBB02` |

### Status / Functional Colors
| Role | Color | Hex |
|------|-------|-----|
| Discount / Savings Badge | Green | `#008009` |
| Free Cancellation Tag | Green | `#008009` |
| Warning / Urgency | Red | `#CC0000` |
| Star Rating | Yellow | `#F5A623` |
| Review Score (Good) | Dark Blue | `#003580` |
| Review Score (BG) | Dark Blue | `#003580` |

---

## 2. TYPOGRAPHY

### Font Family
- **Primary Font**: `BlinkMacSystemFont`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica`, `Arial`, sans-serif
- **Fallback Stack**: System UI font stack for cross-platform consistency

### Type Scale
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Hero H1 | 32–40px | 700 (Bold) | White |
| Hero Subtitle | 18–20px | 400 (Regular) | White |
| Section Heading (H2) | 22–26px | 700 | `#1A1A1A` |
| Card Heading (H3) | 16–18px | 700 | `#1A1A1A` |
| Body Text | 14–16px | 400 | `#333333` |
| Caption / Meta | 12–13px | 400 | `#6B6B6B` |
| Button Text | 14–16px | 700 | White |
| Navigation Links | 14px | 500 | White |
| Price | 18–22px | 700 | `#1A1A1A` |
| Discounted Price (old) | 14px | 400 strikethrough | `#6B6B6B` |

### Typography Rules
- Line height: 1.4–1.6 for body text; 1.2 for headings
- Letter spacing: Normal for body; slightly tight (-0.2px) for large headings
- Text is always left-aligned in lists and cards; center-aligned in hero banners or CTA blocks

---

## 3. LAYOUT & GRID SYSTEM

### Container
- Max width: **1280px**
- Horizontal padding: **24px** on desktop, **16px** on mobile
- Centered with `margin: 0 auto`

### Breakpoints
| Breakpoint | Width |
|------------|-------|
| Mobile | < 576px |
| Tablet | 576px – 991px |
| Desktop | 992px – 1280px |
| Wide Desktop | > 1280px |

### Grid
- 12-column CSS grid or flexbox layout
- Standard gutters: **16px** (mobile) / **24px** (desktop)
- Card grids: 1 col (mobile) → 2 col (tablet) → 4 col (desktop)

---

## 4. PAGE STRUCTURE — HOMEPAGE

### 4.1 Top Navigation Bar (Header — Upper Row)
- **Background**: `#003B95` (Deep Blue)
- **Height**: ~56px
- **Logo**: Left-aligned; white text "Booking.com" with bold sans-serif font; no icon, text only logo style
- **Right Side Controls** (in order, right to left):
  - "Sign in" button — outlined white border, white text, hover: white bg + blue text
  - "Register" button — outlined white border, white text
  - "List your property" — plain text link, white
  - Help (?) icon — circular, white icon
  - Language selector — flag icon + text (e.g., "English (US)")
  - Currency selector — text code (e.g., "OMR")
- All elements have hover states (subtle background opacity change)

### 4.2 Category Navigation Bar (Header — Lower Row)
- **Background**: Same `#003B95` or slightly darker
- **Tab Items** (with leading icon):
  - 🏨 Stays (active — outlined pill/capsule border)
  - ✈️ Flights
  - 🚗 Car rental
  - 🎡 Attractions
  - 🚕 Airport taxis
  - ··· More (dropdown)
- Active tab has a **white rounded border/pill** around it
- Inactive tabs are plain white text with icon; hover adds subtle underline or background
- Icons are simple line-art SVGs, white colored

### 4.3 Hero Section
- **Background**: Same `#003B95` (continuation from header, no visual break)
- **Height**: ~220px including hero text + search bar
- **Heading (H1)**: "Find your next stay" — 36px, bold, white
- **Subheading**: "Search deals on hotels, homes, and much more..." — 18px, regular, white
- Heading is left-aligned within the container

#### Hero Search Bar
- White background, rounded corners (4–8px radius)
- Outlined with amber/gold `#FEBB02` border (2px) when focused
- Full-width of container, horizontal layout on desktop
- 3 Input Sections (separated by vertical dividers):
  1. **Destination Input** — icon (bed/location) + placeholder "Where are you going?" — takes ~40% width
  2. **Date Picker** — calendar icon + "Check-in date — Check-out date" — takes ~35% width
  3. **Guests & Rooms** — person icon + "2 adults · 0 children · 1 room" dropdown — takes ~20% width
- **Search Button**: `#0071C2` blue, white text "Search", bold; min-width 100px; right end of bar; hover darkens to `#005999`
- Below search bar: small checkbox — "Add flights to my search"
- On mobile: stacked vertically, each input full-width with the search button full-width at the bottom

---

## 5. MAIN CONTENT SECTIONS

### 5.1 "Why Booking.com?" Section
- **Background**: White `#FFFFFF`
- **Section Heading**: "Why Booking.com?" — H2, bold, dark text, left-aligned
- **Layout**: 4-column horizontal card grid (1 col on mobile, 2 on tablet)
- **Cards**:
  - Background: Light grey `#F2F2F2`, rounded corners (~8px), no shadow initially
  - Content: Illustrated icon (colorful flat illustration, ~64px) + H3 bold heading + short body text
  - No hover effect — purely informational
  - Examples:
    - 📅 "Book now, pay at the property" — "FREE cancellation on most rooms"
    - 👍 "300M+ reviews from fellow travelers" — "Get trusted information from guests like you"
    - 🌍 "2+ million properties worldwide" — "Hotels, guest houses, apartments, and more…"
    - 👩‍💼 "Trusted 24/7 customer service you can rely on" — "We're always here to help"

### 5.2 Offers / Deals Section
- **Background**: White `#FFFFFF`
- **Section Heading**: "Offers" — H2, bold, left-aligned
- **Subtitle**: "Promotions, deals, and special offers for you" — muted grey text below heading
- **Layout**: Banner-style wide card, or horizontal promo cards
- **Promo Card Structure**:
  - Left: Text content — promo label (small caps tag), H2 headline, description text, CTA button
  - Right: High-quality destination hero image (rounded right corners)
  - CTA Button: Blue filled button "Save with a Getaway Deal"
  - Discount highlight: "At least 15% off select stays worldwide"
- **Badge/Label**: Small category label above heading (e.g., "Escape for less with our Getaway Deals")

### 5.3 Browse by Property Type Section
- **Section Heading**: "Browse by property type" — H2, bold
- **Layout**: Horizontally scrollable card row (carousel with prev/next arrows)
  - Arrow buttons: Circular, white background, shadow, positioned at card edges
- **Property Type Cards**:
  - Rounded square card (~160–180px wide)
  - Background: Destination/property type photo
  - Overlay gradient: Dark bottom gradient for text readability
  - Title: Category name (e.g., "Hotels", "Apartments", "Resorts", "Villas", "Cabins", etc.)
  - On hover: slight scale-up (1.03x transform) or shadow increase
  - Full list of types: Hotels, Apartments, Resorts, Villas, Cabins, Cottages, Glamping Sites, Serviced Apartments, Vacation Homes, Guest Houses, Hostels, Motels, B&Bs, Ryokans, Riads, Resort Villages, Homestays, Campgrounds, Country Houses, Farm Stays, Boats, Luxury Tents, Self-Catering, Tiny Houses

### 5.4 Loyalty / Sign-in CTA Banner
- **Background**: Light blue or subtle illustrated background
- **Heading**: "Travel more, spend less" — large bold
- **Sub-heading**: "Sign in, save money"
- **Body text**: "Save 10% or more at participating properties – just look for the blue Genius label"
- **Two CTA Buttons**:
  - "Sign in" — Primary blue filled
  - "Register" — Secondary outlined
- **Genius Label Badge**: Blue badge icon indicating loyalty tier

### 5.5 Popular Destinations Section
- **Heading**: "Popular with travelers from [Country]" — H2, bold
- **Tab Navigation** (horizontal pills):
  - "Domestic cities" | "International cities" | "Regions" | "Countries"
  - Active tab: bold text, underline or blue indicator
- **Location Cards**: Simple text list or small card format
  - City name (bold) + Country name (muted) below
  - On hover: Underline or color highlight
  - Examples: Muscat, Nizwa, Sohar (domestic); Bergen, Las Vegas, Dubai, Pattaya, Almaty (international)

---

## 6. FOOTER

### Structure (4-column layout on desktop, stacked on mobile)
- **Background**: White `#FFFFFF` or very light grey
- **Top border**: 1px `#E0E0E0` divider line
- **Padding**: 40px top and bottom

### Footer Column 1 — Quick Links (Navigation)
- Heading: Hidden (screen reader only) or small caps label
- Links: Countries, Regions, Cities, Districts, Airports, Hotels, Landmarks, Homes/Apartments, Resorts, Villas, Hostels, B&Bs, Guest Houses, Unique accommodations, All destinations, Flights, Car rentals, Holiday packages, Travel guides, Discover, Extended stays

### Footer Column 2 — Support
- Heading: "Support" — bold, slightly larger
- Links: Manage your trips, Contact Customer Service, Safety Resource Center

### Footer Column 3 — Discover
- Heading: "Discover" — bold
- Links: Genius loyalty program, Seasonal and holiday deals, Travel articles, Booking.com for Business, Traveller Review Awards, Car rental, Flight finder, Restaurant reservations, Booking.com for Travel Agents

### Footer Column 4 — Terms and Settings
- Heading: "Terms and settings" — bold
- Links: Privacy Notice, Terms of Service, Accessibility Statement, Partner dispute, Modern Slavery Statement, Human Rights Statement
- Also: Currency selector button, Language selector button

### Footer Column 5 — Partners
- Heading: "Partners" — bold
- Links: Extranet login, Partner help, List your property, Become an affiliate

### Footer Column 6 — About
- Heading: "About" — bold
- Links: About Booking.com, How We Work, Sustainability, Press center, Careers, Investor relations, Corporate contact, Content guidelines and reporting

### Footer Bottom Bar
- **Text**: "Booking.com is part of Booking Holdings Inc., the world leader in online travel and related services"
- **Copyright**: "Copyright © 1996–2026 Booking.com™. All rights reserved."
- **Partner Logos** (horizontal row): Booking.com, Priceline.com, Kayak, Agoda, OpenTable
- Small, grey logo icons with subtle layout

---

## 7. COMPONENT LIBRARY

### 7.1 Buttons
```
PRIMARY BUTTON
  - Background: #0071C2
  - Text: White, bold, 14-16px
  - Padding: 12px 24px
  - Border-radius: 4px
  - Hover: #005999 (darken)
  - Active: #004080

SECONDARY / OUTLINE BUTTON
  - Background: Transparent
  - Border: 2px solid #0071C2
  - Text: #0071C2, bold
  - Hover: Light blue background #E8F3FF

GHOST / HEADER BUTTON (on dark bg)
  - Background: Transparent
  - Border: 1.5px solid white
  - Text: White, bold
  - Hover: White background + blue text

DESTRUCTIVE / CANCEL
  - Text: #CC0000 (red), no border, no bg
  - Hover: Underline
```

### 7.2 Input Fields
```
SEARCH INPUT
  - Height: 48–56px
  - Background: White
  - Border: 1px solid #E0E0E0
  - Border-radius: 4px
  - Focus border: 2px solid #FEBB02
  - Placeholder color: #6B6B6B
  - Icon: Left-aligned SVG icon inside input
  - Font size: 15px

DATE PICKER
  - Same base as search input
  - Shows calendar dropdown on click
  - Selected date range: highlighted in blue

DROPDOWN / SELECT
  - Same base style
  - Custom dropdown panel (not native select)
  - Options with count control (+/- buttons) for adults, children, rooms
```

### 7.3 Cards

#### Property / Hotel Card (Search Results)
```
Layout: Horizontal card (image left, content right)
Width: Full container width
Image: ~300px wide, full-height card image
Border-radius: 8px
Box-shadow: 0 2px 8px rgba(0,0,0,0.12)
Hover: Slightly elevated shadow; title turns blue

Content Area:
  - Property Name: H3, bold, blue (#0071C2), clickable
  - Stars: Yellow star icons (⭐)
  - Location: Grey small text with map pin icon
  - Tags: Small pill badges (e.g., "Breakfast included", "Free cancellation")
  - Description: 2-line truncated grey body text
  - Sustainability badge (if applicable): Green leaf icon
  - Guest Review Score: Dark blue rounded square badge (e.g., "8.9") + label ("Excellent") + review count
  - Price Section (right-aligned):
    - "X nights, Y adults" — small grey label
    - Old price (strikethrough) + New price
    - "Includes taxes and fees" — grey caption
    - CTA: "See availability" — blue filled button
  - Labels: "Genius" blue badge if discount applies
```

#### Destination / Category Card (Property Type)
```
Layout: Vertical card with image background
Width: ~160–200px (in horizontal scroll row)
Height: ~200–240px
Image: Full bleed background
Bottom gradient overlay: rgba(0,0,0,0.4) to transparent
Title: White text, bold, bottom-aligned over image
Border-radius: 8px
Hover: Scale 1.03x, shadow increase
```

#### Feature Card (Why Booking.com section)
```
Layout: Vertical card, centered or left-aligned
Background: #F2F2F2
Padding: 24px
Border-radius: 8px
No shadow
Icon: Top, 64x64px colorful illustration
Heading: H3, bold, dark
Body: Regular, grey
No CTA
```

#### Offer / Promo Banner Card
```
Layout: Horizontal banner card (text left, image right)
Background: White with subtle border
Border-radius: 8px
Box-shadow: Soft shadow
Left (text) section:
  - Eyebrow label: Small caps, muted color
  - H2 headline: Bold, dark
  - Body text: Regular grey
  - CTA Button: Blue primary
Right (image) section:
  - Full-height destination image
  - Rounded right corners
```

### 7.4 Navigation

#### Main Nav Tabs (Category tabs below header)
```
Items: Stays | Flights | Car rental | Attractions | Airport taxis | More
Style: Horizontal row, equal padding
Active: White outlined pill/capsule border around text + icon
Inactive: White text + icon, no border
Hover: Subtle background lighten or underline
Icon: Left of text, SVG, 18–20px
```

#### Footer Navigation
```
Multi-column grid layout
Section Headings: Bold, 14-15px, dark
Links: 13-14px, regular, dark grey
Hover: Color changes to blue #0071C2, underline appears
```

#### Breadcrumb Navigation
```
Format: Home > Country > City > Property
Separator: " > " or "/" 
Text: Grey, 13px; current page: dark, non-linked
```

### 7.5 Badges & Labels
```
GENIUS BADGE
  - Background: #003580 (dark blue)
  - Text: White, bold, small caps
  - Shape: Pill or square-ish
  - Position: Top-left of card or inline

DISCOUNT BADGE
  - Background: #008009 (green)
  - Text: White, e.g., "-15%"
  - Shape: Pill

FREE CANCELLATION TAG
  - Text: #008009 (green)
  - No background, just colored text
  - Small checkmark icon before text

REVIEW SCORE BADGE
  - Background: #003580
  - Text: White, bold, e.g., "8.9"
  - Shape: Rounded square/rectangle
  - Followed by: "Excellent" label + grey "(1,234 reviews)"

STAR RATING
  - Yellow star icons ⭐ (filled)
  - 1–5 stars, inline with property name
```

### 7.6 Rating Component
```
Score Block:
  - Score (e.g., 8.9): Large bold text in dark blue square badge
  - Category label: "Excellent" / "Very Good" / "Good" etc.
  - Review count: "1,234 reviews" in grey
  
Star Display:
  - 5-star system with filled/half/empty states
  - Star color: #F5A623
  - Size: 14–16px inline
```

### 7.7 Search Filters Panel (Sidebar — Search Results Page)
```
Position: Left sidebar, ~280px wide
Background: White
Border: 1px solid #E0E0E0
Border-radius: 4–8px
Padding: 16–24px

Filter Groups:
  - Filter heading: Bold, 14-16px
  - Divider: 1px light grey between groups
  - Checkboxes with labels (custom styled)
  - Range sliders (price range)
  - Star ratings (clickable stars)
  - Review score (slider or buttons)

Each filter option:
  - Checkbox: Custom blue when checked
  - Label: Regular text
  - Count: Grey "(234)" to the right

"Show more" toggle: Blue text link
Clear filters: Red/blue text link

Filter categories include:
  - Your budget (price per night slider)
  - Popular filters
  - Star rating (1–5 stars)
  - Guest review score
  - Meals (Breakfast included, etc.)
  - Property type
  - Facilities (Pool, Parking, WiFi, etc.)
  - Bed preference
  - Neighborhood
  - Distance from center
```

---

## 8. SEARCH RESULTS PAGE LAYOUT

### Header (same as homepage)
- Same top nav + category nav
- Search bar persistent at top but more compact
- Show current search summary and "Modify search" option

### Sort Bar
```
- Background: White
- Options: "Our top picks" | "Homes & apartments first" | "Price (lowest first)" | "Best reviewed and lowest price" | "Stars"
- Style: Horizontal button tabs or dropdown
- Active: Bold text or underline
```

### Two-Column Layout
```
Left: Filters sidebar (~280px)
Right: Results list (~flexible, fills remaining space)
Map toggle: Floating button "Show on map" top-right of results
```

### Result Count
```
Text: "X properties found in [Destination]"
Subtext: dates + guest count summary
Style: Grey, 14px
```

### Property Listing Card (horizontal)
```
[see Component 7.3 — Hotel Card above]
```

### Map View
- Toggle between list view and map + list split view
- Map pin markers with price bubbles
- Hover on pin highlights corresponding list card
- Map: Full-height right panel with Google Maps or Leaflet style tiles

---

## 9. UX PATTERNS & INTERACTIONS

### 9.1 Search Flow
1. User types destination → **Autocomplete dropdown** appears with suggestions (cities, airports, landmarks, hotels)
2. User selects date range → **Calendar date picker** opens (dual month view)
   - Highlights: start date, end date, and range in between
   - Previous/Next month arrows
   - Today's date: outlined circle
   - Selected range: filled blue background
3. User sets guests/rooms → **Popover dropdown** opens
   - Adults: +/- counter (min 1, max 30)
   - Children: +/- counter (min 0) with age dropdowns if > 0
   - Rooms: +/- counter (min 1)
   - "Done" confirmation button to close
4. User clicks "Search" → navigates to results page with URL params

### 9.2 Property Card Interaction
- **Hover**: Card shadow deepens; property name turns blue + underline
- **Wishlist / Heart icon**: Outline heart → filled red on click (save to list)
- **Image gallery**: Multiple images shown in carousel; next/prev arrows on hover
- **"See availability" CTA**: Primary blue button, full-width on mobile

### 9.3 Filter Interaction
- **Real-time filtering**: Results update without full page reload (AJAX/SPA pattern)
- **Applied filters badge**: Shows count of active filters on mobile collapsed panel
- **Price range slider**: Dual handle range slider with current prices shown above
- **Loading state**: Skeleton loaders for cards while filtering

### 9.4 Date Picker UX
- Inline dual-calendar panel
- Click start date → click end date (no separate confirm needed)
- Minimum stay: highlighted if applicable
- Closed dates: Greyed out, not selectable
- "Flexible dates" option toggles a different view (±1, ±2, ±3 days)

### 9.5 Scrolling Behavior
- Header is **sticky** (stays at top on scroll)
- Back-to-top button appears after scrolling 600px
- Lazy loading for images (intersection observer)
- Infinite scroll or "Load more" pagination on results page

### 9.6 Notifications & Alerts
- **Urgency messaging** (scarcity): "Only 2 rooms left!", "5 people looking at this now"
  - Red or orange text, small icon
- **Flash deals**: Banner or badge with countdown timer
- **Free cancellation confirmation**: Green checkmark inline
- **Error state**: Red border + error message below input
- **Toast notifications**: Bottom-right, brief animated pop-up

---

## 10. RESPONSIVE DESIGN RULES

### Mobile (< 576px)
- Single column layout
- Header: Logo + hamburger menu icon
- Nav categories: Horizontally scrollable pill row
- Search bar: Stacked vertically, each input full-width
- Cards: Full-width, image on top
- Filters: Hidden behind "Filter" button that opens a bottom sheet
- Footer: Single column, accordion-style expandable sections

### Tablet (576–991px)
- 2-column card grids
- Search bar: Semi-compact layout (destination + dates on one row, guests + button on next)
- Filters: May collapse or appear as drawer
- Footer: 2-column grid

### Desktop (992px+)
- Full 4-column layouts as described
- Sticky sidebar filters
- Full horizontal header
- All nav items visible (no hamburger)
- Footer: 5–6 column grid

---

## 11. ICONOGRAPHY

### Icon Style
- Line art / outline style (not filled) for most UI icons
- Filled style for active states and specific icons (heart, star)
- Size: 16px (inline), 20px (nav), 24px (feature), 40–64px (hero features)
- Color: Inherits from context (white on dark bg, grey/blue on light bg)

### Key Icons Used
| Icon | Usage |
|------|-------|
| 🏨 Bed / Hotel | Stays navigation tab |
| ✈️ Plane | Flights tab |
| 🚗 Car | Car rental tab |
| 🎡 Compass/Activities | Attractions tab |
| 🚕 Taxi | Airport taxis |
| 📅 Calendar | Date picker |
| 👤 Person | Guest selector |
| 🔍 Magnifier | Search button |
| ❤️ Heart | Wishlist save |
| ⭐ Star | Rating |
| 📍 Map Pin | Location |
| ✅ Checkmark | Free cancellation, trust badges |
| ℹ️ Info circle | Tooltips |
| ❌ X | Close, cancel |
| ← → | Navigation arrows |
| 🌐 Globe | Language selector |

---

## 12. MICRO-INTERACTIONS & ANIMATIONS

### Transition Timing
- All hover transitions: `150–200ms ease`
- Dropdown/panel open: `200–300ms ease-out` (slide down + fade)
- Modal open: `250ms ease` (scale up + fade in)
- Page transitions: `none` or fade (SPA routing)
- Skeleton loaders: Shimmer animation (~1.5s loop)

### Hover Effects
- Buttons: Background color change + slight shadow
- Links: Underline appears + color change to `#0071C2`
- Cards: `box-shadow` deepens; transform: translateY(-2px) for slight lift
- Images: Subtle zoom (scale 1.05) within overflow:hidden container

### Loading States
- Search button: Spinner icon replaces "Search" text while loading
- Cards: Skeleton screens (grey pulsing placeholder blocks)
- Images: Low-quality placeholder blur → full image on load
- Filter changes: Spinner overlay on results section

---

## 13. ACCESSIBILITY

- All interactive elements must have `:focus` outlines (3px offset blue ring)
- Color contrast: Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- All images must have `alt` text
- Form inputs must have `<label>` elements
- Keyboard navigation: full support (tab order, enter to submit, esc to close)
- ARIA roles: `role="navigation"`, `role="main"`, `role="banner"`, `aria-label` attributes on all regions
- Skip to main content: Hidden link as first element in DOM
- Modals: Focus trap when open; return focus on close

---

## 14. PAGE TYPES REFERENCE

| Page | Description |
|------|-------------|
| **Homepage** | Hero search + feature highlights + category browsing + deals |
| **Search Results** | Filterable hotel listing grid with map toggle |
| **Property Detail** | Full hotel page: gallery, description, amenities, room selection, reviews, map |
| **Checkout** | Booking form: guest details, payment, booking summary |
| **Confirmation** | Booking confirmed: summary card + CTA actions |
| **Account / Sign In** | Auth pages: email/password, OAuth, registration |
| **My Trips** | User dashboard: upcoming/past trips |
| **Flights Page** | Kayak-integrated flight search |
| **Car Rental** | Car search + listing |
| **Attractions** | Activities + experiences listing |
| **Airport Taxis** | Transfer booking |

---

## 15. SUMMARY: CORE DESIGN PRINCIPLES

1. **Clarity first**: Every element has clear purpose and hierarchy. Use whitespace generously.
2. **Trust signals everywhere**: Reviews, ratings, cancellation policies, and security badges are prominently displayed.
3. **Search is central**: The search bar is the most prominent UI element — hero-level placement, persistent on scroll.
4. **Progressive disclosure**: Show the most important info first (price, rating, location); expand on demand.
5. **Conversion-focused**: CTAs are always visible, prominent, and blue. Urgency messaging (scarcity, deals) drives action.
6. **Mobile-first responsive**: All layouts degrade gracefully to single-column on mobile.
7. **Consistent component system**: Buttons, cards, inputs, and badges follow strict style patterns throughout.
8. **Performance UX**: Skeleton loaders, lazy images, and optimistic UI prevent perceived lag.
9. **Accessibility built-in**: Color contrast, keyboard navigation, ARIA labels, and semantic HTML are non-negotiable.
10. **Localization-ready**: Currency, language, and date formats are user-specific and configurable from the header.
