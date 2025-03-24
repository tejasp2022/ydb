# Takes in list of interests and returns research
from openai import OpenAI
import os
from dotenv import load_dotenv
from generate_podcast.scripts import generate_script
import asyncio

load_dotenv()

# Configure the client with the appropriate API key and base URL
# For Perplexity API
client = OpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"),
    base_url=os.getenv("PERPLEXITY_BASE_URL")
)

# Example interests list
interests = ['Severance', 'Climbing', 'Zero-Shot Learning', 'cats', 'quantum physics']

async def generate_research(interests):
    """Generate research content based on a list of interests using the Perplexity API."""
    response = client.chat.completions.create(
        model="sonar-deep-research",
        messages=[
            {"role": "system", "content": """
            You are a researcher who generates research for a daily news podcast based on a list of interests.
            Given a list of interests, research the most significant events of the previous day for that topic.
            Provide enough information to create a 20 minute podcast episode covering the most important events across all topics.
            The list of interests may not be related to each other. Please generate research for each interest separately.
            We will use this research to create a podcast later.

            There should be enough research so that we do not have to look anywhere else for information, and can create an interesting podcast episode.

            Provide as much detail as possible!
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

    save_research_to_file(full_content)

    await generate_script(full_content)

    return full_content


def save_research_to_file(content, filename="research_output.txt"):
    """Save the generated research to a file."""
    with open(filename, "w") as f:
        f.write("# Research Output\n\n")
        f.write(content)
    print(f"Research saved to {filename}")


if __name__ == "__main__":
    research_content = asyncio.run(generate_research(interests))