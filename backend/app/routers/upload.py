import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.services.document import extract_text_from_pdf, chunk_text
from app.services.retrieval import add_chunks, list_documents, delete_document
from app.models.schemas import UploadResponse, DocumentInfo, DeleteResponse

router = APIRouter(prefix="", tags=["Documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    x_session_id: str = Header(default="anonymous")
):
    """
    Upload a PDF file, extract text, chunk it, embed it, and store in vector DB.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    doc_id = str(uuid.uuid4())

    
    pages = extract_text_from_pdf(file_bytes)
    if not pages:
        raise HTTPException(status_code=422, detail="Could not extract text from this PDF.")

    # Split text into chunks, adding metadata including session_id
    chunks = chunk_text(pages, doc_id, file.filename, x_session_id)
    if not chunks:
        raise HTTPException(status_code=422, detail="No chunks generated from this PDF.")


    add_chunks(chunks)

    return UploadResponse(
        message="Document uploaded and indexed successfully.",
        doc_id=doc_id,
        total_chunks=len(chunks)
    )


@router.get("/documents", response_model=list[DocumentInfo])
def get_documents(x_session_id: str = Header(default="anonymous")):
    """
    List all documents currently stored in the vector database.
    """
    return list_documents(x_session_id)


@router.delete("/documents/{doc_id}", response_model=DeleteResponse)
def remove_document(doc_id: str, x_session_id: str = Header(default="anonymous")):
    """
    Delete a document and all its embeddings from the vector database.
    """
    deleted_count = delete_document(doc_id, x_session_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"No document found with id: {doc_id}")
    return DeleteResponse(message=f"Document {doc_id} deleted ({deleted_count} chunks removed).")