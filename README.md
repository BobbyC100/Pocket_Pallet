# 🍷 Pocket Pallet

**A wine collection management app built with Next.js, FastAPI, and PostgreSQL**

Pocket Pallet helps wine enthusiasts catalog their collection, track tasting notes, and discover new wines. The app features OCR scanning of wine lists, smart search, and an adaptive learning system that improves over time.

## Features

- 🔐 **User Authentication**: Secure login and registration with JWT tokens
- 📸 **OCR Wine List Scanning**: Upload images/PDFs of wine lists and automatically extract wine data
- 🧠 **Adaptive Learning System**: OCR accuracy improves over time based on user feedback
- 📊 **Wine Collection Management**: Track your wines with detailed information
- 🔍 **Smart Search**: Find wines by name, region, vintage, or price
- 📱 **Responsive Design**: Beautiful UI that works on desktop and mobile

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Wine-inspired design system)
- **React Context** for state management

### Backend
- **FastAPI** (Python 3.11+)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM)
- **Alembic** (Migrations)
- **Azure Document Intelligence** (OCR)

### Deployment
- **Vercel** (Frontend)
- **Render** (Backend + Database)

---

## 🧠 OCR Learning System (v1.0)

Pocket Pallet now includes a **Learning-Over-Time system** that continuously improves the accuracy of OCR-extracted wine data based on user feedback.

### How It Works

1. When a wine list is scanned via OCR, extracted items are queued for review at `/imports/review`.

2. Each item displays:
   - Parsed wine name, region, vintage, and price
   - Confidence level (Azure OCR % vs. internal parser %)
   - Action buttons: **Accept ✅** | **Edit ✏️** | **Reject ❌**

3. Every feedback action is stored in the `ocr_feedback` table in PostgreSQL.

4. On the next OCR run, the parser applies **adaptive biasing**—favoring patterns and tokens that users consistently accept or edit (e.g., "Brut Réserve NV" recognized as one entity).

### Backend Details

- **Endpoint**: `POST /api/v1/ocr/feedback`
- **Model**: `OcrFeedback(id, raw_text, parsed_name, action, user, timestamp)`
- **Service**: `app/services/ocr_learning.py` dynamically adjusts parser weighting using feedback frequency.
- **Migration**: Run `alembic upgrade head` after pulling the PR.

### Frontend Details

- **Page**: `/imports/review`
- Built with Next.js 14 (App Router) + Tailwind CSS
- Uses existing `api.ts` service for feedback submission
- Text and backgrounds follow WCAG-AA contrast rules (`bg-wine-50` / `text-gray-700+`)

### Benefits

- Reduces misclassification of headers or long prose (e.g., Grower Champagne intro text)
- Improves parsing of multi-line and irregular menus over time
- Establishes a data foundation for future model fine-tuning

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **PostgreSQL 14+**
- **Azure Document Intelligence** account (for OCR)

### Setup

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Pocket_Pallet.git
cd Pocket_Pallet
```

#### 2. Backend Setup

```bash
cd PP_MVP/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
# See backend/.env.example for required variables

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

#### 3. Frontend Setup

```bash
cd PP_MVP/frontend

# Install dependencies
npm install

# Set up environment variables (create .env.local file)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pocket_pallet
SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=["http://localhost:3000"]

# Azure Document Intelligence (OCR)
AZURE_DOC_INTEL_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_DOC_INTEL_KEY=your-azure-key-here
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deployment

### Backend (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set the **Root Directory** to `PP_MVP/backend`
4. Set the **Build Command**: `pip install -r requirements.txt`
5. Set the **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add all environment variables from `.env`
7. Create a **PostgreSQL database** and link it

### Frontend (Vercel)

1. Import your GitHub repository to Vercel
2. Set the **Root Directory** to `PP_MVP/frontend`
3. Set the **Framework Preset** to Next.js
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
5. Deploy

---

## Project Structure

```
Pocket_Pallet/
├── PP_MVP/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── endpoints/  # API routes
│   │   │   ├── core/           # Config, security
│   │   │   ├── db/             # Database setup
│   │   │   ├── models/         # SQLAlchemy models
│   │   │   ├── schemas/        # Pydantic schemas
│   │   │   └── services/       # Business logic
│   │   ├── alembic/            # Database migrations
│   │   ├── requirements.txt
│   │   └── Procfile
│   └── frontend/
│       ├── app/
│       │   ├── (auth)/         # Auth pages
│       │   ├── contexts/       # React contexts
│       │   ├── services/       # API client
│       │   └── components/     # React components
│       ├── public/
│       ├── package.json
│       └── tailwind.config.js
└── README.md
```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

MIT License - see LICENSE file for details

---

## Acknowledgments

- Azure Document Intelligence for OCR capabilities
- The wine community for inspiration 🍷


