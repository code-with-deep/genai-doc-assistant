from sentence_transformers import SentenceTransformer
from app.config import EMBEDDING_MODEL

_model = SentenceTransformer(EMBEDDING_MODEL)

def get_embeddings(texts: list[str]) -> list[list[float]]:
    embeddings = _model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()