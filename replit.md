# Overview

AquaSaver is a gamified water conservation educational platform that combines interactive gameplay with environmental awareness. The application teaches users about water usage, conservation techniques, and sustainability through engaging mini-games and challenges. Built as a full-stack web application, it features a React frontend with shadcn/ui components and an Express backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses React with TypeScript, built with Vite for development and bundling. The UI is constructed using shadcn/ui components based on Radix UI primitives and styled with Tailwind CSS. The application follows a component-based architecture with:

- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Animations**: Framer Motion for smooth UI transitions and interactions
- **Forms**: React Hook Form with Zod validation schemas

The main game interface includes multiple interactive components: water usage simulators, leak detection games, rainwater collection activities, progress tracking, leaderboards, and educational tips. Each mini-game is implemented as a separate component with its own game logic and scoring system.

## Backend Architecture
The backend uses Express.js with TypeScript, following a REST API pattern. The server architecture includes:

- **API Routes**: RESTful endpoints for profile management, game activities, daily challenges, and leaderboard data
- **Storage Layer**: Abstract storage interface with in-memory implementation for development (IStorage interface)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Vite integration for hot module replacement and development server

The storage system supports user profiles, game activities tracking, daily challenges, and leaderboard functionality through a clean interface that can be easily swapped between memory and database implementations.

## Database Design
Uses Drizzle ORM with PostgreSQL for data persistence. The schema includes:

- **Users**: Basic user authentication and profile information
- **Game Profiles**: Player statistics, points, levels, achievements, and water savings tracking
- **Game Activities**: Individual game session records with points and water saved
- **Daily Challenges**: Time-based challenges with progress tracking

The database design supports gamification features like achievements, streaks, and comprehensive activity logging for progress analysis.

## Game Mechanics
Three main interactive games form the core experience:

1. **Water Simulator**: Real-time water usage simulation for daily activities (brushing teeth, showering, washing dishes) with conservation mode toggle
2. **Leak Detection**: Timed game where players identify and fix water leaks around a virtual house
3. **Rainwater Collection**: Resource management game involving rain collection systems and plant watering

Each game calculates water saved and awards points based on player performance, contributing to overall profile statistics and daily challenge progress.

# External Dependencies

## UI and Styling
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom color scheme
- **Radix UI**: Unstyled, accessible UI components for complex interactions
- **Framer Motion**: Animation library for smooth transitions and interactive elements

## Backend Services
- **Express.js**: Web application framework with middleware support
- **Drizzle ORM**: Type-safe SQL query builder and schema management
- **Neon Database**: Serverless PostgreSQL database platform (via @neondatabase/serverless)
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

## Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **TypeScript**: Static type checking across frontend and backend
- **React Query**: Server state management with caching and synchronization
- **Zod**: Runtime type validation for forms and API data
- **ESBuild**: Fast bundling for production builds

## Replit Integration
- **@replit/vite-plugin-cartographer**: Development navigation enhancement
- **@replit/vite-plugin-dev-banner**: Development environment branding
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting during development

The application is designed to run seamlessly in Replit's environment with specialized plugins for development experience while maintaining compatibility with standard deployment platforms.