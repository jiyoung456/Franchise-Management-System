import os
from dotenv import load_dotenv
import google.generativeai as genai


# .env는 여기서 한 번만 로드
# uvicorn reload / windows spawn 대응
load_dotenv()



def get_gemini_api():

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY environment variable is not set")

    genai.configure(api_key=api_key)


def get_gemini_model() :
    return genai.GenerativeModel("gemini-2.5-flash")


def get_model_name():
    model_name = os.getenv("GEMINI_MODEL_NAME")
    if not model_name:
        raise RuntimeError("GEMINI_MODEL_NAME")

    return model_name


def get_prompt_version():
    model_name = os.getenv("PROMPT_VERSION")
    if not model_name:
        raise RuntimeError("PROMPT_VERSION")

    return model_name
