from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any

class UpdateInterestsRequest(BaseModel):
    interests: list[str]
    
    @field_validator('interests')
    @classmethod
    def validate_interests_not_empty(cls, v):
        if not v:
            raise ValueError('interests list cannot be empty')
        return v 

# Update the webhook record model to match actual record structure
class WebhookRecord(BaseModel):
    id: str
    # Make fields optional to handle different table structures
    user_id: Optional[str] = None
    interests_id: Optional[str] = None
    research_id: Optional[str] = None
    transcript_id: Optional[str] = None
    interests: Optional[Dict[str, Any]] = None
    research_data: Optional[Dict[str, Any]] = None
    transcript: Optional[Dict[str, Any]] = None
    audio_blob_url: Optional[str] = None
    timestamp: Optional[str] = None

class WebhookPayload(BaseModel):
    type: str  # INSERT, UPDATE, etc
    table: str
    schema: str
    record: WebhookRecord
    old_record: Optional[WebhookRecord] = None

class CreateResearchRequest(BaseModel):
    interest_id: str 

class CreateTranscriptRequest(BaseModel):
    research_id: str 

class CreatePodcastRequest(BaseModel):
    transcript_id: str 