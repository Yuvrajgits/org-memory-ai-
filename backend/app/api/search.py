from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from app.services.embedding_service import embed_texts
from app.core.dependencies import get_faiss_store

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/")
def semantic_search(
    request: SearchRequest,
    faiss_store=Depends(get_faiss_store)
):
    query_embedding = embed_texts([request.query])[0]
    results = faiss_store.search(query_embedding, request.top_k)

    return [
        {
            "text": text,
            "score": score,
            "metadata": metadata
        }
        for text, score, metadata in results
    ]
