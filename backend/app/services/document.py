import fitz # PyMuPDF
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def extract_text_from_pdf(file_bytes: bytes) -> list[dict]:
    """
    Extract text from each page of a PDF.
    Returns a list of dicts: { page: int, text: str }
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page_num in range(len(doc)):
        text = doc[page_num].get_text().strip()
        if text:
            pages.append({
                "page": page_num + 1,
                "text": text
            })
    doc.close()
    return pages


def chunk_text(pages: list[dict], doc_id: str, filename: str) -> list[dict]:
    """
    Split page text into overlapping word-based chunks.
    Each chunk carries metadata: doc_id, filename, page, chunk_index.
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        words = page["text"].split()
        start = 0

        while start < len(words):
            end = start + CHUNK_SIZE
            chunk_words = words[start:end]
            chunk_body = " ".join(chunk_words)

            chunks.append({
                "id": f"{doc_id}_chunk_{chunk_index}",
                "text": chunk_body,
                "metadata": {
                    "doc_id": doc_id,
                    "filename": filename,
                    "page": page["page"],
                    "chunk_index": chunk_index
                }
            })

            chunk_index += 1
            start += CHUNK_SIZE - CHUNK_OVERLAP 

    return chunks