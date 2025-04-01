from datetime import datetime, UTC
from utils.config import openai_client, EXECUTION_ENVIRONMENT
from utils.mock_data import get_mock_transcript_content

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