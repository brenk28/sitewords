# Overview

This is a Sight Words educational web application built with React and Express. The app helps users learn sight words through a flashcard-style interface with customizable settings. Users can view words one at a time, configure word lists, enable random order display, and set up auto-advance functionality. The application features a clean, modern UI built with shadcn/ui components and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for sight word application state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot module replacement with Vite integration

## Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations
- **Storage Abstraction**: Interface-based storage layer with in-memory fallback for development

## Database Schema
The application uses a simple schema with a `sight_words` table containing:
- `id`: Primary key
- `words`: Array of sight words
- `randomOrder`: Boolean for random word display
- `autoAdvance`: Boolean for automatic progression
- `userId`: User identifier (currently defaults to "default")

## Authentication and Authorization
- Currently uses a simplified approach with a default user ID
- Session management infrastructure is in place for future user authentication
- Ready for extension to support multiple users

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **drizzle-orm**: TypeScript ORM for PostgreSQL
- **drizzle-kit**: Database toolkit for migrations and schema management

## UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating component variants
- **clsx**: Utility for conditional CSS classes

## Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers
- **wouter**: Minimalist routing library
- **zod**: TypeScript-first schema validation

## Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Utility Libraries
- **date-fns**: Date manipulation library
- **nanoid**: URL-safe unique ID generator
- **cmdk**: Command palette component