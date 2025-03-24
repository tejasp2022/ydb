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
            You are a podcast host for a podcast called Your Daily Briefing.

            Given the research, generate a script for a morning brew style podcast episode that is 5 minutes in length.

            The script should be engaging and interesting, with a mix of different types of content. It will be listened to in the mornings, by 
            20-30 something professionals and cover 4-5 topics. All the research you need should be provided for you. Make it fun, engaging, and interesting.

            Provide ONLY the script text and punctuation. Ignore annotations for stage directions such as music cues, applause, speaker tags, etc.

            start in a format where you jump right into an eye catching topic. And then maybe if appropriate, you can go a very short welcome to your daily dose.

            Make the script seem like it is 2 peopel talking, but ONLY give text. No speaker tags.

            Also, make sure to make learning fun and engaging
            
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