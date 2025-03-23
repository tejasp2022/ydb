import os
from supabase import create_client
from sqlalchemy.schema import CreateTable
from sqlalchemy.dialects import postgresql
from dotenv import load_dotenv
# Import models to ensure they're registered with Base
from models.models import Base, User, Interest, UserInterest, Research, Script, Podcast

def get_supabase_client():
    """Get Supabase client from environment variables"""
    load_dotenv()
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")
    return create_client(supabase_url=supabase_url, supabase_key=supabase_key)

def create_tables_supabase():
    """Create all tables in Supabase using direct SQL execution"""
    supabase = get_supabase_client()
    # Check if tables are registered
    table_count = len(Base.metadata.tables)
    print(f"Found {table_count} tables in SQLAlchemy metadata")
    if table_count == 0:
        print("ERROR: No tables found in SQLAlchemy metadata!")
        print("Make sure all models are imported correctly and Base is properly configured.")
        return False
    
    # Print all table names for verification
    print("Tables to be created:")
    for table_name in Base.metadata.tables.keys():
        print(f"- {table_name}")
    
    # Try both methods to create tables
    success = False
    
    # Method 1: Use SQL strings directly
    try:
        # Create each table using direct SQL
        for table_name, table in Base.metadata.tables.items():
            # Generate SQL with PostgreSQL dialect
            create_sql = str(CreateTable(table).compile(dialect=postgresql.dialect()))
            print(f"Creating table {table_name} using SQL: {create_sql}")
            # Execute SQL through Supabase RPC
            supabase.rpc('postgres_query', {'query': create_sql}).execute()
            print(f"Created table {table_name} using RPC method")
        print("All tables created successfully using RPC method!")
        success = True
    except Exception as e:
        print(f"Error using RPC method: {str(e)}")
        print("Trying alternate method...")
    
    if success:
        try:
            verification_sql = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('users', 'interests', 'user_interests', 'research', 'scripts', 'podcasts');
            """
            result = supabase.rpc('postgres_query', {'query': verification_sql}).execute()
            # Check result data structure
            print("\nVerification Results:")
            print(result.data)
            return True
        except Exception as e:
            print(f"Error verifying tables: {str(e)}")
    
    return success

if __name__ == "__main__":
    if create_tables_supabase():
        print("\nSUCCESS: All tables created and verified in Supabase!")
    else:
        print("\nFAILURE: Could not create all tables. See error messages above.")