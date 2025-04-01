import os
import importlib
import inspect as py_inspect
import sys
import psycopg2
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv
from podcast_generation.db.models import Base

load_dotenv()

# Get database connection details from environment variables once
DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD")
DB_HOST = os.environ.get("SUPABASE_DB_HOST")
DB_PORT = os.environ.get("SUPABASE_DB_PORT")
DB_NAME = os.environ.get("SUPABASE_DB_NAME")

# SQLAlchemy database URL
DB_URL = "postgresql://postgres:{password}@{host}:{port}/{database}"
SQLALCHEMY_URL = DB_URL.format(
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME
)

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_URL)

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

def apply_triggers():
    """Apply SQL triggers to the database from the triggers.sql file."""
    
    conn = None
    cursor = None
    try:
        connection_string = f"dbname={DB_NAME} user=postgres password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
        conn = psycopg2.connect(connection_string)
        conn.autocommit = True
        cursor = conn.cursor()
            
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sql_file_path = os.path.join(script_dir, 'db', 'triggers.sql')
        
        with open(sql_file_path, 'r') as file:
            sql_script = file.read()
        
        cursor.execute(sql_script)
        print("Database triggers successfully applied!")
        
    except psycopg2.Error as e:
        print(f"Database error applying triggers: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error applying triggers: {e}")
        sys.exit(1)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    ensure_tables()
    apply_triggers()
    
    Session = sessionmaker(bind=engine)
    session = Session()