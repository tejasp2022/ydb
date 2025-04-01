from datetime import datetime, UTC
from services.research_service import generate_research_content
from utils.status_utils import update_status
from podcast_generation.supabase_client import get_supabase_async_client
from typing import Dict, Any
from utils.queue import event_queue
from utils.status_utils import StatusType
async def create_research_from_interests(payload: Dict[str, Any]):
    """Async handler for pipeline execution changes"""
    supabase_client = await get_supabase_async_client()
    try:
        print('[Pipeline Handler] Received payload:', payload)
        record = payload.get('data', {}).get('record', {})
        pipeline_id = record.get('id')
        interests_id = record.get('interests_id')
        
        if not interests_id:
            print(f'[Pipeline Handler] No interests_id found in pipeline execution {pipeline_id}')
            return

        print(f'[Pipeline Handler] Processing pipeline execution: {pipeline_id} for interests_id: {interests_id}')
        
        await update_status(pipeline_id, StatusType.RESEARCH_STARTED)
        
        interests_response = await supabase_client.table('interests') \
            .select('interests') \
            .eq('id', interests_id) \
            .order('timestamp', desc=True) \
            .limit(1) \
            .execute()

        if not interests_response.data:
            print(f'[Pipeline Handler] No interests found for id: {interests_id}')
            await update_status(pipeline_id, StatusType.RESEARCH_FAILED)
            return

        interests = interests_response.data[0].get('interests', [])
        print(f'[Pipeline Handler] Retrieved interests: {interests}')

        research_content = await generate_research_content(interests)
        print('[Pipeline Handler] Research content generated')

        research_data = {
            'interests_id': interests_id,
            'research_data': {
                'content': research_content,
                'generated_at': datetime.now(UTC).isoformat(),
                'interests_used': interests
            }
        }

        research_response = await supabase_client.table('research') \
            .insert(research_data) \
            .execute()

        print(f'[Pipeline Handler] Created research entry: {research_response.data[0].get("id")}')

        await supabase_client.table('pipeline_execution') \
            .update({'research_id': research_response.data[0].get('id')}) \
            .eq('id', pipeline_id) \
            .execute()
        
    except Exception as e:
        print(f'[Pipeline Handler] Error processing pipeline execution: {str(e)}')
        await update_status(pipeline_id, StatusType.RESEARCH_FAILED)
        import traceback
        traceback.print_exc()

def handle_pipeline_execution_changes(payload):
    """Queue handler for pipeline execution changes"""
    event_queue.put_nowait(('pipeline', payload))
    print(f"[Pipeline Handler] Queued pipeline execution event: {payload}") 