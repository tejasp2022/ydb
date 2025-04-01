from datetime import datetime, UTC
from podcast_generation.db.models import StatusType
from podcast_generation.supabase_client import get_supabase_async_client

async def update_status(pipeline_execution_id: str, status: StatusType):
    """Update the status of a pipeline execution."""
    supabase_client = await get_supabase_async_client()
    try:
        status_data = {
            'pipeline_execution_id': pipeline_execution_id,
            'status': status
        }
        await supabase_client.table('status').insert(status_data).execute()
        print(f"[Status] Updated status to {status} for pipeline {pipeline_execution_id}")
    except Exception as e:
        print(f"[Status] Error updating status: {str(e)}")
        raise

async def update_status_by_research_id(research_id: str, status: StatusType):
    """Update the status of a pipeline execution by research_id."""
    supabase_client = await get_supabase_async_client()
    try:
        # First get the pipeline execution ID
        pipeline_response = await supabase_client.table('pipeline_execution') \
            .select('id') \
            .eq('research_id', research_id) \
            .single() \
            .execute()
            
        if not pipeline_response.data:
            print(f"[Status] No pipeline execution found for research {research_id}")
            return
            
        pipeline_id = pipeline_response.data.get('id')
        
        # Then create the status entry
        status_data = {
            'pipeline_execution_id': pipeline_id,
            'status': status
        }
        await supabase_client.table('status').insert(status_data).execute()
        print(f"[Status] Updated status to {status} for research {research_id}")
    except Exception as e:
        print(f"[Status] Error getting pipeline execution id for research {research_id}: {str(e)}")
        raise

async def update_status_by_transcript_id(transcript_id: str, status: StatusType):
    """Update the status of a pipeline execution by transcript_id."""
    supabase_client = await get_supabase_async_client()
    try:
        # First get the pipeline execution ID
        pipeline_response = await supabase_client.table('pipeline_execution') \
            .select('id') \
            .eq('transcript_id', transcript_id) \
            .single() \
            .execute()
            
        if not pipeline_response.data:
            print(f"[Status] No pipeline execution found for transcript {transcript_id}")
            return
            
        pipeline_id = pipeline_response.data.get('id')
        
        # Then create the status entry
        status_data = {
            'pipeline_execution_id': pipeline_id,
            'status': status
        }
        await supabase_client.table('status').insert(status_data).execute()
        print(f"[Status] Updated status to {status} for transcript {transcript_id}")
    except Exception as e:
        print(f"[Status] Error updating status for pipeline {pipeline_id}: {str(e)}")
        raise

# Add other status update functions here... 