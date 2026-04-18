
import chromadb
from chromadb.utils import embedding_functions
from app.config import TOP_K, CHROMA_DB_PATH

_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)


_ef = embedding_functions.DefaultEmbeddingFunction()

_collection = _client.get_or_create_collection(
    name="documents",
    embedding_function=_ef,
    metadata={"hnsw:space": "cosine"}
)


def add_chunks(chunks: list[dict]) -> None:
    """
    Store document chunks in ChromaDB.
    Embeddings are auto-generated internally by the embedding function.
    """
    _collection.add(
        ids      =[c["id"]       for c in chunks],
        documents=[c["text"]     for c in chunks],
        metadatas=[c["metadata"] for c in chunks]
    )


def search(query: str, doc_id: str | None = None, top_k: int = TOP_K) -> list[dict]:
    """
    Semantic search — finds top-k most relevant chunks for the query.
    Optionally filter by doc_id to search within a specific document.
    """
    where_filter = {"doc_id": doc_id} if doc_id else None

    results = _collection.query(
        query_texts=[query],   # auto-embedded internally — no manual embedding needed
        n_results=top_k,
        where=where_filter,
        include=["documents", "metadatas", "distances"]
    )

    return [
        {
            "text":     results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "score":    round(1 - results["distances"][0][i], 4)
        }
        for i in range(len(results["ids"][0]))
    ]


def delete_document(doc_id: str) -> int:
    """
    Delete all chunks belonging to a document.
    Returns number of chunks deleted.
    """
    existing = _collection.get(where={"doc_id": doc_id})
    count = len(existing["ids"])
    if count > 0:
        _collection.delete(ids=existing["ids"])
    return count


def list_documents() -> list[dict]:
    """
    Return deduplicated list of { doc_id, filename } for all stored documents.
    """
    results = _collection.get(include=["metadatas"])
    seen = {}
    for meta in results["metadatas"]:
        doc_id = meta["doc_id"]
        if doc_id not in seen:
            seen[doc_id] = meta["filename"]
    return [{"doc_id": k, "filename": v} for k, v in seen.items()]