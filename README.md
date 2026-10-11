# Avenzaq

A full-stack, multi-vendor e-commerce marketplace. Sellers open their own shops and manage products with variants, customers browse and buy across shops, and admins moderate the whole platform. Notifications arrive in real time.

Built with **ASP.NET Core 10**, **PostgreSQL**, **React 19**, and **SignalR**.

---

## Features

**Customers**
- Register and log in with JWT authentication
- Browse products, categories, and individual seller shops
- Product variants (size, color, etc.) with per-variant images and SKUs
- Cart, checkout, and order history
- Product reviews and ratings
- Real-time notifications

**Sellers**
- Apply to become a seller (admin approval required)
- Dashboard showing analytics, earnings, and reviews
- Product and variant management, including bulk image upload
- Order fulfilment with status updates (Pending → Confirmed → Processing → Shipped → Delivered)
- Shop profile and settings

**Admins**
- Platform dashboard and reports
- Approve, reject, or suspend sellers
- Block and unblock users
- Manage categories, products, and orders
- Featured promotions

---

## Tech Stack

| Layer      | Technology                                                       |
|------------|------------------------------------------------------------------|
| Backend    | ASP.NET Core 10 Web API, Entity Framework Core 10, SignalR       |
| Database   | PostgreSQL (via Npgsql)                                          |
| Auth       | JWT Bearer tokens, role-based (Customer / Seller / Admin)        |
| Frontend   | React 19, React Router 7, Axios, Context API                     |
| API Docs   | Swagger / OpenAPI                                                |
| Config     | `.env` via DotNetEnv                                             |

---

## Project Structure

```
Avenzaq/
├── Backend/                 # ASP.NET Core Web API
│   ├── Controllers/         # REST endpoints
│   ├── Data/                # EF Core DbContext
│   ├── DTOs/                # Request/response models
│   ├── Hubs/                # SignalR notification hub
│   ├── Interfaces/          # Repository & service contracts
│   ├── Migrations/          # EF Core migrations
│   ├── Models/              # Entities and enums
│   ├── Repositories/        # Data access layer
│   ├── Security/            # JWT token generation
│   ├── Services/            # Business logic
│   ├── wwwroot/             # Static files and uploaded images
│   ├── .env.example         # Environment variable template
│   └── Program.cs
├── frontend/                # React SPA
│   └── src/
│       ├── app/             # Router and route guards
│       ├── components/      # Reusable UI components
│       ├── context/         # Auth, Cart, Category contexts
│       ├── hooks/           # Custom hooks (auth, cart, SignalR, ...)
│       ├── pages/           # Admin, Seller, Shop, Cart, Checkout, ...
│       └── services/        # API client
└── Startup.sln
```

---

## Getting Started

### Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 18+ and npm
- [PostgreSQL](https://www.postgresql.org/) 14+

### 1. Clone the repository

```bash
git clone <repository-url>
cd Avenzaq
```

### 2. Configure the backend

Create a `.env` file from the template:

```bash
cd Backend
cp .env.example .env
```

Then edit `Backend/.env` with your own values:

```env
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=marketplace_dev;Username=postgres;Password=your-password
Jwt__Key=replace-with-a-long-secure-key-at-least-32-characters
```

> `.env` is git-ignored, so never commit real credentials. Non-secret settings such as JWT issuer, audience, expiry, and CORS origins live in `appsettings.json`.

### 3. Run the backend

```bash
cd Backend
dotnet restore
dotnet run
```

Database migrations are applied automatically on startup.

- API: `http://localhost:5199`
- Swagger UI: `http://localhost:5199/swagger`

### 4. Run the frontend

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:3000` and talks to the API through `REACT_APP_API_URL`, which is set in `frontend/.env.development`.

---

## API Overview

All endpoints are prefixed with `/api`.

| Resource          | Base Route                | Highlights                                           |
|-------------------|---------------------------|------------------------------------------------------|
| Auth              | `/api/auth`               | `register`, `login`, `me`                            |
| Users             | `/api/users`              | Get / update current user                            |
| Products          | `/api/products`           | CRUD, image upload (single & batch)                  |
| Product Variants  | `/api/productvariants`    | Variant CRUD, lookup by SKU, variant images          |
| Categories        | `/api/categories`         | CRUD                                                 |
| Cart              | `/api/cart`               | Get cart, add / update / remove items                |
| Orders            | `/api/orders`             | `checkout`, `my` orders                              |
| Reviews           | `/api/reviews`            | Product reviews                                      |
| Sellers           | `/api/sellers`            | Register, dashboard, profile, orders, earnings       |
| Shops             | `/api/shops`              | Shop listing, by id / slug, shop products & reviews  |
| Notifications     | `/api/notifications`      | List, unread count, mark read, clear                 |
| Admin             | `/api/admin`              | Dashboard, seller moderation, users, promotions      |

**Real-time hub:** `/hubs/notifications` (SignalR)

The full interactive reference is available in Swagger while the backend runs in Development mode.

---

## Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

The backend serves static files from `wwwroot` and falls back to `index.html` for unmatched routes, so the React build can be deployed together with the API. In production, set `ConnectionStrings__DefaultConnection` and `Jwt__Key` as environment variables on the host.

---

## License

This project is licensed under the [MIT License](LICENSE).
