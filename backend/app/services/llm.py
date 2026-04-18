from groq import Groq
from app.config import GROQ_API_KEY, LLM_MODEL

_client = Groq(api_key=GROQ_API_KEY)


SYSTEM_PROMPT = """You are a helpful document Q&A assistant.

Rules you must follow:
1. Answer ONLY based on the provided context sections below.
2. If the context does not contain enough information to answer, say exactly:
   "I don't know based on the provided documents."
3. Always cite the page number and filename when you use information from a chunk.
4. Format the answer in clear bullet points.
5. Each bullet point should be concise and informative.
6. Do NOT write long paragraphs.
7. Do NOT make up or infer information beyond what is in the context."""


def generate_answer(query: str, context_chunks: list[dict]) -> str:
    """
    Send retrieved chunks + user query to the LLM and return the generated answer.
    """
    if not context_chunks:
       return "I don't know based on the provided documents."
    context_sections = "\n\n".join([
        f"[Source: {c['metadata']['filename']} | Page {c['metadata']['page']}]\n{c['text']}"
        for c in context_chunks
    ])

    user_message = f"""Context:
{context_sections}

---
Question: {query}

Answer in bullet points using only the context. Each point must include source citation:"""

    response = _client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message}
        ],
        temperature=0.2,   
        max_tokens=1024,
    )

    return response.choices[0].message.content.strip()