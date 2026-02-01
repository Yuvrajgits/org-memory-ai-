# Organizational Memory AI

A production-ready AI-powered document ingestion and question-answering system built with FastAPI and React.

## Features

- 📄 **PDF Document Ingestion**: Upload and process PDF documents
- 🤖 **AI-Powered Q&A**: Ask questions about your documents using GPT-4
- 🔍 **Vector Search**: Fast semantic search using FAISS
- 🎨 **Modern UI**: Clean, dark-themed React interface
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Tech Stack

**Backend:**
- FastAPI (Python)
- OpenAI GPT-4o-mini
- FAISS for vector storage
- Structured logging

**Frontend:**
- React + Vite
- Modern CSS with dark theme

## Quick Start

### Prerequisites

- Docker & Docker Compose
- OpenAI API Key

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd org-memory-ai
   ```

2. **Set up environment variables**
   ```bash
   # Copy example files
   cp .env.example .env
   cp org-memory-ai-frontend/.env.example org-memory-ai-frontend/.env
   
   # Edit .env and add your OpenAI API key
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd org-memory-ai-frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Production Deployment

1. Update `ALLOWED_ORIGINS` in backend `.env` to your production domain
2. Set `ENV=production` in backend `.env`
3. Update `VITE_API_URL` in docker-compose.yml to your backend URL
4. Run: `docker-compose up -d`

## API Endpoints

- `POST /documents/upload` - Upload a PDF document
- `GET /documents` - List all documents
- `DELETE /documents/{filename}` - Delete a document
- `POST /ask/` - Ask a question about your documents
- `GET /health` - Health check

## Project Structure

```
org-memory-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config & logging
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   └── requirements.txt
├── org-memory-ai-frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   └── pages/        # Page components
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend
```

## License

MIT
