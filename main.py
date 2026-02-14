import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Warning: GOOGLE_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return JSONResponse(content={"message": "Welcome to StyleSense API. Visit /static/index.html for the interface."})

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Initialize Gemini Model (using gemini-1.5-flash for speed/efficiency or pro for quality)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare content for Gemini
        # Gemini python SDK expects the image data directly in some formats or a PIL image.
        # Check if we need to convert. passing raw bytes usually works with specific mime_type
        
        image_part = {
            "mime_type": file.content_type,
            "data": contents
        }

        prompt = """
        You are a high-end fashion stylist. Analyze this outfit.
        1. Identify the key pieces.
        2. Describe the style (e.g., Casual, Chic, Streetwear).
        3. Rate the color coordination (1-10) and explain why.
        4. Give 3 specific recommendations to improve or accessorize this look.
        
        Format your response in Markdown.
        """

        response = model.generate_content([prompt, image_part])
        
        return {"analysis": response.text}

    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
