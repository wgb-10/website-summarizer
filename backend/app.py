import os
from google import genai
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Initialize the Flask App ---
app = Flask(__name__)
# Enable CORS for requests from our frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# --- Configure the Gemini API ---
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    client = None


# --- API Route for Summarization ---
@app.route("/api/summarize", methods=["POST"])
def summarize():
    if not client:
        return jsonify({"error": "Gemini API not configured"}), 500

    # Get URL from the request body
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        # 1. Fetch Webpage Content
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes

        # 2. Extract Text using BeautifulSoup
        soup = BeautifulSoup(response.content, "html.parser")

        # Remove script and style elements
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()

        # Get text and clean it up
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        page_text = "\n".join(chunk for chunk in chunks if chunk)

        if not page_text:
            return jsonify({"error": "Could not extract text from the webpage."}), 400

        # 3. Generate Summary with Gemini
        prompt = f"Please provide a concise summary of the following webpage content:\n\n{page_text}"

        # Call the Gemini API
        gemini_response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )
        summary = gemini_response.text

        # 4. Return the Summary
        return jsonify({"summary": summary})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch URL: {e}"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


# --- Run the App ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)
