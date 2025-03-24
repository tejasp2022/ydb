from openai import OpenAI
import os
from dotenv import load_dotenv
from db_operations import create_script
from podcast_generate_single_nossml import generate_standard_audio
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_script(research: str):
    response = client.chat.completions.create(
        model="gpt-4.5-preview",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates scripts for podcasts."},
            {"role": "user", "content": f"Generate a script for a podcast based on the following research: {research}"}
        ]
    )   
    print(response.choices[0].message.content)
    script = response.choices[0].message.content
    # write script to file
    with open("script.txt", "w") as f:
        f.write(script)

    generate_standard_audio(script)
    return script