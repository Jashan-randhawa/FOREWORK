# 📱 Mobile-First Architecture & PWA Guide

ForeWork v2.0+ introduces a comprehensive mobile-first design pass and Progressive Web App implementation, with extended session support in v2.1.

---

## 📲 Core Mobile Features

### 1. Role-Aware Bottom Tab Bar (`BottomTabBar.jsx`)
- Anchored at the bottom of the screen on devices `< 768px` (`block md:hidden`).
- Automatically renders appropriate navigation links based on user role:
  - **Candidates**: Home, Jobs, Saved Jobs, Applied Jobs, Profile.
  - **Recruiters**: Dashboard, Jobs, Companies, Alerts, Profile.
- Respects iOS Dynamic Island and home bar safe-area insets using `pb-[env(safe-area-inset-bottom)]`.

### 2. Modern App Navigation Drawer (`MobileNavSheet.jsx`)
- Slide-over sheet from the right with glassmorphic backdrop.
- **Single tactile close button** (double close button bug resolved).
- **User Profile Card**:
  - Avatar with online status ring (supports auto-generated avatars for users without photos).
  - Verified account checkmark.
  - Distinct role badge (`Candidate`, `Recruiter`, `Admin`).
  - Quick profile management link.
- **Categorized Sections**: Links organized under `Explore`, `Career Hub`, and `Account`.
- **Integrated Appearance Card**: Quick switch between Light and Dark themes.
- **Operational Status Dock**: Pulsing green telemetry heartbeat indicator.

### 3. Horizontal Scroll-Snap Carousels
- Replaced cumbersome vertical mobile stacks with high-performance horizontal swipe rows:
  - **Hero Trending Chips**: `no-scrollbar snap-x snap-mandatory`.
  - **Platform Advantages**: Swipeable cards with synchronized dot indicators (`activePillar` state).
  - **Job Categories**: Horizontal swipe row with `snap-start`.
  - **Latest Jobs Carousel**: Partial card peek (`min-w-[85%]`) with dedicated "Explore All" card.

### 4. Data Tables to Mobile Cards (`DataTable.jsx`)
- Data tables automatically morph into stacked mobile cards on narrow viewports via the `mobileCard` render prop.
- Column priorities:
  - `priority: "primary"`: Always rendered prominently.
  - `priority: "secondary"`: Rendered with muted typography.
  - `priority: "hidden-mobile"`: Suppressed on small screens.

---

## 📲 Mobile Authentication (v2.1)

### Extended Sessions
Mobile clients sending `X-Client: mobile` header during login receive:
- **30-day JWT expiry** (vs 1-day for web browsers)
- **30-day cookie `maxAge`** for seamless session persistence
- **Token in response body** for clients that store tokens in secure local storage (e.g., React Native SecureStore)

### Bearer Token Authentication
The `isAuthenticated` middleware supports dual token sources:
1. **Primary**: `req.cookies.token` (HttpOnly cookie)
2. **Fallback**: `Authorization: Bearer <token>` header

This enables authentication across web browsers, PWA shells, WebView containers, and mobile native apps without cookie jar support.

---

## ⚡ Progressive Web App (PWA) Setup

### Web App Manifest (`Frontend/public/manifest.json`)
```json
{
  "short_name": "ForeWork",
  "name": "ForeWork - Verified Careers",
  "icons": [
    {
      "src": "icon-192.svg",
      "type": "image/svg+xml",
      "sizes": "192x192"
    },
    {
      "src": "icon-512.svg",
      "type": "image/svg+xml",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#0E0C13",
  "theme_color": "#6B3AC2",
  "display": "standalone"
}
```

### Service Worker (`Frontend/public/sw.js`)
- **Cache-First Strategy**: Core static assets (`index.html`, CSS, icons) are pre-cached on install.
- **Navigation Fallback**: If the network is unavailable, requests fall back to the cached application shell.
- **API Request Bypass**: ATS analysis and other API calls bypass the service worker cache to prevent browser tracking prevention from blocking functional requests.
- **Offline Banner**: `OfflineBanner.jsx` notifies users immediately when device connectivity is lost.

### Vercel Speed Insights
Production deployments include [Vercel Speed Insights](https://vercel.com/docs/speed-insights) for real-user performance monitoring.