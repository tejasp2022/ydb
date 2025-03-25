from openai import OpenAI
import os
from dotenv import load_dotenv
import sys
from pathlib import Path

# Add parent directory to path to enable imports
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from db_operations import add_transcript_entry_to_db
from generate_podcast.podcast_generate_single_nossml import generate_standard_audio
import asyncio

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_transcript(research):
    response = client.chat.completions.create(
        model="gpt-4.5-preview",
        messages=[
            {"role": "system", "content": """
            You are a podcast host for a podcast called Your Daily Briefing.

            Given the research, generate a transcript for a morning brew style podcast episode that is 5 minutes in length.

            The transcript should be engaging and interesting, with a mix of different types of content. It will be listened to in the mornings, by 
            20-30 something professionals and cover 4-5 topics. All the research you need should be provided for you. Make it fun, engaging, and interesting.

            Provide ONLY the transcript text and punctuation. Ignore annotations for stage directions such as music cues, applause, speaker tags, etc.

            start in a format where you jump right into an eye catching topic. And then maybe if appropriate, you can go a very short welcome to your daily dose.

            Make the transcript seem like it is 2 peopel talking, but ONLY give text. No speaker tags.

            Also, make sure to make learning fun and engaging
            
            """},
            {"role": "user", "content": f"Generate a transcript for a podcast based on the following research: {research}"}
        ]
    )   

    transcript = response.choices[0].message.content

    transcript_content = {
        "transcript_content": transcript
    }
    
    # Since we're passing research content, not ID, we'll handle DB operations differently
    # add_transcript_entry_to_db(research_id, transcript_content)

    await generate_standard_audio(transcript)

    return transcript

if __name__ == "__main__":
    test_research = "Sample research on technology and science topics."
    asyncio.run(generate_transcript(test_research))