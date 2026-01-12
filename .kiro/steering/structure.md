# Project Structure & Organization

## Directory Layout
```
image-desc/
├── .env                     # Environment variables (gitignored)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
├── public/                 # Static assets
│   └── vite.svg           # Vite logo
└── src/                   # Source code
    ├── main.jsx           # React entry point
    ├── App.jsx            # Root component (minimal wrapper)
    ├── index.css          # Global styles with Tailwind directives
    ├── components/        # React components
    │   └── ImageDescriber.jsx  # Main application component
    └── assets/            # Project assets
        └── react.svg      # React logo
```

## Architecture Patterns
- **Single Page Application** - All functionality in one main component
- **Component-based** - React functional components with hooks
- **Utility-first CSS** - Tailwind classes for all styling
- **Environment-based config** - API keys via environment variables

## File Naming Conventions
- **Components**: PascalCase (e.g., `ImageDescriber.jsx`)
- **Config files**: kebab-case (e.g., `vite.config.js`)
- **Styles**: lowercase (e.g., `index.css`)

## Component Organization
- Main logic concentrated in `ImageDescriber.jsx`
- Minimal `App.jsx` serves as simple wrapper
- No complex component hierarchy - single-component architecture
- State management via React hooks (useState, useRef)

## Asset Management
- Static assets in `public/` directory
- Component-specific assets in `src/assets/`
- Images handled via file upload, not bundled assets