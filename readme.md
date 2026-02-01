# Project Architecture & Folder Structure

This document provides a formal overview of the project structure for the Medusa-based application. The project is organized into two main distinct directories served from a single root, separating the backend logic from the frontend presentation layer.

## Root Directory Structure

The project root (`/`) contains the following distinct applications:

- **`edailo`**: The Medusa Backend application (Node.js). Handles the database, business logic, API, and admin functionalities.
- **`edailo-storefront`**: The Next.js Storefront application. Handles the customer-facing e-commerce interface.

---

## 1. Storefront Application (`edailo-storefront`)

The storefront is built with **Next.js 14+** (App Router) and **Tailwind CSS**. It interacts with the backend via the Medusa API.

### Key Directories in `src/`

The source code is organized within the `src` directory, following a feature-based module architecture.

#### `src/app`
Contains the Next.js App Router file-system based routing.
- **`[countryCode]/`**: Dynamic route wrapper to handle region-based content and localization. All main pages (products, collections, checkout) reside within this dynamic segment.
- **`auth/`**: Authentication related routes.
- **`api/`**: Next.js API routes (if any specific backend-for-frontend logic exists).
- **`layout.tsx`**: The main root layout definition.

#### `src/modules`
This is the core of the application structure. Components are grouped by **domain/feature** rather than by technical type (e.g., "components", "hooks").
- **`account/`**: User profile, order history, and login forms.
- **`cart/`**: Shopping cart visualization and logic.
- **`checkout/`**: Checkout flow components (address, shipping, payment).
- **`products/`**: Product details, galleries, and option selectors.
- **`common/`**: Reusable UI components (buttons, inputs, modals) shared across modules.
- **`layout/`**: Global layout components like Header, Footer, and Navigation.
- **`store/`**: Store-wide logic.

#### `src/lib`
Contains utility functions, configurations, and helper logic.
- **`data/`**: Functions to fetch data from the Medusa Backend.
- **`util/`**: General helper functions.
- **`context/`**: React Context definitions.

### Important Configuration Files
- **`next.config.js`**: Next.js configuration settings.
- **`tailwind.config.js`**: Tailwind CSS theme configuration (colors, fonts, breakpoints).
- **`middleware.ts`**: Middleware for request processing (often used for region detection).

---

## 2. Backend Application (`edailo`)

The backend is a **Medusa v2** server. It manages the commerce database, admin API, and store API.

### Key Directories in `src/`

#### `src/api`
Custom API Routes that extend the core Medusa API.
- **`store/`**: Custom endpoints accessible by the storefront.
- **`admin/`**: Custom endpoints accessible by the admin dashboard.

#### `src/modules`
Custom Medusa Modules. In Medusa v2, architectural domains can be isolated into modules.

#### `src/workflows`
Definitions for Medusa Workflows (part of the Medusa v2 orchestration engine) to handle complex, multi-step business logic.

#### `src/subscribers`
Event listeners that react to system events (e.g., sending an email when an `order.placed` event occurs).

#### `src/jobs`
Cron jobs or scheduled tasks.

#### `src/admin`
Customizations for the Medusa Admin dashboard (Widgets, UI extensions).

### Important Configuration Files
- **`medusa-config.ts`**: The main configuration file for the Medusa server (database connection, plugins, modules, redis, etc.).

---

## Architecture Summary

1.  **Separation of Concerns**: The Frontend (Storefront) and Backend (Medusa) are completely decoupled structure-wise.
2.  **API Communication**: The Storefront communicates with the Backend via REST APIs.
3.  **Modular Frontend**: The Storefront uses a modular design (`src/modules`), making it easy to scale and maintain specific features without affecting others.
4.  **Region Aware**: The structure explicitly supports internationalization via the `[countryCode]` routing pattern.
