from fastapi import FastAPI, Depends, HTTPException, Header, Body, Request
from podcast_generation.supabase_client import get_supabase_client
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from podcast_generation.db.db_operations import update_user_interests
from podcast_generation.api.api_request_models import UpdateInterestsRequest, CreateResearchRequest, CreateTranscriptRequest, CreatePodcastRequest, WebhookPayload
import asyncio
import sys
import hmac
import hashlib
import os
from datetime import datetime

app = FastAPI(root_path="/api")

def validate_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    token = credentials.credentials
    supabase = get_supabase_client()
    user = supabase.auth.get_user(jwt=token)
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return user

def verify_webhook_secret(
    secret: str = Header(..., alias="X-Webhook-Secret")
) -> bool:
    webhook_secret = os.environ.get("SUPABASE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
    
    return secret == webhook_secret

def log_webhook_request(table_name: str, payload: WebhookPayload, success: bool, error_message: str = None):
    try:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "table_name": table_name,
            "payload": {
                "table": payload.table,
                "record": payload.record.dict() if hasattr(payload.record, 'dict') else dict(payload.record),
                "type": payload.type
            },
            "success": success,
            "error_message": error_message
        }
        
        # Insert into webhook_logs table
        supabase = get_supabase_client()
        result = supabase.table("webhook_logs").insert(log_data).execute()
        return result
    except Exception as e:
        print(f"Failed to log webhook request: {str(e)}")
        # We don't want to fail the main request if logging fails
        return None

@app.post("/update-interests")
async def update_interests(request: UpdateInterestsRequest, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    try:
        user = validate_user(credentials)
        user_id = user.user.id
        interests = request.interests
    
        result = update_user_interests(user_id, interests)
        
        return result
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=422, detail=f"Failed to update interests: {str(e)}")

@app.post("/create-research")
async def create_research(
    secret: str = Header(..., alias="X-Webhook-Secret"),
    payload: WebhookPayload = Body(...)
):
    try:
        if not verify_webhook_secret(secret):
            log_webhook_request("interests", payload, False, "Invalid webhook secret")
            raise HTTPException(status_code=401, detail="Invalid webhook secret")
            
        if payload.table != "interests":
            log_webhook_request("interests", payload, False, "Invalid webhook source table")
            raise HTTPException(status_code=400, detail="Invalid webhook source table")
            
        user_id = payload.record.user_id
        interest_id = payload.record.id
        
        # TODO: Add your research creation logic
        # success = create_research_for_interests(user_id, interest_id)
        
        log_webhook_request("interests", payload, True)
        return {"success": True, "message": "Research creation initiated"}
        
    except Exception as e:
        error_message = str(e)
        log_webhook_request("interests", payload, False, error_message)
        print(e)
        raise HTTPException(status_code=422, detail=f"Failed to create research: {error_message}")

@app.post("/create-transcript")
async def create_transcript(
    secret: str = Header(..., alias="X-Webhook-Secret"),
    payload: WebhookPayload = Body(...)
):
    try:
        if not verify_webhook_secret(secret):
            log_webhook_request("research", payload, False, "Invalid webhook secret")
            raise HTTPException(status_code=401, detail="Invalid webhook secret")
            
        if payload.table != "research":
            log_webhook_request("research", payload, False, "Invalid webhook source table")
            raise HTTPException(status_code=400, detail="Invalid webhook source table")
            
        research_id = payload.record.id
        research_data = payload.record.research_data
        
        # TODO: Add transcript creation logic
        # success = create_transcript_for_research(user_id, research_id)
        
        log_webhook_request("research", payload, True)
        return {"success": True, "message": "Transcript creation initiated"}
        
    except Exception as e:
        error_message = str(e)
        log_webhook_request("research", payload, False, error_message)
        print(e)
        raise HTTPException(status_code=422, detail=f"Failed to create transcript: {error_message}")

@app.post("/create-podcast")
async def create_podcast(
    secret: str = Header(..., alias="X-Webhook-Secret"),
    payload: WebhookPayload = Body(...)
):
    try:
        if not verify_webhook_secret(secret):
            log_webhook_request("transcripts", payload, False, "Invalid webhook secret")
            raise HTTPException(status_code=401, detail="Invalid webhook secret")
            
        if payload.table != "transcripts":
            log_webhook_request("transcripts", payload, False, "Invalid webhook source table")
            raise HTTPException(status_code=400, detail="Invalid webhook source table")
            
        transcript_id = payload.record.id
        user_id = payload.record.user_id
        
        # TODO: Add podcast creation logic
        # success = create_podcast_from_transcript(user_id, transcript_id)
        
        log_webhook_request("transcripts", payload, True)
        return {"success": True, "message": "Podcast creation initiated"}
        
    except Exception as e:
        error_message = str(e)
        log_webhook_request("transcripts", payload, False, error_message)
        print(e)
        raise HTTPException(status_code=422, detail=f"Failed to create podcast: {error_message}")

@app.get("/health")
async def health_check():
    pythonpath = os.environ.get("PYTHONPATH")
    return {"status": "ok", "message": "API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ydb-web-git-main-tejas-priyadarshis-projects.vercel.app", "https://yourdailybriefing.io", "https://www.yourdailybriefing.io"],
    allow_credentials=True,
    allow_methods=["*"],            
    allow_headers=["*"],
)