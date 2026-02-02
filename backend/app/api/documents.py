from fastapi import APIRouter, UploadFile, File, HTTPException, Header
import os
import shutil

from app.utils.text_extractor import extract_text_from_pdf
from app.utils.text_splitter import split_text
from app.services.embedding_service import embed_texts
from app.core.dependencies import get_faiss_store
from app.core.config import ADMIN_SECRET_KEY

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    x_admin_key: str = Header(None, alias="X-Admin-Key")
):
    # Validate admin key
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=401,
            detail={
                "error_code": "UNAUTHORIZED",
                "message": "Invalid or missing admin key"
            }
        )
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1️⃣ Extract text
    text = extract_text_from_pdf(file_path)

    # 2️⃣ Split into chunks
    chunks = split_text(text)

    # 3️⃣ Embed chunks
    embeddings = embed_texts(chunks)

    # 4️⃣ Store in FAISS
    faiss_store = get_faiss_store()
    metadata = [
        {"source": file.filename, "chunk_id": i}
        for i in range(len(chunks))
    ]
    faiss_store.add(embeddings, chunks, metadata)

    return {
        "filename": file.filename,
        "chunks_indexed": len(chunks),
    }


@router.get("/")
def list_documents():
    """
    List all uploaded PDF documents
    """
    if not os.path.exists(UPLOAD_DIR):
        return []

    files = [
        {"filename": f}
        for f in os.listdir(UPLOAD_DIR)
        if f.endswith(".pdf")
    ]

    return files


@router.delete("/{filename}")
def delete_document(filename: str):
    """
    Delete a document file (vectors cleanup comes later)
    """
    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(file_path)

    return {"deleted": filename}
