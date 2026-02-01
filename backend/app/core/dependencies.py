from app.services.faiss_service import FaissStore
from app.core.config import EMBEDDING_DIMENSION, FAISS_INDEX_PATH

_faiss_store = None


def get_faiss_store() -> FaissStore:
    global _faiss_store

    if _faiss_store is None:
        _faiss_store = FaissStore(
            dimension=EMBEDDING_DIMENSION,
            use_cosine=True,
            index_path=FAISS_INDEX_PATH
        )

    return _faiss_store
