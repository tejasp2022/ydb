import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_service_role = os.getenv("SUPABASE_SERVICE_ROLE")
supabase_client = create_client(supabase_url, supabase_service_role)