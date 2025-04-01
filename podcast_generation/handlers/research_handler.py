from datetime import datetime, UTC
from services.transcript_service import generate_transcript_from_research
from utils.status_utils import update_status_by_research_id
from podcast_generation.supabase_client import get_supabase_async_client
from typing import Dict, Any
from utils.queue import event_queue
from utils.status_utils import StatusType

async def create_transcript_from_research(payload: Dict[str, Any]):
    """Async handler for research changes"""
    supabase_client = await get_supabase_async_client()
    try:
        if isinstance(payload, dict):
            record = payload.get('data', {}).get('record', {})
            research_id = record.get('id')
            research_data = record.get('research_data', {})
            
            print(f'[Research Handler] Processing research: {research_id}')
            
            # Get pipeline execution ID
            pipeline_response = await supabase_client.table('pipeline_execution') \
                .select('id') \
                .eq('research_id', research_id) \
                .single() \
                .execute()
                
            if not pipeline_response.data:
                print(f'[Research Handler] No pipeline execution found for research {research_id}')
                return
                
            await update_status_by_research_id(research_id, StatusType.TRANSCRIPT_STARTED)
            
            try:
                research_content = research_data.get('content')
                if not research_content:
                    print('[Research Handler] No research content found')
                    await update_status_by_research_id(research_id, StatusType.TRANSCRIPT_FAILED)
                    return
                    
                transcript_content = await generate_transcript_from_research(research_content)
                
                transcript_data = {
                    'research_id': research_id,
                    'transcript': {
                        'content': transcript_content,
                        'generated_at': datetime.now(UTC).isoformat()
                    }
                }
                
                transcript_response = await supabase_client.table('transcripts') \
                    .insert(transcript_data) \
                    .execute()
                
                print(f"[Research Handler] Created transcript entry: {transcript_response.data[0].get('id')}")
                
            except Exception as e:
                print(f'[Research Handler] Error generating transcript: {str(e)}')
                await update_status_by_research_id(research_id, StatusType.TRANSCRIPT_FAILED)
                raise
            
    except Exception as e:
        print(f'[Research Handler] Error processing research: {str(e)}')
        import traceback
        traceback.print_exc()

def handle_research_changes(payload):
    """Queue handler for research changes"""
    event_queue.put_nowait(('research', payload))
    print(f"[Research Handler] Queued research event: {payload}") 