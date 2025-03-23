from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_supabase_client

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        try:
            # Try to connect to Supabase
            supabase = get_supabase_client()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        response = {
            "message": "Hello from Podcast Generation API!",
            "supabase_status": db_status
        }
        
        self.wfile.write(json.dumps(response).encode())
