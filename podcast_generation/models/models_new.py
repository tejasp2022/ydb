from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from pydantic import root_validator

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    user_id: Optional[int] = Field(default=None, primary_key=True)
    google_sso_id: Optional[str] = Field(default=None, index=True)  # Adding an index for better performance on queries
    rss_feed_url: Optional[str] = None
    interests: Optional[List[str]] = []  # Enforcing a list of interests, default is an empty list

    # Custom validation logic for fields like interests
    @root_validator(pre=True)
    def check_interests(cls, values):
        interests = values.get("interests")
        if interests and not isinstance(interests, list):
            raise ValueError('The "interests" field must be a list of strings.')
        return values

class Interest(SQLModel, table=True):
    __tablename__ = "interests"

    interest_id: Optional[int] = Field(default=None, primary_key=True)
    description: str = Field(..., min_length=1)  # Ensure description is not empty

    @root_validator(pre=True)
    def check_description(cls, values):
        description = values.get('description')
        if not description or len(description.strip()) == 0:
            raise ValueError('The "description" field cannot be empty.')
        return values

class UserInterest(SQLModel, table=True):
    __tablename__ = "user_interests"

    user_id: int = Field(foreign_key="users.user_id", primary_key=True)
    interest_id: int = Field(foreign_key="interests.interest_id", primary_key=True)

class Research(SQLModel, table=True):
    __tablename__ = "research"

    research_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.user_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    @root_validator(pre=True)
    def check_user_id(cls, values):
        user_id = values.get("user_id")
        if not user_id:
            raise ValueError('The "user_id" field cannot be null or missing.')
        return values

class Script(SQLModel, table=True):
    __tablename__ = "scripts"

    script_id: Optional[int] = Field(default=None, primary_key=True)
    research_id: int = Field(foreign_key="research.research_id")
    script_text: str = Field(default="")

    @root_validator(pre=True)
    def check_script_text(cls, values):
        script_text = values.get("script_text")
        if not script_text or len(script_text.strip()) == 0:
            raise ValueError('The "script_text" field cannot be empty.')
        return values

class Podcast(SQLModel, table=True):
    __tablename__ = "podcasts"

    podcast_id: Optional[int] = Field(default=None, primary_key=True)
    script_id: int = Field(foreign_key="scripts.script_id")
    user_id: int = Field(foreign_key="users.user_id")
    audio_blob_url: str = Field(default="")

    @root_validator(pre=True)
    def check_audio_blob_url(cls, values):
        audio_blob_url = values.get("audio_blob_url")
        if not audio_blob_url or len(audio_blob_url.strip()) == 0:
            raise ValueError('The "audio_blob_url" field cannot be empty.')
        return values
