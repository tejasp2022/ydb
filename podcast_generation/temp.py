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

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True)

def ensure_tables():
    inspector = inspect(engine)
    
    existing_tables = inspector.get_table_names()
    
    models = Base.__subclasses__()
    
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