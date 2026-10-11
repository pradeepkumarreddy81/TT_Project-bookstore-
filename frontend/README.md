# The Bookstore Atelier — Frontend Web Application

An editorial, bookish online bookstore built with **React 18**, **Vite**, **Tailwind CSS**, and **React Router v6**. Designed with deliberate craft: warm paper backgrounds, deep ink typography, terracotta accents, and fine typesetting.

---

## 📖 Key Features & Architecture

- **Editorial Design System**:
  - **Warm Paper** (`#FAF6EF`) and **Paper Light** (`#FFFFFF`) card surfaces.
  - **Deep Ink** (`#1B1A17`) headings and text, **Ink Muted** (`#666358`) body copy.
  - **Terracotta** (`#B5472B`) primary action accents and alerts.
  - **Forest Green** (`#24443A`) secondary and verified markers.
  - **Typography**: [Fraunces](https://fonts.google.com/specimen/Fraunces) serif display headings and [Inter](https://fonts.google.com/specimen/Inter) body.
  - Asymmetric layouts, 1px paper borders (`#E8DFC8`), small-caps tracking, and drop shadows.

- **Storefront**:
  - **Home (`/`)**: Editorial hero with an overlapping featured book cover, New Arrivals row, typographic category index (no icon cards), and Staff Picks strip.
  - **Catalogue (`/books`)**: Sticky filter sidebar, debounced live search, sorting, responsive grid, skeleton loaders, and full synchronization with URL search params (`useSearchParams`).
  - **Book Details (`/books/:id`)**: Archival cover artwork, specifications sheet, real-time stock alert tags, quantity steppers, add to reading bag, related editions, and a mobile sticky add-to-cart bar.
  - **Reading Bag (`/cart`)**: Line items, quantity adjustments, item removal, and a sticky order summary card.
  - **Checkout (`/checkout`)**: Structured delivery destination form with inline validation, order manifest, and transactional placement (`POST /api/orders`).
  - **Order Confirmation (`/orders/confirmed/:id`)**: Archival dispatch receipt, milestone timeline, and itemized ledger.
  - **Orders History (`/orders`)**: Customer order ledger with status badges, expandable item details, and an archival 4-stage milestone timeline (`OrderTimeline`).
  - **Authentication (`/login` & `/register`)**: Split layout with literary quote panels (Jorge Luis Borges, Walter Benjamin), inline validation, real backend error feedback, and a one-click curator demo autofill (`admin@bookstore.com` / `Admin@123`).
  - **Styleguide (`/styleguide`)**: Design token showroom displaying all palette swatches, typography hierarchy, buttons, inputs, modal, toasts, empty states, and pagination.

- **Curator Studio (`/admin`)**:
  - Guarded by `AdminRoute` (accessible to users with role `ADMIN` only).
  - **Dashboard Overview (`/admin`)**: KPI metric cards (volumes, readers, dispatches, gross revenue), low-stock alert watchlist with quick inventory adjustments, recent orders table, and an interactive **Recharts** revenue area graph.
  - **Books Catalogue (`/admin/books`)**: Searchable, paginated table with slide-over drawer for add/edit (including live cover image URL preview), inline inventory stock editing, and delete confirmation dialog.
  - **Departments Taxonomy (`/admin/categories`)**: Full CRUD management of bookstore departments.
  - **Dispatches & Orders (`/admin/orders`)**: Status filter dropdown, optimistic UI status updating (`PATCH /api/admin/orders/:id/status`), and comprehensive manifest modal.
  - **Readers Registry (`/admin/customers`)**: Read-only searchable directory of registered customers with order counts and registration dates.

- **Cold-Start Resilience & Performance**:
  - Shared Axios instance (`src/api/client.js`) with relative baseURL `/api`.
  - 60-second request timeout for Render free-tier cold-start resilience.
  - Automatically retries idempotent `GET` requests up to 3 times with a 5-second delay on `502`, `503`, `504` status codes or connection aborts.
  - Code-splitting with `React.lazy()` and `<Suspense>` for fast initial page load.
  - Global `<ErrorBoundary>` to catch and display graceful UI interruptions.
  - Dynamic page titles managed via `useDocumentTitle`.

---

## ⚙️ Environment Variables Note

> [!IMPORTANT]
> **The frontend requires no `.env` files.**
> - **In Local Development**: The Vite dev server proxies all `/api` requests to `http://localhost:8080` (configured in `vite.config.js`).
> - **In Production (Render)**: The Render Static Site rewrite rule routes `/api/*` directly to the Spring Boot web service.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **npm**: v9+

### 2. Installation
From the monorepo root or the `frontend/` directory:

```bash
cd bookstore/frontend
npm install
```

### 3. Start Development Server
Ensure the backend API is running on `http://localhost:8080`, then start the Vite dev server:

```bash
npm run dev
```

The app will be available at:
`http://localhost:5173`

### 4. Build for Production
To create an optimized production build:

```bash
npm run build
```

The output artifacts will be placed in the `dist/` folder:
- Zero build warnings or errors.
- Automatic route code-splitting into lightweight chunk bundles.

To preview the production build locally:

```bash
npm run preview
```

---

## 📂 Project Directory Structure

```
frontend/
├── index.html                   # HTML entry with Fraunces & Inter fonts
├── package.json                 # Dependencies & build scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Palette tokens, typography, and shadows
├── vite.config.js               # Vite configuration with @ path alias & dev proxy
├── src/
│   ├── api/
│   │   └── client.js            # Axios client with cold-start retry & auth interceptor
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminSidebar.jsx # Dense, calm curator navigation
│   │   ├── common/
│   │   │   └── ErrorBoundary.jsx# React error boundary
│   │   ├── shared/
│   │   │   ├── AdminRoute.jsx   # Role-based route guard (ADMIN)
│   │   │   ├── BookCard.jsx     # Card with cover zoom, badges & Add to Bag
│   │   │   ├── Footer.jsx       # Colophon, departments & newsletter
│   │   │   ├── Navbar.jsx       # Header with cart badge & mobile menu
│   │   │   ├── OrderTimeline.jsx# 4-stage milestone stepper
│   │   │   └── ProtectedRoute.jsx# Auth route guard (CUSTOMER)
│   │   └── ui/
│   │       ├── Button.jsx       # Primary, secondary, outline, paper, ghost variants
│   │       ├── ConfirmationDialog.jsx # Accessible delete confirmation modal
│   │       ├── EmptyState.jsx   # Editorial empty views
│   │       ├── Input.jsx        # 1px border form inputs with error helpers
│   │       ├── Modal.jsx        # Accessible dialog with escape/backdrop handling
│   │       ├── Pagination.jsx   # Numbered stepper
│   │       ├── Select.jsx       # Custom styled select
│   │       ├── Skeleton.jsx     # Paper placeholder loaders
│   │       └── SlideOver.jsx    # Right-side drawer for add/edit operations
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication & session token management
│   │   ├── CartContext.jsx      # Reading bag state & API synchronization
│   │   └── ToastContext.jsx     # System notification alerts
│   ├── hooks/
│   │   ├── useDebounce.js       # Search debounce hook
│   │   └── useDocumentTitle.js  # Dynamic browser document titles
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminBooks.jsx   # Books catalog & slide-over drawer
│   │   │   ├── AdminCategories.jsx # Department taxonomy CRUD
│   │   │   ├── AdminCustomers.jsx  # Registered readers directory
│   │   │   ├── AdminDashboard.jsx  # KPI tiles, Recharts revenue graph & alerts
│   │   │   ├── AdminLayout.jsx  # Admin layout shell
│   │   │   └── AdminOrders.jsx  # Orders management with optimistic UI
│   │   ├── BookDetailPage.jsx   # Book folio view & mobile sticky bar
│   │   ├── CartPage.jsx         # Reading bag review & steppers
│   │   ├── CataloguePage.jsx    # Complete catalog with sticky sidebar filters
│   │   ├── CheckoutPage.jsx     # Shipping address & manifest
│   │   ├── HomePage.jsx         # Hero, arrivals, categories & staff picks
│   │   ├── LoginPage.jsx        # Split-screen reader sign-in
│   │   ├── NotFoundPage.jsx     # Standalone 404 folio view
│   │   ├── OrderConfirmationPage.jsx # Printable receipt & dispatch timeline
│   │   ├── OrdersPage.jsx       # Customer order ledger & timeline
│   │   ├── RegisterPage.jsx     # Split-screen reader registration
│   │   └── StyleguidePage.jsx   # Design token showroom
│   ├── App.jsx                  # Lazy-loaded routes & providers
│   ├── index.css                # Tailwind directives & CSS custom properties
│   └── main.jsx                 # Application entry point
```
