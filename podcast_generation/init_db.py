# init_db.py
# from database import engine, Base
# from models.models import User, Interest, UserInterest, Research, Script, Podcast
from models.models import User, Research, Script, Podcast
import os
from sqlalchemy import create_engine, Column, Integer, String, MetaData, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_URL = "postgresql://postgres:{password}@{host}:{port}/{database}"

engine = create_engine(
    DB_URL.format(
        password=os.environ.get("SUPABASE_DB_PASSWORD"),
        host=os.environ.get("SUPABASE_DB_HOST"),
        port=os.environ.get("SUPABASE_DB_PORT"),
        database=os.environ.get("SUPABASE_DB_NAME")
    )
)

Base = declarative_base()

def ensure_tables():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    # models = [User, Interest, UserInterest, Research, Script, Podcast]
    models = [User, Research, Script, Podcast]
    created_tables = []
    
    for model in models:
        if model.__tablename__ not in existing_tables:
            model.__table__.create(engine)
            created_tables.append(model.__tablename__)
    
    if created_tables:
        print(f"Created tables: {', '.join(created_tables)}")
    else:
        print("All tables already exist.")

if __name__ == "__main__":
    print('hello')
    ensure_tables()
    
    Session = sessionmaker(bind=engine)
    session = Session()

if __name__ == "__main__":
    ensure_tables()