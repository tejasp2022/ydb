import os
import pathlib
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

EXECUTION_ENVIRONMENT = os.getenv("EXECUTION_ENVIRONMENT", "development")
MOCK_DATA_DIR = pathlib.Path(os.getenv("MOCK_DATA_DIR", str(pathlib.Path(__file__).parent.parent / "mock_data")))

PIPELINE_CHANNEL = "pipeline_execution_channel"
RESEARCH_CHANNEL = "research_channel"
TRANSCRIPT_CHANNEL = "transcript_channel"

PIPELINE_TABLE = "pipeline_execution"
RESEARCH_TABLE = "research"
TRANSCRIPT_TABLE = "transcripts"

perplexity_client = OpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"),
    base_url=os.getenv("PERPLEXITY_BASE_URL")
)

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
) 