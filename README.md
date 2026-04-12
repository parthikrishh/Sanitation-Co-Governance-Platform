# Sanitation Co-Governance Platform

A modern civic-tech web platform for collaborative sanitation governance between citizens and administrators.

This project provides role-based interfaces for complaint tracking, reporting, dashboards, and governance analytics to improve transparency, accountability, and service delivery.

## Key Highlights

- Role-based experience for citizens and administrators
- Citizen complaint module for issue submission and tracking
- Admin dashboards for operations and performance monitoring
- Analytics and reporting views for decision support
- Responsive UI built with reusable component architecture

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: React 19, Radix UI primitives, reusable component system
- Styling: Tailwind CSS 4, PostCSS
- Forms and Validation: React Hook Form, Zod
- Data Visualization: Recharts

## Project Structure

- app/: route-based pages (admin, citizen, auth, and landing)
- components/: shared UI and layout components
- hooks/: reusable hooks
- lib/: utilities, store, analytics, and shared types
- styles/: global styling assets

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

1. Clone the repository.
2. Install dependencies:

   pnpm install

3. Run the development server:

   pnpm dev

4. Open http://localhost:3000 in your browser.

## Available Scripts

- pnpm dev: Run development server
- pnpm build: Build production bundle
- pnpm start: Start production server
- pnpm lint: Run lint checks

## Deployment

The application can be deployed on Vercel or any Node.js hosting platform that supports Next.js.

## Roadmap

- Integrate authentication and role-based access control
- Add backend APIs and persistent database storage
- Enable complaint lifecycle workflows and SLA tracking
- Add exportable governance reports and advanced analytics
- Introduce notifications and citizen feedback loops

## Author

- Name: Parthiban K B
- GitHub: https://github.com/parthikrishh
- LinkedIn: https://www.linkedin.com/in/parthikrishh

## License

This project is currently unlicensed.
