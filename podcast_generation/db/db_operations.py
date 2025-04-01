from podcast_generation.supabase_client import get_supabase_client
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
        supabase = get_supabase_client()
        result = supabase.table("interests").upsert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update interests in database")
        
        return {"message": "Interests updated successfully", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Research Operations
def add_research_entry_to_db(interests_id: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new research entry for a user.
    
    Args:
        user_id: The ID of the user
        research_content: The content of the research
    Returns:
        Dict containing the created research data
        
    Raises:
        HTTPException: If database operation fails
    """
    data = {
        "interests_id": interests_id,
        "research_data": research_data
    }
    
    try:
        supabase = get_supabase_client()
        result = supabase.table("research").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create research in database")
        
        return {"message": "Research created successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def add_transcript_entry_to_db(research_id: str, transcript_content: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new transcript entry for a research entry.
    
    Args:
        research_id: The ID of the research entry
        transcript_content: The content of the transcript
    Returns:
        Dict containing the created transcript data
        
    Raises:
        HTTPException: If database operation fails
    """
    data = {
        "research_id": research_id,
        "transcript": transcript_content
    }
    
    try:
        supabase = get_supabase_client()
        result = supabase.table("transcripts").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create transcript in database")
        
        return {"message": "Transcript created successfully", "data": result.data[0]}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    
def add_podcast_entry_to_db(transcript_id: str, audio_blob_url: str) -> Dict[str, Any]:
    """
    Create a new podcast entry for a transcript entry.
    
    Args:
        transcript_id: The ID of the transcript entry
        audio_blob_url: The URL of the audio blob
    Returns:
        Dict containing the created podcast data
        
    Raises:
        HTTPException: If database operation fails
    """ 
    data = {    
        "transcript_id": transcript_id,
        "audio_blob_url": audio_blob_url
    }
    
    try:
        supabase = get_supabase_client()
        result = supabase.table("podcasts").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create podcast in database")
        
        return {"message": "Podcast created successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    



