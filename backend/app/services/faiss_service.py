import faiss
import numpy as np
import os
import pickle
from typing import List, Tuple, Optional


class FaissStore:
    def __init__(
        self,
        dimension: int,
        use_cosine: bool = True,
        index_path: Optional[str] = None,
    ):
        self.dimension = dimension
        self.use_cosine = use_cosine
        self.index_path = index_path

        if use_cosine:
            self.index = faiss.IndexFlatIP(dimension)
        else:
            self.index = faiss.IndexFlatL2(dimension)

        self.texts: List[str] = []
        self.metadata: List[dict] = []

        # 🔥 SAFE LOAD
        if index_path and os.path.exists(f"{index_path}.index"):
            self.load(index_path)

    # -------------------------
    # ADD VECTORS
    # -------------------------
    def add(
        self,
        embeddings: List[List[float]],
        texts: List[str],
        metadata: Optional[List[dict]] = None,
    ):
        vectors = np.array(embeddings, dtype=np.float32)

        if self.use_cosine:
            faiss.normalize_L2(vectors)

        self.index.add(vectors)
        self.texts.extend(texts)
        self.metadata.extend(metadata or [{}] * len(texts))

        if self.index_path:
            self.save(self.index_path)

    # -------------------------
    # SEARCH
    # -------------------------
    def search(
        self,
        embedding: List[float],
        k: int = 5,
    ) -> List[Tuple[str, float, dict]]:
        vector = np.array([embedding], dtype=np.float32)

        if self.use_cosine:
            faiss.normalize_L2(vector)

        distances, indices = self.index.search(vector, k)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue
            results.append(
                (
                    self.texts[idx],
                    float(distances[0][i]),
                    self.metadata[idx],
                )
            )
        return results

    # -------------------------
    # SAVE
    # -------------------------
    def save(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        faiss.write_index(self.index, f"{path}.index")

        with open(f"{path}.meta", "wb") as f:
            pickle.dump(
                {
                    "texts": self.texts,
                    "metadata": self.metadata,
                    "dimension": self.dimension,
                    "use_cosine": self.use_cosine,
                },
                f,
            )

    # -------------------------
    # LOAD  ✅ FIX
    # -------------------------
    def load(self, path: str):
        self.index = faiss.read_index(f"{path}.index")

        with open(f"{path}.meta", "rb") as f:
            data = pickle.load(f)
            self.texts = data["texts"]
            self.metadata = data["metadata"]

    # -------------------------
    # SIZE (used by /ask)
    # -------------------------
    def __len__(self):
        return len(self.texts)
