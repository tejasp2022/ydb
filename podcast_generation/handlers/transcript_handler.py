from datetime import datetime, UTC
from services.tts_service import generate_audio_for_transcript, upload_audio_to_storage
from utils.status_utils import update_status_by_transcript_id
from podcast_generation.supabase_client import get_supabase_async_client
from typing import Dict, Any
from utils.queue import event_queue
from utils.status_utils import StatusType

async def create_podcast_entry(transcript_id: str, audio_url: str) -> Dict:
    """Create a new podcast entry in the database."""
    supabase_client = await get_supabase_async_client()
    podcast_data = {
        'transcript_id': transcript_id,
        'audio_blob_url': audio_url
    }

    try:
        podcast_response = await supabase_client.table('podcasts') \
            .insert(podcast_data) \
            .execute()
        
        if podcast_response.data:
            print(f"[Transcript Handler] Created podcast entry: {podcast_response.data[0].get('id')}")
            return podcast_response.data[0]
        else:
            print("[Transcript Handler] No data returned from podcast creation")
            return None
    except Exception as e:
        print(f"[Transcript Handler] Error creating podcast entry: {str(e)}")
        raise

async def create_podcast_from_transcript(payload: Dict[str, Any]):
    """Async handler for transcript changes"""
    try:
        record = payload.get('data', {}).get('record', {})
        transcript_id = record.get('id')
        transcript_data = record.get('transcript', {})
        transcript_content = transcript_data.get('content')
        
        print(f'[Transcript Handler] Processing transcript: {transcript_id}')
        
        if not transcript_content:
            print('[Transcript Handler] No transcript content found')
            return
            
        await update_status_by_transcript_id(transcript_id, StatusType.PODCAST_STARTED)
            
        try:
            audio_data = await generate_audio_for_transcript(transcript_content, transcript_id)
            
            audio_url = None
            
            if 'audio_content' in audio_data:
                try:
                    audio_url = await upload_audio_to_storage(audio_data['audio_content'], transcript_id)
                    print(f"[Transcript Handler] Successfully uploaded audio to storage: {audio_url}")
                except Exception as e:
                    print(f"[Transcript Handler] Failed to upload audio to storage: {str(e)}")
                    await update_status_by_transcript_id(transcript_id, StatusType.PODCAST_FAILED)
                    raise
            else:
                audio_url = audio_data['audio_uri']
            
            if audio_url:
                podcast_entry = await create_podcast_entry(transcript_id, audio_url)
                if podcast_entry:
                    print(f'[Transcript Handler] Generated and stored audio for transcript: {transcript_id}')
                else:
                    print(f'[Transcript Handler] Failed to create podcast entry for transcript: {transcript_id}')
                    await update_status_by_transcript_id(transcript_id, StatusType.PODCAST_FAILED)
            else:
                print('[Transcript Handler] No audio URL available for podcast creation')
                await update_status_by_transcript_id(transcript_id, StatusType.PODCAST_FAILED)
            
        except Exception as e:
            print(f'[Transcript Handler] Error generating audio: {str(e)}')
            await update_status_by_transcript_id(transcript_id, StatusType.PODCAST_FAILED)
            raise
            
    except Exception as e:
        print(f'[Transcript Handler] Error processing transcript: {str(e)}')
        import traceback
        traceback.print_exc()

def handle_transcript_changes(payload):
    """Queue handler for transcript changes"""
    event_queue.put_nowait(('transcript', payload))
    print(f"[Transcript Handler] Queued transcript event: {payload}") 