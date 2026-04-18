from fastapi import APIRouter, HTTPException, Header
from app.models.schemas import AskRequest, AskResponse, SourceChunk
from app.services.retrieval import search
from app.services.llm import generate_answer

router = APIRouter(prefix="", tags=["Chat"])


@router.post("/ask", response_model=AskResponse)
def ask_question(
    request: AskRequest,
    x_session_id: str = Header(default="anonymous")
):
    """
    Accept a user question, retrieve relevant chunks, and return an LLM-generated answer.
    Optionally filter retrieval to a specific document via doc_id.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Search relevant chunks using session isolation
    chunks = search(query=request.question, session_id=x_session_id, doc_id=request.doc_id)[:3]

    if not chunks:
        return AskResponse(
            answer="No relevant content found in the uploaded documents.",
            sources=[]
        )

    
    answer = generate_answer(query=request.question, context_chunks=chunks)

    
    sources = [
        SourceChunk(
            filename=c["metadata"]["filename"],
            page=c["metadata"]["page"],
            score=c["score"]
        )
        for c in chunks
    ]

    return AskResponse(answer=answer, sources=sources)