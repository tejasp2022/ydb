from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any, Union, Literal

class UpdateInterestsRequest(BaseModel):
    interests: list[str]
    
    @field_validator('interests')
    @classmethod
    def validate_interests_not_empty(cls, v):
        if not v:
            raise ValueError('interests list cannot be empty')
        return v 

# Base record with common fields
class BaseWebhookRecord(BaseModel):
    id: str
    timestamp: Optional[str] = None

class InterestsRecord(BaseWebhookRecord):
    user_id: str
    interests: Dict[str, Any]

class ResearchRecord(BaseWebhookRecord):
    interests_id: str
    research_data: Dict[str, Any]

class TranscriptRecord(BaseWebhookRecord):
    research_id: str
    transcript: Dict[str, Any]

class PodcastRecord(BaseWebhookRecord):
    transcript_id: str
    audio_blob_url: str

class PipelineExecutionRecord(BaseWebhookRecord):
    user_id: str
    interests_id: str
    research_id: Optional[str] = None
    transcript_id: Optional[str] = None
    podcast_id: Optional[str] = None

# Define the webhook payload with discriminated unions
class WebhookPayload(BaseModel):
    type: str  # INSERT, UPDATE, etc
    table: Literal["interests", "research", "transcripts", "podcasts", "pipeline_execution"]
    schema: str
    record: Union[InterestsRecord, ResearchRecord, TranscriptRecord, PodcastRecord, PipelineExecutionRecord]
    old_record: Optional[Union[InterestsRecord, ResearchRecord, TranscriptRecord, PodcastRecord, PipelineExecutionRecord]] = None

    @field_validator('record', 'old_record')
    @classmethod
    def validate_record_type(cls, v, info):
        # Get the table name from the parent data
        table = info.data.get('table')
        if v is None:
            return v
            
        record_type_map = {
            "interests": InterestsRecord,
            "research": ResearchRecord,
            "transcripts": TranscriptRecord,
            "podcasts": PodcastRecord,
            "pipeline_execution": PipelineExecutionRecord
        }
        
        expected_type = record_type_map.get(table)
        if not isinstance(v, expected_type):
            raise ValueError(f"Record type mismatch. Expected {expected_type.__name__} for table {table}")
        return v

class CreateResearchRequest(BaseModel):
    interest_id: str 

class CreateTranscriptRequest(BaseModel):
    research_id: str 

class CreatePodcastRequest(BaseModel):
    transcript_id: str 