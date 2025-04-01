import os
import time
from datetime import datetime, UTC
from google.auth import default
from google.cloud import texttospeech, texttospeech_v1beta1
from utils.config import EXECUTION_ENVIRONMENT
from utils.mock_data import get_mock_audio_content
from typing import Dict, Any
from podcast_generation.supabase_client import get_supabase_async_client

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

async def upload_audio_to_storage(audio_content: bytes, transcript_id: str) -> str:
    """Upload audio content to Supabase storage and return the public URL."""
    supabase_client = await get_supabase_async_client()
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