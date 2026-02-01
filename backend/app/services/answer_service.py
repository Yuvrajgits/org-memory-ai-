from openai import OpenAI, OpenAIError, RateLimitError, APITimeoutError
from typing import List, Optional, Dict, Any
import logging
import tiktoken
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

from app.core.config import OPENAI_API_KEY, DEFAULT_LLM_MODEL, MAX_CONTEXT_TOKENS

logger = logging.getLogger(__name__)

client = OpenAI(api_key=OPENAI_API_KEY)


class AnswerGenerationError(Exception):
    """Custom exception for answer generation failures."""
    pass


class RAGResponse:
    """Structured response from RAG system."""
    def __init__(
        self,
        answer: str,
        sources_used: List[int],
        confidence: str,
        tokens_used: Dict[str, int],
        model: str
    ):
        self.answer = answer
        self.sources_used = sources_used
        self.confidence = confidence
        self.tokens_used = tokens_used
        self.model = model
    
    def to_dict(self) -> dict:
        return {
            "answer": self.answer,
            "sources_used": self.sources_used,
            "confidence": self.confidence,
            "tokens_used": self.tokens_used,
            "model": self.model
        }


def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Count tokens in text for a given model."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


def truncate_context(
    chunks: List[str],
    max_tokens: int = 3000,
    model: str = "gpt-4"
) -> tuple[List[str], List[int]]:
    """
    Truncate context to fit within token limit.
    Returns: (truncated_chunks, indices_used)
    """
    selected_chunks = []
    indices_used = []
    total_tokens = 0
    
    for idx, chunk in enumerate(chunks):
        chunk_tokens = count_tokens(chunk, model)
        
        if total_tokens + chunk_tokens <= max_tokens:
            selected_chunks.append(chunk)
            indices_used.append(idx)
            total_tokens += chunk_tokens
        else:
            # Try to fit a truncated version of this chunk
            remaining_tokens = max_tokens - total_tokens
            if remaining_tokens > 100:  # Only if meaningful space left
                encoding = tiktoken.encoding_for_model(model)
                tokens = encoding.encode(chunk)
                truncated = encoding.decode(tokens[:remaining_tokens])
                selected_chunks.append(truncated + "...")
                indices_used.append(idx)
            break
    
    logger.info(f"Using {len(selected_chunks)}/{len(chunks)} chunks ({total_tokens} tokens)")
    return selected_chunks, indices_used


@retry(
    retry=retry_if_exception_type((RateLimitError, APITimeoutError)),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def generate_answer(
    question: str,
    context_chunks: List[str],
    model: str = DEFAULT_LLM_MODEL,
    temperature: float = 0.2,
    max_context_tokens: int = MAX_CONTEXT_TOKENS,
    include_citations: bool = True
) -> RAGResponse:
    """
    Generate an answer using retrieved document context with proper error handling.
    
    Args:
        question: User's question
        context_chunks: List of relevant text chunks from documents
        model: OpenAI model to use
        temperature: Generation temperature (0.0-1.0)
        max_context_tokens: Maximum tokens for context
        include_citations: Whether to include source references
    
    Returns:
        RAGResponse object with answer and metadata
        
    Raises:
        AnswerGenerationError: If generation fails after retries
    """
    # Input validation
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")
    
    if not context_chunks:
        logger.warning("No context chunks provided")
        return RAGResponse(
            answer="I don't have any relevant documents to answer this question.",
            sources_used=[],
            confidence="none",
            tokens_used={"prompt": 0, "completion": 0, "total": 0},
            model=model
        )
    
    # Filter out empty chunks
    context_chunks = [chunk.strip() for chunk in context_chunks if chunk and chunk.strip()]
    
    try:
        # Truncate context to fit token limits
        truncated_chunks, indices_used = truncate_context(
            context_chunks,
            max_tokens=max_context_tokens,
            model=model
        )
        
        # Build numbered context for citations
        if include_citations:
            context_parts = []
            for idx, chunk in enumerate(truncated_chunks, 1):
                context_parts.append(f"[Source {idx}]\n{chunk}")
            context = "\n\n".join(context_parts)
            citation_instruction = (
                "When using information from the context, cite the source number "
                "like [Source 1] or [Source 2]."
            )
        else:
            context = "\n\n".join(truncated_chunks)
            citation_instruction = ""
        
        # Enhanced system prompt
        system_prompt = (
            "You are an expert organizational knowledge assistant. "
            "Your role is to provide accurate, helpful answers based STRICTLY on the provided context. "
            "\n\nRules:\n"
            "1. Answer ONLY using information from the provided context\n"
            "2. If the answer is not in the context, clearly state: "
            "'I don't have enough information in the provided documents to answer this question.'\n"
            "3. Be concise but complete\n"
            "4. If the context is ambiguous or contradictory, acknowledge this\n"
            f"5. {citation_instruction}\n"
            "6. Do not make assumptions or add information not in the context"
        )
        
        user_prompt = f"""Context:
{context}

Question: {question}

Please provide a clear, accurate answer based solely on the context above."""
        
        # Calculate prompt tokens
        prompt_text = system_prompt + user_prompt
        prompt_tokens = count_tokens(prompt_text, model)
        
        logger.info(f"Generating answer with {prompt_tokens} prompt tokens")
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=1000,  # Limit response length
            presence_penalty=0.0,
            frequency_penalty=0.0,
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Determine confidence based on response content
        confidence = determine_confidence(answer)
        
        # Token usage
        tokens_used = {
            "prompt": response.usage.prompt_tokens,
            "completion": response.usage.completion_tokens,
            "total": response.usage.total_tokens
        }
        
        logger.info(
            f"Answer generated successfully. "
            f"Tokens: {tokens_used['total']}, Confidence: {confidence}"
        )
        
        return RAGResponse(
            answer=answer,
            sources_used=indices_used,
            confidence=confidence,
            tokens_used=tokens_used,
            model=model
        )
    
    except (RateLimitError, APITimeoutError) as e:
        logger.error(f"OpenAI API error after retries: {str(e)}")
        raise AnswerGenerationError(
            "The service is currently experiencing high load. Please try again in a moment."
        )
    
    except OpenAIError as e:
        logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
        raise AnswerGenerationError(
            f"Failed to generate answer due to API error: {str(e)}"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error in answer generation: {str(e)}", exc_info=True)
        raise AnswerGenerationError(
            "An unexpected error occurred while generating the answer."
        )


def determine_confidence(answer: str) -> str:
    """
    Determine confidence level based on answer content.
    Simple heuristic - can be replaced with more sophisticated logic.
    """
    answer_lower = answer.lower()
    
    # Check for explicit uncertainty
    uncertainty_phrases = [
        "don't have enough information",
        "cannot find",
        "not mentioned",
        "unclear",
        "ambiguous"
    ]
    
    if any(phrase in answer_lower for phrase in uncertainty_phrases):
        return "low"
    
    # Check for hedging language
    hedge_phrases = [
        "might", "may", "possibly", "perhaps", "seems",
        "appears", "suggests", "could be"
    ]
    
    hedge_count = sum(1 for phrase in hedge_phrases if phrase in answer_lower)
    
    if hedge_count >= 3:
        return "medium"
    elif hedge_count >= 1:
        return "medium-high"
    else:
        return "high"


async def generate_answer_streaming(
    question: str,
    context_chunks: List[str],
    model: str = DEFAULT_LLM_MODEL,
    **kwargs
):
    """
    Streaming version for better UX.
    Yields answer chunks as they're generated.
    """
    # Similar setup to generate_answer...
    truncated_chunks, indices_used = truncate_context(context_chunks)
    
    context_parts = []
    for idx, chunk in enumerate(truncated_chunks, 1):
        context_parts.append(f"[Source {idx}]\n{chunk}")
    context = "\n\n".join(context_parts)
    
    system_prompt = "You are an organizational knowledge assistant..."  # Same as above
    user_prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    
    try:
        stream = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            stream=True
        )
        
        full_answer = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_answer += content
                yield content
        
        logger.info(f"Streamed answer of length {len(full_answer)}")
        
    except Exception as e:
        logger.error(f"Streaming error: {str(e)}")
        raise AnswerGenerationError(f"Streaming failed: {str(e)}")