# ServeHub - Service Marketplace

A modern service marketplace platform connecting users with service providers. Built with React + TypeScript frontend and ASP.NET Core backend.

## Quick Links

- 🚀 **Getting Started**: See [QUICKSTART.md](QUICKSTART.md)
- 📖 **Backend Integration**: See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
- 📊 **Integration Summary**: See [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- TailwindCSS + shadcn/ui
- React Query (TanStack Query)
- Axios
- React Router

### Backend
- ASP.NET Core 10
- Entity Framework Core
- SQLite
- Swagger/OpenAPI

## Development

### Start Backend
```bash
cd backend/TWeb.API
dotnet run
```

### Start Frontend
```bash
npm run dev
```

## API Documentation

Once the backend is running, access Swagger UI at: http://localhost:5000/swagger

## Project Structure

```
TWeb/
├── backend/                 # .NET Backend (3-tier architecture)
│   ├── TWeb.API/           #   API layer
│   ├── TWeb.BusinessLayer/ #   Business logic
│   ├── TWeb.Domain/        #   Entities
│   └── TWeb.DataAccessLayer/ # Data access
├── src/                     # React Frontend
│   ├── api/                #   API integration layer
│   ├── lib/                #   Utilities
│   ├── pages/              #   Pages
│   ├── components/         #   UI components
│   └── store/              #   State management
└── ...
```

## Features

- 🔐 User authentication (login/signup)
- 👥 Role-based access (User, Provider, Admin)
- 📅 Service booking system
- ⭐ Reviews and ratings
- 📊 Admin dashboard
- 🏢 Provider management
- 🔔 Notification system
- 🌍 Multi-language support (EN, RO, RU)
- 💱 Multi-currency support (MDL, USD, EUR)
- 🌓 Dark/Light theme