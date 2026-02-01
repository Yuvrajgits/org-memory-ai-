from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from app.core.dependencies import get_faiss_store
from app.services.embedding_service import embed_texts
from app.services.answer_service import generate_answer

# ✅ ROUTER MUST BE DEFINED FIRST
router = APIRouter(prefix="/ask", tags=["Ask"])
logger = logging.getLogger(__name__)


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    confidence: str
    sources_used: list[int]
    model: str


@router.post("/", response_model=AskResponse)
def ask_question(payload: AskRequest):
    logger.info(f"Received question: {payload.question[:100]}...")  # Log first 100 chars
    
    if not payload.question.strip():
        logger.warning("Empty question received")
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "EMPTY_QUESTION",
                "message": "Question cannot be empty"
            }
        )

    faiss_store = get_faiss_store()

    if len(faiss_store) == 0:
        logger.warning("No documents indexed in FAISS store")
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "NO_DOCUMENTS",
                "message": "No documents indexed yet"
            }
        )

    try:
        query_embedding = embed_texts([payload.question])[0]
        results = faiss_store.search(query_embedding, k=5)

        context_chunks = [text for text, _, _ in results]
        sources_used = [meta.get("chunk_id", 0) for _, _, meta in results]

        rag_response = generate_answer(
            question=payload.question,
            context_chunks=context_chunks
        )
        
        logger.info(f"Generated answer with confidence: {rag_response.confidence}")

        return {
            "answer": rag_response.answer,
            "confidence": rag_response.confidence,
            "sources_used": sources_used,
            "model": rag_response.model,
        }

    except Exception as e:
        logger.error(f"Failed to generate answer: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "ASK_FAILED",
                "message": "Failed to generate answer"
            }
        )
