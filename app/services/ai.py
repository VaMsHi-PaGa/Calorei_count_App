import json
import os
import re
from typing import Any

import requests

DEFAULT_ESTIMATE = {
    "calories": 300.0,
    "protein": 10.0,
    "carbs": 35.0,
    "fat": 10.0,
}

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_GENERATE_URL = f"{OLLAMA_URL}/api/generate"
OLLAMA_MODEL = "mistral"
OLLAMA_TIMEOUT_SECONDS = 60


def get_food_nutrition(food_text: str) -> dict[str, float]:
    prompt = f'''Estimate calories and macros for this food:

{food_text}

STRICT RULES:
- Return ONLY valid JSON
- No units like g
- Only numbers
- No extra fields

FORMAT:
{{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}}'''

    try:
        response = requests.post(
            OLLAMA_GENERATE_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
        raw_text = payload["response"]
        print("RAW:", raw_text)
        parsed = _parse_macro_json(raw_text)
        print("PARSED:", parsed)
        return _normalize_estimate(parsed)
    except (requests.RequestException, KeyError, ValueError, TypeError, json.JSONDecodeError):
        return DEFAULT_ESTIMATE.copy()


def estimate_food_macros(food_text: str) -> dict[str, float]:
    return get_food_nutrition(food_text)


def _parse_macro_json(raw_text: str) -> dict[str, Any]:
    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Ollama response did not contain JSON")

    json_text = raw_text[start : end + 1]
    json_text = re.sub(r'(:\s*")(-?\d+(?:\.\d+)?)\s*[a-zA-Z]*\s*(")', r"\1\2\3", json_text)
    json_text = re.sub(r'(:\s*")(-?\d+(?:\.\d+)?)\s+[a-zA-Z]+(?:\s+[a-zA-Z]+)*(")', r": \2", json_text)
    json_text = re.sub(r'(:\s*)(-?\d+(?:\.\d+)?)\s*[a-zA-Z]+\b', r"\1\2", json_text)

    parsed = json.loads(json_text)
    if not isinstance(parsed, dict):
        raise ValueError("Ollama JSON response was not an object")
    return parsed


def _to_float(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        match = re.search(r"-?\d+(?:\.\d+)?", value)
        if match:
            return float(match.group())
    return None


def _normalize_estimate(data: dict[str, Any]) -> dict[str, float]:
    estimate: dict[str, float] = {}

    for key in DEFAULT_ESTIMATE:
        value = _to_float(data.get(key))
        if value is None or value < 0:
            raise ValueError(f"Missing or invalid nutrition value: {key}")
        estimate[key] = value

    return estimate
