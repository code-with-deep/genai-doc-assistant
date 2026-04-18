from pydantic import BaseModel
from typing import Optional

class AskRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None   # filter by a specific document

class SourceChunk(BaseModel):
    filename: str
    page: int
    score: float

class AskResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]

class DocumentInfo(BaseModel):
    doc_id: str
    filename: str

class UploadResponse(BaseModel):
    message: str
    doc_id: str
    total_chunks: int

class DeleteResponse(BaseModel):
    message: str

class HealthResponse(BaseModel):
    status: str