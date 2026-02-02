import json

def extract_json(text: str) -> dict:
    if not text:
        raise RuntimeError("Empty LLM response")

    cleaned = text.strip()

    # ```json ... ``` 제거
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "")
        cleaned = cleaned.replace("```", "")
        cleaned = cleaned.strip()

    return json.loads(cleaned)