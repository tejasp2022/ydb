from sqlalchemy import create_engine, inspect
import os
import importlib
import inspect as py_inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv
from models.models import Base

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

def ensure_tables():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print(f"Existing tables: {', '.join(existing_tables)}")
    
    Base.metadata.create_all(engine)
    
    models_module = importlib.import_module('models.models')
    model_classes = []
    for name, obj in py_inspect.getmembers(models_module):
        if py_inspect.isclass(obj) and hasattr(obj, '__tablename__') and obj.__module__ == 'models.models':
            model_classes.append(obj)
            print(f"Found model: {name}")
    
    new_tables = inspector.get_table_names()
    created_tables = [table for table in new_tables if table not in existing_tables]
    
    if created_tables:
        print(f"Created tables: {', '.join(created_tables)}")
    else:
        print("All tables already exist.")

if __name__ == "__main__":
    ensure_tables()
    
    Session = sessionmaker(bind=engine)
    session = Session()