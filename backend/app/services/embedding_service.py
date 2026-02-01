from openai import OpenAI
from app.core.config import OPENAI_API_KEY
from typing import List
import logging

logger = logging.getLogger(__name__)
client = OpenAI(api_key=OPENAI_API_KEY)

def embed_texts(
    texts: List[str], 
    model: str = "text-embedding-3-small",
    batch_size: int = 64
) -> List[List[float]]:
    if not texts:
        raise ValueError("texts list cannot be empty")

    valid_texts = [t.strip() for t in texts if t and t.strip()]
    if not valid_texts:
        raise ValueError("No valid texts to embed")

    embeddings = []

    for i in range(0, len(valid_texts), batch_size):
        batch = valid_texts[i:i + batch_size]

        response = client.embeddings.create(
            model=model,
            input=batch
        )

        embeddings.extend([item.embedding for item in response.data])
        logger.info(f"Embedded {len(embeddings)}/{len(valid_texts)} texts")

    return embeddings
