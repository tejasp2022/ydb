from openai import OpenAI
import os
from dotenv import load_dotenv
from db_operations import create_script
from generate_podcast.podcast_generate_single_nossml import generate_standard_audio
import asyncio
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_script(research: str):
    response = client.chat.completions.create(
        model="gpt-4.5-preview",
        messages=[
            {"role": "system", "content": """
            You are a helpful assistant that generates scripts for podcasts.

            Given the research, generate a script for a podcast episode that is 5 minutes in length. Provide only the script text and punctuation.

            The script should be engaging and interesting, with a mix of different types of content. It will be listened to in the mornings, by 
            20-30 something professionals.
            
            """},
            {"role": "user", "content": f"Generate a script for a podcast based on the following research: {research}"}
        ]
    )   
    print(response.choices[0].message.content)
    script = response.choices[0].message.content
    # write script to file
    with open("script.txt", "w") as f:
        f.write(script)

    await generate_standard_audio(script)

    return script