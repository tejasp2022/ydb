# models/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

# Create Base - it's important this is the same Base used throughout the application
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    google_sso_id = Column(String)
    rss_feed_url = Column(String)
    interests = Column(ARRAY(String)) 

# class Interest(Base):
#     __tablename__ = "interests"
#     interest_id = Column(Integer, primary_key=True)
#     description = Column(String)

# class UserInterest(Base):
#     __tablename__ = "user_interests"
#     user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
#     interest_id = Column(Integer, ForeignKey("interests.interest_id"), primary_key=True)

class Research(Base):
    __tablename__ = "research"
    research_id = Column(Integer, primary_key=True)
    # interest_id = Column(Integer, ForeignKey("interests.interest_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Script(Base):
    __tablename__ = "scripts"
    script_id = Column(Integer, primary_key=True)
    research_id = Column(Integer, ForeignKey("research.research_id"))
    script_text = Column(Text)

class Podcast(Base):
    __tablename__ = "podcasts"
    podcast_id = Column(Integer, primary_key=True)
    script_id = Column(Integer, ForeignKey("scripts.script_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    audio_blob_url = Column(String)