from sqlalchemy import Column, ForeignKey, DateTime, text, Enum, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID, JSON, TEXT
import enum

Base = declarative_base()

class StatusType(Enum):
    EXECUTION_STARTED = "execution_started"
    RESEARCH_STARTED = "research_started"
    RESEARCH_COMPLETED = "research_completed"
    RESEARCH_FAILED = "research_failed"
    TRANSCRIPT_STARTED = "transcript_started"
    TRANSCRIPT_COMPLETED = "transcript_completed"
    TRANSCRIPT_FAILED = "transcript_failed"
    PODCAST_STARTED = "podcast_started"
    PODCAST_COMPLETED = "podcast_completed"
    PODCAST_FAILED = "podcast_failed"
    EXECUTION_COMPLETED = "execution_completed"
    EXECUTION_FAILED = "execution_failed"
    EXECUTION_CANCELLED = "execution_cancelled"

class PipelineExecution(Base):
    __tablename__ = "pipeline_execution"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    user_id = Column(UUID, nullable=False, index=True)
    interests_id = Column(UUID, ForeignKey("interests.id"), nullable=False)
    research_id = Column(UUID, ForeignKey("research.id"), nullable=True)
    transcript_id = Column(UUID, ForeignKey("transcripts.id"), nullable=True)
    podcast_id = Column(UUID, ForeignKey("podcasts.id"), nullable=True)

class Status(Base):
    __tablename__ = "status"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    pipeline_execution_id = Column(UUID, ForeignKey("pipeline_execution.id"), nullable=False)
    status = Column(TEXT, nullable=False)
    # TODO Add retries

class Interests(Base):
    __tablename__ = "interests"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    user_id = Column(UUID, nullable=False)
    interests = Column(JSON, nullable=False)

class Research(Base):
    __tablename__ = "research"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    interests_id = Column(UUID, ForeignKey("interests.id"), nullable=False)
    research_data = Column(JSON, nullable=False)

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    research_id = Column(UUID, ForeignKey("research.id"), nullable=False)
    transcript = Column(JSON, nullable=False)

class Podcast(Base):
    __tablename__ = "podcasts"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    transcript_id = Column(UUID, ForeignKey("transcripts.id"), nullable=False)
    audio_blob_url = Column(TEXT, nullable=False)

class WebhookLogs(Base):
    __tablename__ = "webhook_logs"
    id = Column(UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    timestamp = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    table_name = Column(TEXT, nullable=False)
    payload = Column(JSON, nullable=False)
    success = Column(Boolean, nullable=False)
    error_message = Column(TEXT, nullable=True)
