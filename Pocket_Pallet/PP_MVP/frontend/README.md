# Pocket Pallet Frontend

React + TypeScript frontend for the Pocket Pallet admin console.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Forms with validation
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components
├── services/      # API clients
├── hooks/         # Custom React hooks
├── types/         # TypeScript types
├── utils/         # Helper functions
└── styles/        # Global styles
```

## Key Features

### Manual Entry
- Wine form with inline validation
- Auto-save drafts every 2 seconds
- Preview merge before publishing
- Version history viewer

### Bulk Import
- File upload with progress tracking
- Import job monitoring
- Real-time status updates
- Error reporting

### Review Queue
- Side-by-side comparison
- Confidence score display
- Accept/reject actions
- Queue statistics

## Development

```bash
# Lint
npm run lint

# Type check
tsc --noEmit

# Format
prettier --write src/
```

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Building for Production

```bash
npm run build
```

Output in `dist/` directory ready for deployment.

