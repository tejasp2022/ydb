from datetime import datetime, UTC
from utils.config import perplexity_client, EXECUTION_ENVIRONMENT
from utils.mock_data import get_mock_research_content

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