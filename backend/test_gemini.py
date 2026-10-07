import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print("API Key loaded:", api_key[:10] + "..." if api_key else "None")

genai.configure(api_key=api_key)

try:
    print("Testing gemini-3.6-flash...")
    model = genai.GenerativeModel("gemini-3.6-flash")
    resp = model.generate_content("Say hello")
    print("Success with gemini-3.6-flash:", resp.text)
except Exception as e:
    print("Failed with gemini-3.6-flash:", e)

try:
    print("Testing gemini-3.1-flash-lite...")
    model = genai.GenerativeModel("gemini-3.1-flash-lite")
    resp = model.generate_content("Say hello")
    print("Success with gemini-3.1-flash-lite:", resp.text)
except Exception as e:
    print("Failed with gemini-3.1-flash-lite:", e)
