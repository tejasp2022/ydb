from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv
from models.models_new import User, Interest, UserInterest, Research, Script, Podcast

load_dotenv()

DB_URL = "postgresql://postgres:{password}@{host}:{port}/{database}"

engine = create_engine(
    DB_URL.format(
        password=os.environ.get("SUPABASE_DB_PASSWORD"),
        host=os.environ.get("SUPABASE_DB_HOST"),
        port=os.environ.get("SUPABASE_DB_PORT"),
        database=os.environ.get("SUPABASE_DB_NAME")
    ),
    echo=True  # Logs SQL statements for debugging
)

def ensure_tables():
    SQLModel.metadata.create_all(engine)
    print("Tables ensured.")

if __name__ == "__main__":
    ensure_tables()