# Changelog

All notable changes to the ForeWork platform are documented in this file.

## [v2.0.0] - 2026-09-17

### 🚀 Major Release: ForeWork 2.0 — Mobile-First Architecture & Experience

This milestone transforms ForeWork into a first-class, installable Progressive Web Application (PWA) with native mobile ergonomics, fluid touch interactions, responsive data surfaces, and high-performance network payloads.

---

### ✨ Highlights

- **Mobile App Shell & Navigation**:
  - Role-aware bottom tab bar (BottomTabBar.jsx) for Candidates and Recruiters with safe-area insets and active indicator pills.
  - Redesigned slide-over mobile drawer (MobileNavSheet.jsx) with single tactile close button, gradient branding, rich user profile card, categorized navigation sections, appearance toggle, and live telemetry status dock.
  - Floating toast positioning adapted for bottom bar clearance.

- **Mobile Home Page Redesign**:
  - Horizontal swipeable scroll-snap carousels with cross-browser .no-scrollbar utility.
  - Dynamic scroll dot indicators on Platform Advantages.
  - Horizontal swipe chip rows for trending search tags and platform feature highlights.
  - Horizontal scroll-snap category cards and latest jobs carousel with peek ratio and dedicated "Explore All Positions" card.

- **Data Surfaces & Tables to Cards**:
  - Flexible DataTable.jsx supporting priority columns (primary, secondary, hidden-mobile) and mobileCard render prop.
  - Custom mobile card layouts across recruiter and admin tables (ApplicantsTable, AdminJobsTable, CompaniesTable, AdminUsers, AdminJobs, AdminCompanies).
  - Mobile event timeline with expandable metadata cards in AdminAuditLogs.
  - Touch-friendly application cards in candidate AppliedJob.

- **Touch & Form Polish**:
  - Responsive dialogs (w-[calc(100vw-2rem)], max-h-[90vh]) with hideClose support.
  - Bottom sheet filter drawer on Jobs page with category chips and sticky actions.
  - Mobile-first form layout across PostJob, CompanySetup, CompanyCreate, and EditProfileModal.
  - Touch optimization: -webkit-tap-highlight-color: transparent and size: "touch" (min 44x44px target).

- **Performance & Network Optimization**:
  - Bundle splitting: isolated heavy Recharts library into dedicated endor-charts lazy chunk (reducing AdminDashboard chunk size by >50%).
  - Image optimization: lazy loading and asynchronous decoding on avatars and company logos.
  - Backend field projection: added ?fields= projection query parameter in job.controller.js (getAllJobs, getAdminJobs) to lighten mobile payloads.

- **Progressive Web App (PWA) & Offline**:
  - Web App Manifest (manifest.json) configured with standalone display, branding colors, and responsive vector icons (192px and 512px).
  - Service Worker (sw.js) with cache-first strategy for static assets and offline navigation fallback.
  - Reactive offline indicator banner (OfflineBanner.jsx).
  - Native installation prompt hook (useInstallPrompt.js).

---

### 🧪 Test & Validation
- **Frontend Test Suite**: 20/20 test suites passing, 133/133 tests passing (100%).
- **Backend Test Suite**: 10/10 test suites passing, 133/133 tests passing (100%).
- **Linter**: 0 errors across entire frontend codebase.
- **Production Build**: Clean Vite build in ~8.8s.
