from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, chat
from app.models.schemas import HealthResponse

app = FastAPI(
    title="GenAI Document Assistant",
    description="RAG-based Document Q&A Chatbot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://genai-doc-assistant.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(chat.router)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return HealthResponse(status="ok")