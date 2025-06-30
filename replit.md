# ShawnGPT - Perplexity-Style AI Chatbot

## Overview

ShawnGPT is a Hinglish-speaking AI chatbot application that combines the conversational depth of ChatGPT with the sleek, research-focused interface of Perplexity.ai. The application is built as a full-stack web application with React frontend and Express backend, featuring movie/game recommendations, web search capabilities, and voice input support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Comprehensive component library based on Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database serverless PostgreSQL
- **Development**: Hot reload with Vite middleware integration
- **API Design**: RESTful API structure with JSON responses

### Database Schema
- **chats**: Stores chat sessions with title, timestamps
- **messages**: Stores individual messages with role (user/assistant), content, and metadata
- **Relationships**: Messages belong to chats via foreign key

## Key Components

### Chat System
- **Real-time messaging interface** with typing animations
- **Chat history management** with persistent storage
- **Message cards** with copy/share/like functionality
- **Voice input support** using Web Speech API
- **Mobile-responsive design** with collapsible sidebar

### External API Integrations
- **TMDb API**: Movie search and trending recommendations
- **RAWG API**: Game search and recommendations
- **Serper API**: Web search functionality (configured but not fully implemented)
- **Hugging Face**: AI model integration for chat responses

### UI/UX Features
- **Dark theme** as default with Perplexity-inspired design
- **Responsive layout** supporting desktop and mobile
- **Quick action buttons** for common queries
- **Source attribution** for research-based responses
- **Interactive components** with toast notifications

## Data Flow

1. **User Input**: Messages entered via textarea or voice input
2. **Client Processing**: Input validation and state updates via React Query
3. **API Request**: HTTP requests to Express backend endpoints
4. **External APIs**: Backend calls third-party services for content
5. **Database Storage**: Chat and message persistence via Drizzle ORM
6. **Response Delivery**: Formatted responses with metadata sent to client
7. **UI Updates**: Real-time interface updates with loading states

## External Dependencies

### Production Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI components, Tailwind CSS
- **Database**: Drizzle ORM, Neon Database serverless client
- **Form Handling**: React Hook Form with Zod validation
- **Utilities**: date-fns, clsx, class-variance-authority

### Development Dependencies
- **Build Tools**: Vite, TypeScript, ESBuild
- **Development**: tsx for TypeScript execution
- **Linting/Formatting**: (to be configured)
- **Database Tools**: Drizzle Kit for migrations

### API Requirements
- **Environment Variables**: TMDb, RAWG, Serper, and Hugging Face API keys
- **Database URL**: Neon Database connection string
- **CORS Configuration**: Enabled for cross-origin requests

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot reload
- **Database**: Neon Database serverless instance
- **Environment**: NODE_ENV=development with tsx execution

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild bundling server code for Node.js deployment
- **Database Migrations**: Drizzle Kit push for schema updates
- **Static Serving**: Express serves built frontend assets

### Replit Integration
- **Development Banner**: Replit-specific development enhancements
- **Cartographer Plugin**: Development debugging tools
- **Runtime Error Overlay**: Enhanced error reporting in development

## Changelog

Changelog:
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.