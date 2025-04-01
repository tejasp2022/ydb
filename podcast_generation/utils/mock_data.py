from utils.config import MOCK_DATA_DIR

async def get_mock_research_content() -> str:
    """Get mock research content from file in development mode."""
    try:
        with open(MOCK_DATA_DIR / "mock_research_content.txt", "r") as f:
            return f.read()
    except Exception as e:
        print(f"[Mock Data] Error reading research content: {str(e)}")
        return "Error reading mock research content"

async def get_mock_transcript_content() -> str:
    """Get mock transcript content from file in development mode."""
    try:
        with open(MOCK_DATA_DIR / "mock_transcript_content.txt", "r") as f:
            return f.read()
    except Exception as e:
        print(f"[Mock Data] Error reading transcript content: {str(e)}")
        return "Error reading mock transcript content"

async def get_mock_audio_content() -> bytes:
    """Get mock audio content from file in development mode."""
    try:
        with open(MOCK_DATA_DIR / "mock_tts_content.mp3", "rb") as f:
            return f.read()
    except Exception as e:
        print(f"[Mock Data] Error reading mock audio file: {str(e)}")
        return b"Error reading mock audio file" 