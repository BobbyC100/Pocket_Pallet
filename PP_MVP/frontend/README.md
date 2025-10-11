# Pocket Pallet Frontend

A calm, knowledgeable companion for natural wine lovers. Built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Design Philosophy

Pocket Pallet feels like a trusted friend recommending a bottle, not an app selling one. The design embodies:

- **Confident, never pushy** - Clear guidance without pressure
- **Positive by design** - Celebrates taste, no "wrong" preferences  
- **Frictionless motion** - Organic transitions, one-tap actions
- **Quiet confidence** - Minimal noise, typography carries emotion
- **Wine-appropriate aesthetics** - Earthy tones, natural textures

## Features

- 🔐 User authentication (login/register)
- 📓 Journal - Capture bottles with photos, notes, vibes
- ✨ Discovery - Personalized wine suggestions
- 📱 Companion View - In-store scanning & quick decisions
- 🎨 Wine-inspired UI with earth tones (not generic purple)
- 📱 Mobile-first, responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the `.env.local` file with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Deployment on Vercel

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com)

3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL

4. Deploy!

## Project Structure

```
frontend/
├── app/
│   ├── contexts/          # React contexts (Auth)
│   ├── services/          # API services
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static files
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Dependencies
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Custom wine-inspired color palette
- **Axios** - HTTP client with interceptors
- **React Context** - Authentication state management

## Design System

### Color Palette
- **Wine** (primary) - Warm, earthy red tones
- **Clay** (secondary) - Natural brown/tan accents  
- **Sage** (tertiary) - Muted green highlights
- **System fonts** - Native feel on every platform

See `DESIGN_IMPLEMENTATION.md` for complete design documentation.

## Features Implemented

### Authentication
- Login with email/password
- User registration
- JWT token management
- Protected routes
- Automatic token refresh

### UI/UX
- Modern gradient designs
- Smooth animations and transitions
- Loading states
- Error handling
- Responsive layout
- Accessible forms

## API Integration

The app connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`.

### API Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

## License

Private - All rights reserved

