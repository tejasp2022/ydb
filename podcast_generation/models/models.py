from sqlalchemy import Column, ForeignKey, DateTime, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID, JSON, TEXT

Base = declarative_base()

class Interest(Base):
    __tablename__ = "interests"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    user_id = Column(UUID)
    interests = Column(JSON)

class Research(Base):
    __tablename__ = "research"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    user_id = Column(UUID, nullable=False)
    interest_id = Column(UUID, ForeignKey("interests.id"), nullable=True)
    research = Column(JSON)

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    research_id = Column(UUID, ForeignKey("research.id"))
    transcript = Column(JSON)

class Podcast(Base):
    __tablename__ = "podcasts"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    transcript_id = Column(UUID, ForeignKey("transcripts.id"))
    user_id = Column(UUID, nullable=False) 
    audio_blob_url = Column(TEXT)
