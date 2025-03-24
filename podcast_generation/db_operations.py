from supabase_client import supabase_client
from fastapi import HTTPException
from typing import List, Dict, Any, Optional

# User Interests Operations
def update_user_interests(user_id: str, interests: List[str]) -> Dict[str, Any]:
    """
    Update a user's interests in the database.
    
    Args:
        user_id: The ID of the user
        interests: List of interest strings
        
    Returns:
        Dict containing success message and data
        
    Raises:
        HTTPException: If database operation fails
    """
    if not interests:
        raise HTTPException(status_code=400, detail="Interests list cannot be empty")
    
    data = {
        "user_id": user_id,
        "interests": interests
    }
    
    try:
        result = supabase_client.table("user_interests").upsert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update interests in database")
        
        return {"message": "Interests updated successfully", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Research Operations
def create_research(user_id: str) -> Dict[str, Any]:
    """
    Create a new research entry for a user.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        Dict containing the created research data
        
    Raises:
        HTTPException: If database operation fails
    """
    data = {
        "user_id": user_id
    }
    
    try:
        result = supabase_client.table("research").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create research in database")
        
        return {"message": "Research created successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_research(research_id: int) -> Dict[str, Any]:
    """
    Get a research entry by ID.
    
    Args:
        research_id: The ID of the research
        
    Returns:
        Dict containing the research data
        
    Raises:
        HTTPException: If research not found or database operation fails
    """
    try:
        result = supabase_client.table("research").select("*").eq("research_id", research_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Research with ID {research_id} not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_user_research(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all research entries for a user.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        List of dicts containing the research data
        
    Raises:
        HTTPException: If database operation fails
    """
    try:
        result = supabase_client.table("research").select("*").eq("user_id", user_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Script Operations
def create_script(research_id: int, script_text: str) -> Dict[str, Any]:
    """
    Create a new script for a research entry.
    
    Args:
        research_id: The ID of the research
        script_text: The text content of the script
        
    Returns:
        Dict containing the created script data
        
    Raises:
        HTTPException: If database operation fails
    """
    data = {
        "research_id": research_id,
        "script_text": script_text
    }
    
    try:
        result = supabase_client.table("scripts").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create script in database")
        
        return {"message": "Script created successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_script(script_id: int) -> Dict[str, Any]:
    """
    Get a script by ID.
    
    Args:
        script_id: The ID of the script
        
    Returns:
        Dict containing the script data
        
    Raises:
        HTTPException: If script not found or database operation fails
    """
    try:
        result = supabase_client.table("scripts").select("*").eq("script_id", script_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Script with ID {script_id} not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_scripts_by_research(research_id: int) -> List[Dict[str, Any]]:
    """
    Get all scripts for a research entry.
    
    Args:
        research_id: The ID of the research
        
    Returns:
        List of dicts containing the script data
        
    Raises:
        HTTPException: If database operation fails
    """
    try:
        result = supabase_client.table("scripts").select("*").eq("research_id", research_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Podcast Operations
def create_podcast(script_id: int, user_id: str, audio_blob_url: str) -> Dict[str, Any]:
    """
    Create a new podcast entry.
    
    Args:
        script_id: The ID of the script
        user_id: The ID of the user
        audio_blob_url: URL to the audio blob
        
    Returns:
        Dict containing the created podcast data
        
    Raises:
        HTTPException: If database operation fails
    """
    data = {
        "script_id": script_id,
        "user_id": user_id,
        "audio_blob_url": audio_blob_url
    }
    
    try:
        result = supabase_client.table("podcasts").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create podcast in database")
        
        return {"message": "Podcast created successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_user_podcasts(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all podcasts for a user.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        List of dicts containing the podcast data
        
    Raises:
        HTTPException: If database operation fails
    """
    try:
        result = supabase_client.table("podcasts").select("*").eq("user_id", user_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
