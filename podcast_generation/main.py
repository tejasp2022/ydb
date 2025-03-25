from fastapi import FastAPI, Depends, HTTPException
from podcast_generation.supabase_client import supabase_client
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from podcast_generation.db_operations import update_user_interests
from podcast_generation.generate_podcast.researcher import generate_research
import asyncio
import sys

print("Python version:", sys.version)
print("Starting FastAPI application...")

app = FastAPI()

class InterestsRequest(BaseModel):
    interests: list[str]

@app.post("/update-interests")
async def update_interests(request: InterestsRequest, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    try:
        token = credentials.credentials
        user = supabase_client.auth.get_user(jwt=token)
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_id = user.user.id
        interests = request.interests
    
        result = update_user_interests(user_id, interests)

        # Fire and forget - don't wait for completion
        asyncio.create_task(start_podcast_pipeline(user_id, interests))
        
        return result
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=422, detail=f"Failed to update interests: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is running"}

async def start_podcast_pipeline(user_id: str, interests: list[str]):
    await generate_research(user_id, interests)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ydb-web-git-main-tejas-priyadarshis-projects.vercel.app", "https://yourdailybriefing.io", "https://www.yourdailybriefing.io"],
    allow_credentials=True,
    allow_methods=["*"],            
    allow_headers=["*"],
)