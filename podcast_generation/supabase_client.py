import os
from typing import Optional, Tuple
from supabase import create_client, create_async_client
from dotenv import load_dotenv

load_dotenv()

_supabase_sync_client = None
_supabase_async_client = None

def _get_supabase_config() -> Tuple[str, str]:
    """Get Supabase configuration from environment variables"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE")
    
    if not supabase_url:
        raise EnvironmentError("Missing SUPABASE_URL environment variable")
    if not supabase_key:
        raise EnvironmentError("Missing SUPABASE_SERVICE_ROLE environment variable")
        
    return supabase_url, supabase_key

def get_supabase_client():
    """Get or initialize the synchronous Supabase client"""
    global _supabase_sync_client
    
    if _supabase_sync_client is None:
        supabase_url, supabase_key = _get_supabase_config()
        _supabase_sync_client = create_client(supabase_url, supabase_key)
        
    return _supabase_sync_client

async def get_supabase_async_client():
    """Get or initialize the asynchronous Supabase client"""
    global _supabase_async_client
    
    if _supabase_async_client is None:
        supabase_url, supabase_key = _get_supabase_config()
        _supabase_async_client = await create_async_client(supabase_url, supabase_key)
        
    return _supabase_async_client