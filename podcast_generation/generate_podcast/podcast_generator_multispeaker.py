#!/usr/bin/env python3
"""
Podcast Generator - Converts a JSON dialogue script to an audio podcast using Google Cloud Text-to-Speech.
Make sure you have set up Google Cloud authentication with:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-project-credentials.json"
"""

import json
import os
from google.auth import default
from google.cloud import texttospeech_v1beta1 as texttospeech

def generate_podcast_from_json(json_file, output_file="podcast.mp3"):
    """
    Generates an audio podcast from a JSON dialogue file.
    
    Args:
        json_file (str): Path to the JSON file containing dialogue
        output_file (str): Path to save the output audio file
    """
    print(f"Reading dialogue from {json_file}...")
    
    # Load the JSON dialogue
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    # Extract dialogue entries
    dialogue_entries = data.get('dialogue', [])
    
    if not dialogue_entries:
        print("No dialogue found in the JSON file.")
        return
    
    # Create a list of Turn objects for the API
    turns = []
    for entry in dialogue_entries:
        speaker = entry.get('speaker', '')
        line = entry.get('line', '')
        
        # Map speakers to format required by the API (simple mapping like A, B, etc.)
        # In this case, we'll map "Alex" to "A" and "Riley" to "R"
        speaker_code = "A" if speaker == "Alex" else "R"
        
        # Create a Turn object
        turn = texttospeech.MultiSpeakerMarkup.Turn(
            speaker=speaker_code,
            text=line
        )
        turns.append(turn)
    
    # Instantiate the client
    print("Initializing Text-to-Speech client...")
    credentials, project = default()
    client = texttospeech.TextToSpeechClient(credentials=credentials)
    
    # Create multi-speaker markup
    multi_speaker_markup = texttospeech.MultiSpeakerMarkup(
        turns=turns
    )
    
    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(
        multi_speaker_markup=multi_speaker_markup
    )
    
    # Build the voice request
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Studio-MultiSpeaker"
    )
    
    # Select the type of audio file
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )
    
    print("Generating podcast audio...")
    # Perform the text-to-speech request
    response = client.synthesize_speech(
        input=synthesis_input, 
        voice=voice, 
        audio_config=audio_config
    )
    
    # Write the response to the output file
    with open(output_file, "wb") as out:
        out.write(response.audio_content)
    
    print(f"Audio content written to file '{output_file}'")

if __name__ == "__main__":
    # You can change these paths as needed
    input_json = "dialogue.json"
    output_mp3 = "what_happening_today_podcast.mp3"
    
    # Check if Google credentials are set
    if not os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
        print("WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
        print("Make sure to set it to your Google Cloud credentials JSON file path:")
        print("export GOOGLE_APPLICATION_CREDENTIALS=\"/path/to/your-credentials.json\"")
    
    generate_podcast_from_json(input_json, output_mp3)