# backend/app/config.py
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY        = os.getenv("GROQ_API_KEY")
CHUNK_SIZE          = int(os.getenv("CHUNK_SIZE", 400))
CHUNK_OVERLAP       = int(os.getenv("CHUNK_OVERLAP", 50))
TOP_K               = int(os.getenv("TOP_K", 4))
EMBEDDING_MODEL     = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
LLM_MODEL           = os.getenv("LLM_MODEL", "llama3-8b-8192")
CHROMA_DB_PATH      = os.getenv("CHROMA_DB_PATH", "./chroma_db")