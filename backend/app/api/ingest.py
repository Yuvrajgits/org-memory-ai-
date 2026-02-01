from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import shutil
import logging

from app.utils.text_extractor import extract_text_from_pdf
from app.utils.text_splitter import split_text
from app.services.embedding_service import embed_texts
from app.core.dependencies import get_faiss_store

router = APIRouter(prefix="/documents", tags=["Documents"])
logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    faiss_store=Depends(get_faiss_store)  # ✅ SAME INSTANCE AS /ask
):
    logger.info(f"Received upload request for file: {file.filename}")
    
    if not file.filename.endswith(".pdf"):
        logger.warning(f"Invalid file type attempted: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved to: {file_path}")

        text = extract_text_from_pdf(file_path)
        chunks = split_text(text)
        
        logger.info(f"Extracted {len(chunks)} chunks from {file.filename}")
        
        embeddings = embed_texts(chunks)

        metadata = [
            {"source": file.filename, "chunk_id": i}
            for i in range(len(chunks))
        ]

        faiss_store.add(embeddings, chunks, metadata)
        
        logger.info(f"Successfully indexed {len(chunks)} chunks for {file.filename}")

        return {
            "filename": file.filename,
            "chunks_indexed": len(chunks)
        }
    
    except Exception as e:
        logger.error(f"Failed to process document {file.filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )
