import chromadb
from app.services.embedding import get_embeddings
from app.config import TOP_K, CHROMA_DB_PATH

_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
_collection = _client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}   
)


def add_chunks(chunks: list[dict]) -> None:
    """
    Embed and store document chunks in ChromaDB.
    Each chunk: { id, text, metadata }
    """
    texts     = [c["text"]     for c in chunks]
    ids       = [c["id"]       for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    embeddings = get_embeddings(texts)

    _collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )


def search(query: str, doc_id: str | None = None, top_k: int = TOP_K) -> list[dict]:
    """
    Perform semantic search for the most relevant chunks.
    Optionally filter by doc_id to search within a single document.
    Returns list of { text, metadata, score }.
    """
    query_embedding = get_embeddings([query])[0]

    where_filter = {"doc_id": doc_id} if doc_id else None

    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter,
        include=["documents", "metadatas", "distances"]
    )

    chunks = []
    for i in range(len(results["ids"][0])):
        chunks.append({
            "text":     results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "score":    round(1 - results["distances"][0][i], 4) 
        })

    return chunks


def delete_document(doc_id: str) -> int:
    """
    Delete all chunks belonging to a document.
    Returns the number of chunks deleted.
    """
    existing = _collection.get(where={"doc_id": doc_id})
    count = len(existing["ids"])
    if count > 0:
        _collection.delete(ids=existing["ids"])
    return count


def list_documents() -> list[dict]:
    """
    Return a deduplicated list of { doc_id, filename } for all stored documents.
    """
    results = _collection.get(include=["metadatas"])
    seen = {}
    for meta in results["metadatas"]:
        doc_id = meta["doc_id"]
        if doc_id not in seen:
            seen[doc_id] = meta["filename"]
    return [{"doc_id": k, "filename": v} for k, v in seen.items()]