from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import uvicorn
import json

app = FastAPI(title="Ollama Web Interface API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request model
class PromptRequest(BaseModel):
    model: str
    prompt: str

@app.get("/health")
async def health_check():
    try:
        # Check if Ollama is reachable
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                return {"status": "healthy", "ollama_connected": True}
            return {"status": "healthy", "ollama_connected": False}
    except:
        return {"status": "healthy", "ollama_connected": False}

@app.get("/api/models")
async def list_models():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error from Ollama API")
            
            data = response.json()
            # Format the models list
            models = [{"id": model["name"], "name": model["name"]} for model in data.get("models", [])]
            return {"models": models}
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to Ollama: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/api/generate")
async def generate_response(request: PromptRequest):
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": request.model, "prompt": request.prompt}
            )
            
            print(f"Ollama API response: {response.text}")  # Log the raw response
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error from Ollama API")
            
            # Process the streaming response
            full_response = []
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        full_response.append(data['response'])  # Collect the response parts
                        if data.get('done'):
                            break  # Stop if the response is complete
                    except json.JSONDecodeError:
                        continue  # Ignore lines that cannot be parsed
            
            # Join the collected responses into a single string
            final_response = ''.join(full_response)
            return {"response": final_response}
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to Ollama: {str(e)}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")  # Log the error
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Add streaming endpoint for real-time responses
from fastapi.responses import StreamingResponse

@app.post("/api/generate/stream")
async def generate_stream(request: PromptRequest):
    async def stream_response():
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    "http://localhost:11434/api/generate",
                    json={"model": request.model, "prompt": request.prompt, "stream": True},
                    timeout=60.0
                ) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': 'Error from Ollama API'})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                yield f"data: {json.dumps({'response': data.get('response', '')})}\n\n"
                            except json.JSONDecodeError:
                                continue
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream"
    )

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = contents.decode('utf-8')  # Decode the bytes to string
        # You can now process the text as needed
        return {"filename": file.filename, "content": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)