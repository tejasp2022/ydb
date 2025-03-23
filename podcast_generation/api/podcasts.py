from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import parse_qs, urlparse

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_supabase_client
from models.models import Podcast, Script

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Parse the URL and query parameters
        parsed_url = urlparse(self.path)
        path_parts = parsed_url.path.strip('/').split('/')
        
        try:
            # Connect to Supabase
            supabase = get_supabase_client()
            
            # Check if we're getting podcasts for a specific user
            if len(path_parts) > 3 and path_parts[0] == 'api' and path_parts[1] == 'users' and path_parts[3] == 'podcasts':
                user_id = int(path_parts[2])
                
                # Get user's podcasts
                response = supabase.table('podcasts').select('*').eq('user_id', user_id).execute()
                
                result = response.data if response.data else []
            
            # Check if we're getting a specific podcast
            elif len(path_parts) > 2 and path_parts[0] == 'api' and path_parts[1] == 'podcasts':
                podcast_id = int(path_parts[2])
                
                # Get the specific podcast
                response = supabase.table('podcasts').select('*').eq('podcast_id', podcast_id).execute()
                
                result = response.data[0] if response.data and len(response.data) > 0 else {"error": "Podcast not found"}
            
            else:
                # Otherwise, get all podcasts
                response = supabase.table('podcasts').select('*').execute()
                result = response.data
        except Exception as e:
            result = {"error": str(e)}
        
        self.wfile.write(json.dumps(result).encode())
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # Parse the URL
        parsed_url = urlparse(self.path)
        path_parts = parsed_url.path.strip('/').split('/')
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            supabase = get_supabase_client()
            
            # Check if we're creating a podcast for a specific user
            if len(path_parts) > 3 and path_parts[0] == 'api' and path_parts[1] == 'users' and path_parts[3] == 'podcasts':
                user_id = int(path_parts[2])
                
                # First, create a script if script_text is provided
                script_id = None
                if 'script_text' in data:
                    script_response = supabase.table('scripts').insert({
                        'script_text': data['script_text'],
                        'research_id': data.get('research_id')
                    }).execute()
                    
                    if script_response.data and len(script_response.data) > 0:
                        script_id = script_response.data[0]['script_id']
                
                # Then, create the podcast
                podcast_data = {
                    'user_id': user_id,
                    'audio_blob_url': data.get('audio_blob_url', '')
                }
                
                if script_id:
                    podcast_data['script_id'] = script_id
                
                podcast_response = supabase.table('podcasts').insert(podcast_data).execute()
                
                result = {
                    "message": "Podcast created successfully", 
                    "podcast": podcast_response.data[0] if podcast_response.data else None
                }
            else:
                # Just create a new podcast
                response = supabase.table('podcasts').insert({
                    'user_id': data.get('user_id'),
                    'script_id': data.get('script_id'),
                    'audio_blob_url': data.get('audio_blob_url', '')
                }).execute()
                
                result = {"message": "Podcast created successfully", "podcast": response.data[0] if response.data else None}
            
            # Prepare response
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            result = {"error": str(e)}
        
        self.wfile.write(json.dumps(result).encode()) 