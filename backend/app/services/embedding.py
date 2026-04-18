
from chromadb.utils import embedding_functions


_ef = embedding_functions.DefaultEmbeddingFunction()


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Convert list of texts to vector embeddings.
    Uses ChromaDB's built-in ONNX model — lightweight, fits free tier 512MB RAM.
    """
    return list(_ef(texts))