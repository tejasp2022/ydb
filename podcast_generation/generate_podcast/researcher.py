# Takes in list of interests and returns research
from openai import OpenAI
import os
from dotenv import load_dotenv
import asyncio
import importlib.util
import sys
from pathlib import Path

# Handle imports whether run as script or imported as module
if __name__ == "__main__":
    # When run directly, add parent to path and use absolute imports
    project_root = Path(__file__).parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    from db_operations import add_research_entry_to_db
    from supabase_client import supabase_client
    from generate_podcast.transcripts import generate_transcript
else:
    # When imported as module, use relative imports
    from ..db_operations import add_research_entry_to_db
    from ..supabase_client import supabase_client
    from .transcripts import generate_transcript

load_dotenv()

client = OpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"),
    base_url=os.getenv("PERPLEXITY_BASE_URL")
)

async def generate_research(user_id, interests):
    """Generate research content based on a list of interests using the Perplexity API."""
    response = client.chat.completions.create(
        model="sonar-deep-research",
        messages=[
            {"role": "system", "content": """
            You are a researcher who generates research for a daily news podcast based on a list of interests.
            Given a list of interests, research the most significant events of the previous day for that topic.
            Provide enough information to create a podcast episode covering the most important events across all topics.
            The list of interests may not be related to each other. Please generate research for each interest separately.
            We will use this research to create a podcast later.

            There should be enough research so that we do not have to look anywhere else for information, and can create an interesting podcast episode.

            Provide as much research as possible! Go as in depth as you can so we can create a great transcript
            """},
            {"role": "user", "content": f"Generate research based on the following interests: {interests}"}
        ],
        stream=True
    )

    # Correctly handle the streaming response
    full_content = ""
    for chunk in response:
        # Extract the content delta if it exists
        content_delta = chunk.choices[0].delta.content
        if content_delta is not None:
            print(content_delta, end="", flush=True)
            full_content += content_delta
    
    print("\n\nResearch generation complete.")

    research_content = {
        "research_content": full_content
    }

    add_research_entry_to_db(user_id, research_content)

    await generate_transcript(full_content)

    return full_content

if __name__ == "__main__":
    test_user_uuid = '123e4567-e89b-12d3-a456-426614174000'
    research_content = asyncio.run(generate_research(test_user_uuid, interests))