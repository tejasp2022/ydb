# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db_session, engine, Base
from models.models import User, Interest, Podcast
from services import interests, podcasts
from pydantic import BaseModel

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

class InterestCreate(BaseModel):
    description: str

@app.post("/users/{user_id}/interests")
def add_interest_to_user(user_id: int, interest: InterestCreate, db: Session = Depends(get_db_session)):
    # Implementation as before
    pass

@app.get("/users/{user_id}/podcasts")
def get_user_podcasts(user_id: int, db: Session = Depends(get_db_session)):
    podcasts = db.query(Podcast).filter(Podcast.user_id == user_id).all()
    return [{"podcast_id": p.podcast_id, "audio_url": p.audio_blob_url} for p in podcasts]

# Add your other API endpoints here