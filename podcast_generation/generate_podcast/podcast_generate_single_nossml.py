import os
import re
import time
from google.auth import default
from google.cloud import texttospeech
from google.cloud import texttospeech_v1beta1 as texttospeech_long

def generate_podcast():
    credentials, project = default()
    
    # Read the text from the podcast.txt file
    with open("podcast.txt", "r") as f:
        text = f.read()
    
    # Get the size of the text in bytes
    text_size = len(text.encode('utf-8'))
    print(f"Text size: {text_size} bytes")
    
    # Determine if we need to use the Long Audio API (>5000 bytes)
    use_long_audio_api = text_size > 5000
    
    if use_long_audio_api:
        print("Using Long Audio API for large text content...")
        generate_long_audio(text)
    else:
        print("Using standard Text-to-Speech API...")
        generate_standard_audio(text)

def generate_standard_audio(text):
    """Generate audio using the standard Text-to-Speech API for shorter content."""
    credentials, project = default()
    client = texttospeech.TextToSpeechClient(credentials=credentials)
    
    # Configure the synthesis input
    input_text = texttospeech.SynthesisInput(text=text)
    print("Using plain text for speech synthesis")
    
    # name = "en-US-Chirp3-HD-Fenrir"  # Using a high-definition voice model
    name = "en-US-Chirp3-HD-Aoede"  # Using a HD voice model
    # Configure voice parameters
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name=name  # Using a HD voice model
    )
    
    # Configure audio parameters
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.0,  # Normal speaking rate (can be adjusted between 0.25 and 4.0)
        pitch=0.0,  # Default pitch (can be adjusted between -20.0 and 20.0)
        volume_gain_db=0.0,  # Default volume (can be adjusted between -96.0 and 16.0)
        effects_profile_id=["large-home-entertainment-class-device"]  # For better audio quality
    )
    
    # Generate the audio
    print("Generating podcast audio...")
    response = client.synthesize_speech(
        input=input_text,
        voice=voice,
        audio_config=audio_config
    )
    
    # Save the audio to a file
    output_file = "podcast_aoede.mp3"
    with open(output_file, "wb") as out:
        out.write(response.audio_content)
        print(f"Generated podcast saved to '{output_file}'")

def generate_long_audio(text):
    """Generate audio using the Long Audio API for longer content."""
    credentials, project_id = default()
    
    # Create a client for the Long Audio API
    client = texttospeech_long.TextToSpeechLongAudioSynthesizeClient(credentials=credentials)
    
    # Set up the GCS bucket and output URI
    # Note: You need to create this bucket in your Google Cloud project first
    bucket_name = "podcast_wav_bucket"  # ⚠️ REPLACE WITH YOUR ACTUAL BUCKET NAME
    output_filename = f"podcast_{int(time.time())}.wav"  # Using .wav extension for LINEAR16 format
    output_gcs_uri = f"gs://{bucket_name}/{output_filename}"
    
    # Configure the synthesis input
    input_text = texttospeech_long.SynthesisInput(text=text)
    print("Using plain text for speech synthesis with Long Audio API")
    
    # Configure voice parameters
    # Note: Not all voices available in standard API are available in Long Audio API
    voice = texttospeech_long.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Chirp3-HD-Aoede"  # Using a neural voice model suitable for long audio
    )
    
    # Configure audio parameters
    audio_config = texttospeech_long.AudioConfig(
        audio_encoding=texttospeech_long.AudioEncoding.LINEAR16,  # Long Audio API only supports LINEAR16 currently
        speaking_rate=1.0,
        pitch=0.0,
        volume_gain_db=0.0
    )
    
    # Set up the parent resource
    parent = f"projects/{project_id}/locations/us-central1"
    
    # Create the request
    request = texttospeech_long.SynthesizeLongAudioRequest(
        parent=parent,
        input=input_text,
        audio_config=audio_config,
        voice=voice,
        output_gcs_uri=output_gcs_uri,
    )
    
    print(f"Submitting long audio synthesis request to Google Cloud...")
    print(f"Output will be saved to: {output_gcs_uri}")
    
    # Submit the request (this is an asynchronous operation)
    operation = client.synthesize_long_audio(request=request)
    
    print("Long audio synthesis operation started.")
    print("This process may take several minutes depending on the length of the content.")
    print("Operation name:", operation.operation.name)
    
    # Wait for the operation to complete (with a timeout)
    try:
        print("Waiting for operation to complete...")
        result = operation.result(timeout=600)  # 10 minute timeout
        print("Long audio synthesis completed successfully!")
        print(f"Your audio file is available at: {output_gcs_uri}")
        print("You can download it from the Google Cloud Storage console or using gsutil.")
        print(f"To download using gsutil, run: gsutil cp {output_gcs_uri} podcast.wav")
    except Exception as e:
        print(f"Error or timeout while waiting for long audio synthesis: {e}")
        print("The operation might still be processing. Check the status in the Google Cloud Console.")
        print(f"Operation name to check: {operation.operation.name}")

if __name__ == "__main__":
    generate_podcast()