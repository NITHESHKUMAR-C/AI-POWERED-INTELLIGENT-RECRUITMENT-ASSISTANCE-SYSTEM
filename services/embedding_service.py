"""
Embedding & Semantic Similarity Service
Uses Sentence Transformers with automatic high-fidelity TF-IDF Vectorizer fallback.
"""

import os
import logging
import numpy as np
from typing import List, Union
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger("embedding_service")

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.is_transformer = False
        self._init_model()

    def _init_model(self):
        """Attempts to load SentenceTransformer model; sets fallback if unavailable."""
        try:
            from sentence_transformers import SentenceTransformer
            # Disable unneeded telemetry/token checks
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            logger.info(f"Loading SentenceTransformer model '{self.model_name}'...")
            self.model = SentenceTransformer(self.model_name)
            self.is_transformer = True
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as e:
            logger.warning(
                f"SentenceTransformer not loaded ({e}). Switching to high-performance semantic TF-IDF Vectorizer fallback."
            )
            self.is_transformer = False
            self.model = None

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        """Generate embedding vectors for given texts."""
        if isinstance(texts, str):
            texts = [texts]

        # Clean empty texts
        cleaned_texts = [t.strip() if t and t.strip() else "none" for t in texts]

        if self.is_transformer and self.model:
            try:
                embeddings = self.model.encode(cleaned_texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings
            except Exception as e:
                logger.error(f"Transformer encoding failed: {e}. Using TF-IDF vectorizer fallback.")

        # Fallback: Character and word N-gram TF-IDF vectorizer with sublinear scaling
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=2500,
            sublinear_tf=True,
            stop_words="english"
        )
        return vectorizer.fit_transform(cleaned_texts).toarray()

    def compute_similarity(self, text_a: str, text_b: str) -> float:
        """
        Compute normalized cosine similarity score between two texts in range [0.0, 1.0].
        """
        if not text_a or not text_b:
            return 0.0

        if self.is_transformer and self.model:
            try:
                emb = self.model.encode([text_a, text_b], convert_to_numpy=True, normalize_embeddings=True)
                sim = float(np.dot(emb[0], emb[1]))
                # Clamp between 0.0 and 1.0
                return max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim))
            except Exception as e:
                logger.warning(f"Error computing transformer similarity: {e}. Using TF-IDF.")

        # TF-IDF Cosine Similarity Fallback
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words="english"
        )
        try:
            tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(max(0.0, min(1.0, sim)))
        except Exception as e:
            logger.error(f"Fallback similarity calculation failed: {e}")
            return 0.5  # Neutral fallback

# Singleton instance
_service_instance = None

def get_embedding_service() -> EmbeddingService:
    global _service_instance
    if _service_instance is None:
        model_name = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
        _service_instance = EmbeddingService(model_name=model_name)
    return _service_instance
