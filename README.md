# ServeHub - Service Marketplace

A modern service marketplace platform connecting users with local service providers. Browse categories, book appointments, manage services, and grow your business — all in one place.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **.NET SDK 10** (for backend)
- **Docker** (optional, for PostgreSQL)

### Start the Application

```bash
# Install dependencies
npm install

# Start frontend (http://localhost:8080)
npm run dev

# Start backend (in another terminal, http://localhost:5000)
cd TWeb.API && dotnet run
```

## 📋 Tech Stack

### Frontend
| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (49 components) |
| State Management | React Context + useReducer + TanStack React Query |
| Routing | React Router DOM 6 (lazy-loaded routes) |
| Forms | React Hook Form + Zod validation |
| HTTP Client | Axios with auth interceptor |
| Calendar | FullCalendar 6 (drag-and-drop scheduling) |
| Charts | Recharts 2 |
| Icons | Lucide React |
| i18n | Custom i18n context (EN, RO, RU) |
| Theme | next-themes (Dark/Light) |

### Backend
| Category | Technology |
|----------|-----------|
| Framework | ASP.NET Core 10 |
| ORM | Entity Framework Core |
| Database | SQLite (dev) / PostgreSQL (prod) |
| API Docs | Swagger/OpenAPI |

### Dev Tooling
- **Testing:** Vitest + Testing Library + jsdom
- **Linting:** ESLint 9 (TypeScript, React, a11y)
- **Formatting:** Prettier (120 char width)
- **Git Hooks:** Husky 9 + lint-staged
- **Containers:** Docker Compose (PostgreSQL + pgAdmin)

## ✨ Features

### For Users
- 🔐 **Authentication** — Email/password, Google login, demo accounts
- 📅 **Book Services** — Calendar-based booking with time slot selection
- 👤 **Guest Booking** — Book without an account (name, email, phone)
- 📊 **Booking Dashboard** — Analytics, upcoming/past bookings, cancel bookings
- ⭐ **Reviews** — Leave 1-5 star ratings + comments after completed bookings
- 🔔 **Notifications** — Real-time notification center with unread count
- ⚙️ **Settings** — Profile editing, language switcher, currency selector
- 🤝 **Become a Provider** — Apply to offer services on the platform

### For Providers
- 📈 **Business Analytics** — Clients, bookings, profits, reviews, trend charts
- 🗓️ **Schedule Management** — FullCalendar-based drag-and-drop calendar
- 🛠️ **Services CRUD** — Create/edit/delete services with pricing, duration, buffers
- 📋 **Bookings Management** — View, filter, confirm, or reject bookings
- 👤 **Profile Settings** — Edit name, description, photos, location, auto-confirm
- 🚫 **Blocked Protection** — Blocked providers cannot receive bookings

### For Admins
- 📊 **Platform Overview** — Analytics dashboard with platform metrics
- 📝 **Applications** — Review, approve, or reject provider applications
- 🏢 **Provider Management** — Toggle featured, sponsored, or blocked status
- 📁 **Category Management** — Create/edit service categories
- 👥 **User Management** — View and manage all users

### Platform Features
- 🌍 **Multi-language** — English, Romanian, Russian (localStorage persisted)
- 💱 **Multi-currency** — MDL (base), USD, EUR with live conversion
- 🌓 **Dark/Light Theme** — User-selectable, persisted in localStorage
- 🔍 **Search** — Global search bar for providers and services
- 🏆 **Sponsored/Featured** — Highlighted providers on homepage
- 🛡️ **Role-based Access** — GUEST, USER, PROVIDER, ADMIN with route guards
- 📱 **Responsive Design** — Mobile-first with shadcn/ui components
- 💾 **State Persistence** — localStorage with automatic sync
- 🔒 **XSS Protection** — Input sanitization utilities
- ⏰ **Booking Rules** — 14-day advance booking window, 30-min minimum lead time
- 🔄 **Buffer Times** — Service-level and provider-level buffers between appointments

## 📁 Project Structure

```
TWeb/
├── TWeb.API/                   # .NET Backend (API layer)
├── TWeb.BusinessLayer/         # Business logic
├── TWeb.Domain/                # Domain entities
├── TWeb.DataAccessLayer/       # Data access
├── src/                        # React Frontend
│   ├── api/                    # API integration layer
│   │   ├── index.ts            # API client methods
│   │   ├── hooks.ts            # React Query hooks
│   │   └── types.ts            # DTOs matching backend shapes
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # 49 shadcn/ui components
│   │   ├── schedule/           # Scheduling components
│   │   ├── Layout.tsx          # Main layout (Navbar + main + Footer)
│   │   ├── Navbar.tsx          # Top navigation with search, theme/lang/currency
│   │   ├── RouteGuard.tsx      # Role-based route protection
│   │   ├── ErrorBoundary.tsx   # React error boundary
│   │   └── PanelLayout.tsx     # Shared sidebar layout for Admin/Provider panels
│   ├── pages/                  # Route-level page components
│   │   ├── Index.tsx           # Homepage (hero, stats, sponsored/featured)
│   │   ├── Login.tsx           # Authentication
│   │   ├── SignUp.tsx          # Registration
│   │   ├── Dashboard.tsx       # User booking dashboard
│   │   ├── BookService.tsx     # Booking flow
│   │   ├── provider/           # Provider panel pages
│   │   └── admin/              # Admin panel pages
│   ├── store/                  # State management
│   │   ├── AppProvider.tsx     # Main context provider with localStorage
│   │   ├── appReducer.ts       # Reducer handling all state actions
│   │   ├── appContextTypes.ts  # Context type definitions
│   │   ├── useAppStore.ts      # Custom hooks
│   │   ├── AxiosContext.tsx    # Axios instance provider
│   │   └── I18nContext.tsx     # Internationalization context
│   ├── lib/                    # Utility modules
│   │   ├── apiClient.ts        # Axios instance with auth interceptor
│   │   ├── apiSync.ts          # Sync helper for backend API
│   │   ├── auth.ts             # Session management
│   │   ├── booking.ts          # Slot generation, availability checking
│   │   ├── currency.ts         # Multi-currency support
│   │   ├── sanitize.ts         # XSS prevention
│   │   └── storage.ts          # localStorage persistence
│   ├── data/
│   │   └── seed.ts             # Demo seed data
│   ├── hooks/                  # Custom React hooks
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces
│   └── test/                   # Vitest test suites
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind theme + custom animations
├── eslint.config.js            # ESLint flat config
└── vitest.config.ts            # Vitest configuration
```

## 🗄️ Database

### Development (SQLite)
The backend uses SQLite by default (`TWeb.API/tweb.db`).

### Production (PostgreSQL)
```bash
# Start PostgreSQL + pgAdmin
npm run db:up

# Stop containers
npm run db:down

# Remove volumes
npm run db:reset

# View logs
npm run db:logs

# Open psql shell
npm run db:shell
```

pgAdmin available at: `http://localhost:5050` (under `tools` profile)

## 📡 API Integration

The frontend is configured for `http://localhost:5000/api` by default. Override with:

```bash
# Set environment variable
VITE_API_BASE_URL=http://your-api-url
```

### API Features
- **Auth Interceptor** — Adds Bearer token from localStorage to all requests
- **Error Handling** — Auto-redirects to 401/403/500 error pages
- **React Query** — Automatic cache invalidation, optimistic updates
- **API Sync** — `fetchAppStateFromAPI()` for transitioning from localStorage to API

## 🌐 Internationalization

Supported languages with localStorage persistence:
- **English (en)** — Default
- **Romanian (ro)**
- **Russian (ru)**

120+ translation keys covering all UI strings. Switch via the language selector in the navbar.

## 💱 Multi-Currency

Supported currencies with conversion rates:
- **MDL** (Moldovan Leu) — Base currency
- **USD** (US Dollar)
- **EUR** (Euro)

Currency preference is stored in-memory and resets on page refresh.

## 🎨 Styling

- **Tailwind CSS** with CSS custom properties for theming
- **shadcn/ui** components built on Radix UI primitives
- **Custom design tokens** — Dark/light themes as HSL CSS variables
- **Custom fonts** — Inter (sans-serif) + Space Grotesk (display)
- **Custom animations** — fade-in, slide-in, scale-in, glow-pulse, shimmer, accordion
- **Dark mode** is the default (`class` strategy)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

Test coverage includes:
- State reducer (user, category, service, booking, notification actions)
- Booking utilities (slot generation, availability checking)
- Component rendering with Testing Library

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests with Vitest |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:up` | Start Docker containers |
| `npm run db:down` | Stop Docker containers |
| `npm run db:reset` | Remove Docker volumes |
| `npm run db:logs` | View PostgreSQL logs |
| `npm run db:shell` | Open psql shell |

## 🔒 Security

- **Password Storage** — Passwords are NOT stored in localStorage (security best practice)
- **XSS Prevention** — Input sanitization utilities in `lib/sanitize.ts`
- **Auth Tokens** — Bearer tokens stored in localStorage with HTTP-only cookie option available
- **Role Validation** — Server-side and client-side role checks on protected routes
- **CSRF Protection** — Configurable in backend

## 🚧 Demo Mode

The app ships with demo data and pre-configured accounts. Use the **"Reset Demo"** button to restore seed data at any time.

### Demo Accounts
- **Users** with different roles (USER, PROVIDER, ADMIN) for testing
- **Pre-populated** categories, services, bookings, and reviews
- **Click-to-fill** demo account buttons on the login page

## 📝 Code Quality

- **ESLint** with TypeScript strict rules, React hooks, and accessibility plugins
- **Prettier** for consistent formatting (120 char width, trailing commas)
- **Husky** pre-commit hook runs lint-staged on staged files
- **TypeScript** strict mode enabled

## 🔗 API Documentation

Once the backend is running, access Swagger UI at: `http://localhost:5000/swagger`
