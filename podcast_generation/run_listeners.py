import asyncio
import json
import os
import pathlib
import sys
import time
from asyncio import Queue
from datetime import datetime, UTC
import traceback
from typing import Dict, Any

from dotenv import load_dotenv
from google.auth import default
from google.cloud import texttospeech, texttospeech_v1beta1
from google.oauth2 import service_account
from openai import OpenAI

from podcast_generation.models.models import StatusType
from podcast_generation.supabase_client import get_supabase_async_client

PIPELINE_CHANNEL = "pipeline_execution_channel"
RESEARCH_CHANNEL = "research_channel"
TRANSCRIPT_CHANNEL = "transcript_channel"

PIPELINE_TABLE = "pipeline_execution"
RESEARCH_TABLE = "research"
TRANSCRIPT_TABLE = "transcripts"

event_queue: Queue = Queue()

load_dotenv()

EXECUTION_ENVIRONMENT = os.getenv("EXECUTION_ENVIRONMENT", "development")
MOCK_DATA_DIR = pathlib.Path(os.getenv("MOCK_DATA_DIR", str(pathlib.Path(__file__).parent / "mock_data")))

perplexity_client = OpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"),
    base_url=os.getenv("PERPLEXITY_BASE_URL")
)

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

supabase_client = None

async def get_mock_research_content() -> str:
    """Get mock research content from file in development mode."""
    try:
        with open(MOCK_DATA_DIR / "mock_research_content.txt", "r") as f:
            return f.read()
    except Exception as e:
        print(f"[Mock Data] Error reading research content: {str(e)}")
        return "Error reading mock research content"

async def get_mock_transcript_content() -> str:
    """Get mock transcript content from file in development mode."""
    try:
        with open(MOCK_DATA_DIR / "mock_transcript_content.txt", "r") as f:
            return f.read()
    except Exception as e:
        print(f"[Mock Data] Error reading transcript content: {str(e)}")
        return "Error reading mock transcript content"

async def get_mock_audio_content() -> bytes:
    """Get mock audio content from file in development mode."""
    try:
        with open(MOCK_DATA_DIR / "mock_tts_content.mp3", "rb") as f:
            return f.read()
    except Exception as e:
        print(f"[Mock Data] Error reading mock audio file: {str(e)}")
        return b"Error reading mock audio file"

async def generate_research_content(interests: list) -> str:
    """Generate research content based on interests"""
    if EXECUTION_ENVIRONMENT == "development":
        print("[Mock Data] Using mock research content")
        return await get_mock_research_content()
        
    try:
        response = perplexity_client.chat.completions.create(
            model="sonar-deep-research",
            messages=[
                {"role": "system", "content": """
                You are a researcher who generates research for a daily news podcast based on a list of interests.
                Given a list of interests, research the most significant events of the previous day for that topic.
                Provide enough information to create a podcast episode covering the most important events across all topics.
                The list of interests may not be related to each other. Please generate research for each interest separately.
                """},
                {"role": "user", "content": f"Generate research based on the following interests: {interests}"}
            ],
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[Perplexity] Error generating research: {str(e)}")
        raise

async def process_pipeline_execution_changes(payload: Dict[str, Any]):
    """Async handler for pipeline execution changes"""
    try:
        print('[Pipeline Handler] Received payload:', payload)
        record = payload.get('data', {}).get('record', {})
        pipeline_id = record.get('id')
        interests_id = record.get('interests_id')
        
        if not interests_id:
            print(f'[Pipeline Handler] No interests_id found in pipeline execution {pipeline_id}')
            return

        print(f'[Pipeline Handler] Processing pipeline execution: {pipeline_id} for interests_id: {interests_id}')
        
        interests_response = await supabase_client.table('interests') \
            .select('interests') \
            .eq('id', interests_id) \
            .order('timestamp', desc=True) \
            .limit(1) \
            .execute()

        if not interests_response.data:
            print(f'[Pipeline Handler] No interests found for id: {interests_id}')
            return

        interests = interests_response.data[0].get('interests', [])
        print(f'[Pipeline Handler] Retrieved interests: {interests}')

        # Generate research content
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
        import traceback
        traceback.print_exc()

async def generate_transcript_from_research(research_content: str) -> str:
    """Generate a transcript from research content using OpenAI."""
    if EXECUTION_ENVIRONMENT == "development":
        print("[Mock Data] Using mock transcript content")
        return await get_mock_transcript_content()
        
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": """
            You are a podcast host for a podcast called Your Daily Briefing.

            Generate a transcript for a morning brew style podcast episode that is 5 minutes in length.
            The transcript should be engaging and interesting, targeting 20-30 something professionals.
            Cover 4-5 topics in a fun and engaging way.

            Provide ONLY the transcript text and punctuation. No speaker tags or stage directions.
            Start with an eye-catching topic before a brief welcome.
            
            Make the transcript conversational as if two people are talking.
            """},
            {"role": "user", "content": f"Generate a transcript based on this research: {research_content}"}
        ],
        stream=False
    )
    
    return response.choices[0].message.content

async def create_transcript_entry(research_id: str, transcript_content: str):
    """Create a new transcript entry in the database."""
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
    
    print(f"[Transcript Handler] Created transcript entry: {transcript_response.data[0].get('id')}")
    return transcript_response

async def process_research_changes(payload: Dict[str, Any]):
    """Async handler for research changes"""
    try:
        if isinstance(payload, dict):
            record = payload.get('data', {}).get('record', {})
            research_id = record.get('id')
            research_data = record.get('research_data', {})
            
            print(f'[Research Handler] Processing research: {research_id}')
            
            try:
                transcript_content = await generate_transcript_from_research(research_data.get('content'))
                
                await create_transcript_entry(research_id, transcript_content)
                
            except Exception as e:
                print(f'[Research Handler] Error generating transcript: {str(e)}')
                raise
            
    except Exception as e:
        print(f'[Research Handler] Error processing research: {str(e)}')
        import traceback
        traceback.print_exc()

async def upload_audio_to_storage(audio_content: bytes, transcript_id: str) -> str:
    """Upload audio content to Supabase storage and return the public URL."""
    try:
        bucket_name = "podcast-audio-files"
        file_name = f"podcast_{transcript_id}_{int(time.time())}.mp3"
        
        if isinstance(audio_content, str):
            audio_content = audio_content.encode('utf-8')
        
        response = await supabase_client.storage \
            .from_(bucket_name) \
            .upload(
                path=file_name,
                file=audio_content,
                file_options={
                    "content-type": "audio/mp3",
                    "cache-control": "3600",
                    "upsert": "true"
                }
            )
        
        file_url = await supabase_client.storage \
            .from_(bucket_name) \
            .get_public_url(file_name)
            
        print(f"[Storage] Uploaded audio file: {file_name}")
        return file_url
        
    except Exception as e:
        print(f"[Storage] Error uploading audio to storage: {str(e)}")
        raise

async def generate_audio_for_transcript(transcript_content: str, transcript_id: str) -> Dict[str, Any]:
    """Determine which audio generation method to use and generate audio accordingly."""
    if EXECUTION_ENVIRONMENT == "development":
        print("[TTS] Using mock audio content in development mode")
        audio_content = await get_mock_audio_content()
        return {
            'audio_content': audio_content,
            'generated_at': datetime.now(UTC).isoformat()
        }
    
    text_size = len(transcript_content.encode('utf-8'))
    print(f"[TTS] Text size: {text_size} bytes")
    
    credentials, project = default()
    
    if text_size > 5000:
        return await generate_long_audio(transcript_content, transcript_id, credentials, project)
    else:
        return await generate_standard_audio(transcript_content, credentials)

async def generate_standard_audio(transcript_content: str, credentials) -> Dict[str, Any]:
    """Generate audio using standard Text-to-Speech API for shorter content."""
    print("[TTS] Using standard Text-to-Speech API...")
    tts_client = texttospeech.TextToSpeechClient(credentials=credentials)
    
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Chirp3-HD-Fenrir"
    )
    
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.0,
        pitch=0.0,
        volume_gain_db=0.0,
        effects_profile_id=["large-home-entertainment-class-device"]
    )
    
    response = tts_client.synthesize_speech(
        input=texttospeech.SynthesisInput(text=transcript_content),
        voice=voice,
        audio_config=audio_config
    )
    
    return {
        'audio_content': response.audio_content,
        'generated_at': datetime.now(UTC).isoformat()
    }

async def generate_long_audio(transcript_content: str, transcript_id: str, credentials, project: str) -> Dict[str, Any]:
    """Generate audio using Long Audio API for longer content."""
    print("[TTS] Using Long Audio API for large text content...")
    tts_client = texttospeech_v1beta1.TextToSpeechLongAudioSynthesizeClient(credentials=credentials)
    
    voice = texttospeech_v1beta1.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Chirp3-HD-Aoede"
    )
    
    audio_config = texttospeech_v1beta1.AudioConfig(
        audio_encoding=texttospeech_v1beta1.AudioEncoding.LINEAR16,
        speaking_rate=1.0,
        pitch=0.0,
        volume_gain_db=0.0
    )
    
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    output_filename = f"podcast_{transcript_id}_{int(time.time())}.wav"
    output_gcs_uri = f"gs://{bucket_name}/{output_filename}"
    
    parent = f"projects/{project}/locations/us-central1"
    request = texttospeech_v1beta1.SynthesizeLongAudioRequest(
        parent=parent,
        input=texttospeech_v1beta1.SynthesisInput(text=transcript_content),
        audio_config=audio_config,
        voice=voice,
        output_gcs_uri=output_gcs_uri,
    )
    
    operation = tts_client.synthesize_long_audio(request=request)
    print(f"[TTS] Long audio synthesis started. Operation name: {operation.operation.name}")
    
    result = operation.result(timeout=600)
    
    return {
        'audio_uri': output_gcs_uri,
        'generated_at': datetime.now(UTC).isoformat()
    }

async def create_podcast_entry(transcript_id: str, audio_url: str) -> Dict:
    """Create a new podcast entry in the database."""
    podcast_data = {
        'transcript_id': transcript_id,
        'audio_blob_url': audio_url
    }
    
    print("Podcast data:")
    print(podcast_data)

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

async def process_transcript_changes(payload: Dict[str, Any]):
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
            
        try:
            audio_data = await generate_audio_for_transcript(transcript_content, transcript_id)
            
            audio_url = None
            
            if 'audio_content' in audio_data:
                try:
                    audio_url = await upload_audio_to_storage(audio_data['audio_content'], transcript_id)
                    print(f"[Transcript Handler] Successfully uploaded audio to storage: {audio_url}")
                except Exception as e:
                    print(f"[Transcript Handler] Failed to upload audio to storage: {str(e)}")
                    raise
            else:
                audio_url = audio_data['audio_uri']
            
            if audio_url:
                podcast_entry = await create_podcast_entry(transcript_id, audio_url)
                if podcast_entry:
                    print(f'[Transcript Handler] Generated and stored audio for transcript: {transcript_id}')
                else:
                    print(f'[Transcript Handler] Failed to create podcast entry for transcript: {transcript_id}')
            else:
                print('[Transcript Handler] No audio URL available for podcast creation')
            
        except Exception as e:
            print(f'[Transcript Handler] Error generating audio: {str(e)}')
            raise
            
    except Exception as e:
        print(f'[Transcript Handler] Error processing transcript: {str(e)}')
        import traceback
        traceback.print_exc()

def handle_pipeline_execution_changes(payload):
    event_queue.put_nowait(('pipeline', payload))
    print(f"[Pipeline Handler] Queued pipeline execution event: {payload}")

def handle_research_changes(payload):
    event_queue.put_nowait(('research', payload))
    print(f"[Research Handler] Queued research event: {payload}")

def handle_transcript_changes(payload):
    event_queue.put_nowait(('transcript', payload))
    print(f"[Transcript Handler] Queued transcript event: {payload}")

async def process_event_queue():
    """Process events from the queue concurrently"""
    while True:
        try:
            event_type, payload = await event_queue.get()
            
            if event_type == 'pipeline':
                asyncio.create_task(process_pipeline_execution_changes(payload))
            elif event_type == 'research':
                asyncio.create_task(process_research_changes(payload))
            elif event_type == 'transcript':
                asyncio.create_task(process_transcript_changes(payload))
            
            event_queue.task_done()
            
        except Exception as e:
            print(f"[Event Queue] Error processing event: {str(e)}")

async def initialize_supabase():
    """Initialize the Supabase client"""
    global supabase_client
    if supabase_client is None:
        supabase_client = await get_supabase_async_client()
    return supabase_client

async def setup_and_run_listeners():
    """Setup and run realtime listeners"""
    try:
        await initialize_supabase()
        
        print("[System] Setting up listeners...")
        
        asyncio.create_task(process_event_queue())
        
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
        
        while True:
            await asyncio.sleep(10)
            
    except Exception as e:
        print(f"[System] Error setting up realtime listeners: {str(e)}")
        traceback.print_exc()
        sys.exit(1)
    finally:
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