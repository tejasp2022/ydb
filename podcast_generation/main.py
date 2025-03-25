from fastapi import FastAPI, Depends, HTTPException
from supabase_client import supabase_client
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from db_operations import update_user_interests
from generate_podcast.researcher import generate_research
import asyncio

app = FastAPI()

class InterestsRequest(BaseModel):
    interests: list[str]

@app.post("/update-interests")
async def update_interests(request: InterestsRequest, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    try:
        token = credentials.credentials
        print("token: ", token)
        user = supabase_client.auth.get_user(jwt=token)
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_id = user.user.id
        interests = request.interests

        print("interests: ", interests)
    
        result = update_user_interests(user_id, interests)

        # Fire and forget - don't wait for completion
        asyncio.create_task(start_podcast_pipeline(user_id, interests))
        
        return result
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=422, detail=f"Failed to update interests: {str(e)}")

async def start_podcast_pipeline(user_id: str, interests: list[str]):
    await generate_research(user_id, interests)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],            
    allow_headers=["*"],
)
