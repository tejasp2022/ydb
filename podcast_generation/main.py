import asyncio
import sys
import traceback
from typing import Dict, Any

from handlers.pipeline_handler import handle_pipeline_execution_changes, create_research_from_interests
from handlers.research_handler import handle_research_changes, create_transcript_from_research
from handlers.transcript_handler import handle_transcript_changes, create_podcast_from_transcript
from utils.config import PIPELINE_TABLE, RESEARCH_TABLE, TRANSCRIPT_TABLE
from utils.queue import event_queue
from podcast_generation.supabase_client import get_supabase_async_client

async def process_event_queue():
    """Process events from the queue concurrently"""
    while True:
        try:
            event_type, payload = await event_queue.get()
            print(f"[Event Queue] Processing {event_type} event")
            
            if event_type == 'pipeline':
                asyncio.create_task(create_research_from_interests(payload))
            elif event_type == 'research':
                asyncio.create_task(create_transcript_from_research(payload))
            elif event_type == 'transcript':
                asyncio.create_task(create_podcast_from_transcript(payload))
            
            event_queue.task_done()
            
        except Exception as e:
            print(f"[Event Queue] Error processing event: {str(e)}")
            traceback.print_exc()

async def setup_and_run_listeners():
    """Setup and run realtime listeners"""
    try:
        supabase_client = await get_supabase_async_client()
        
        print("[System] Setting up listeners...")
        
        # Start the event queue processor
        asyncio.create_task(process_event_queue())
        
        # Setup database change listeners
        pipeline_channel = supabase_client.channel('pipeline-changes')
        research_channel = supabase_client.channel('research-changes')
        transcript_channel = supabase_client.channel('transcript-changes')

        pipeline_changes = await pipeline_channel.on_postgres_changes(
            event="INSERT",
            schema="public",
            table=PIPELINE_TABLE,
            callback=handle_pipeline_execution_changes
        ).subscribe()

        research_changes = await research_channel.on_postgres_changes(
            event="INSERT",
            schema="public",
            table=RESEARCH_TABLE,
            callback=handle_research_changes
        ).subscribe()

        transcript_changes = await transcript_channel.on_postgres_changes(
            event="INSERT",
            schema="public",
            table=TRANSCRIPT_TABLE,
            callback=handle_transcript_changes
        ).subscribe()

        print("[System] Realtime listeners setup successfully")
        print(f"[System] Listening for changes on tables: {RESEARCH_TABLE}, {PIPELINE_TABLE}, {TRANSCRIPT_TABLE}")
        
        # Keep the application running
        while True:
            await asyncio.sleep(10)
            
    except Exception as e:
        print(f"[System] Error setting up realtime listeners: {str(e)}")
        traceback.print_exc()
        sys.exit(1)
    finally:
        # Cleanup listeners on shutdown
        if 'pipeline_changes' in locals():
            await pipeline_changes.unsubscribe()
        if 'research_changes' in locals():
            await research_changes.unsubscribe()
        if 'transcript_changes' in locals():
            await transcript_changes.unsubscribe()
        print("[System] Unsubscribed from database changes")

if __name__ == "__main__":
    try:
        asyncio.run(setup_and_run_listeners())
    except KeyboardInterrupt:
        print("\nShutting down listeners...")
        sys.exit(0) 