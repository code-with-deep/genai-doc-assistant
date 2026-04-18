
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


def search(query: str, session_id: str, doc_id: str | None = None, top_k: int = TOP_K) -> list[dict]:
    """
    Semantic search — finds top-k most relevant chunks for the query.
    Optionally filter by doc_id to search within a specific document.
    Must filter by session_id to isolate users.
    """
    where_filter = {"session_id": session_id}
    if doc_id:
        where_filter = {"$and": [{"doc_id": doc_id}, {"session_id": session_id}]}

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


def delete_document(doc_id: str, session_id: str) -> int:
    """
    Delete all chunks belonging to a document, ensuring it matches session_id.
    Returns number of chunks deleted.
    """
    existing = _collection.get(where={"doc_id": doc_id}, include=["metadatas"])
    count = len(existing["ids"])
    if count > 0:
        ids_to_delete = []
        for i, meta in enumerate(existing["metadatas"]):
            if meta.get("session_id") == session_id:
                ids_to_delete.append(existing["ids"][i])
        
        if ids_to_delete:
            _collection.delete(ids=ids_to_delete)
        return len(ids_to_delete)
    return 0


def list_documents(session_id: str) -> list[dict]:
    """
    Return deduplicated list of { doc_id, filename } for all stored documents of a user.
    """
    results = _collection.get(where={"session_id": session_id}, include=["metadatas"])
    seen = {}
    for meta in results["metadatas"]:
        # Safety check just in case where clause fails
        if meta.get("session_id") == session_id:
            d_id = meta["doc_id"]
            if d_id not in seen:
                seen[d_id] = meta["filename"]
    return [{"doc_id": k, "filename": v} for k, v in seen.items()]