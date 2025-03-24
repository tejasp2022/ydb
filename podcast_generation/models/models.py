from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSON
Base = declarative_base()

class Research(Base):
    __tablename__ = "research"
    id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID, nullable=False) 
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    research = Column(JSON)

class Script(Base):
    __tablename__ = "scripts"
    id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    research_id = Column(UUID, ForeignKey("research.id"))
    script = Column(JSON)

class Podcast(Base):
    __tablename__ = "podcasts"
    id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    script_id = Column(UUID, ForeignKey("scripts.id"))
    user_id = Column(UUID, nullable=False) 
    audio_blob_url = Column(String)

class Interest(Base):
    __tablename__ = "interests"
    id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID, primary_key=True)
    interests = Column(JSON)
