# Tech Stack & Build System

## Core Technologies
- **React 19.2.0** - UI library with modern hooks
- **Vite 7.2.4** - Build tool and development server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Google Gemini API** - AI image analysis service

## Build System
- **Vite** as primary build tool with React plugin
- **ESLint** for code linting with React-specific rules
- **PostCSS** with Autoprefixer for CSS processing
- **ES Modules** (type: "module" in package.json)

## Environment Setup
- Requires `VITE_GEMINI_API_KEY` environment variable
- Uses `.env` file for local development (not committed)
- `.env.example` provides template for required variables

## Common Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run lint         # Run ESLint checks
```

### Production
```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

### Setup
```bash
npm install          # Install dependencies
cp .env.example .env # Setup environment variables
```

## Code Style
- Uses ESLint with React hooks and React refresh plugins
- Modern React patterns (functional components, hooks)
- ES6+ syntax with modules
- Tailwind utility classes for styling