from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import parse_qs, urlparse

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_supabase_client, get_db_session
from models.models import User

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Parse the URL and query parameters
        parsed_url = urlparse(self.path)
        path_parts = parsed_url.path.strip('/').split('/')
        
        try:
            # Connect to Supabase directly for efficient queries
            supabase = get_supabase_client()
            
            # If the path includes a user_id, get that specific user
            if len(path_parts) > 1 and path_parts[0] == 'api' and path_parts[1] == 'users' and len(path_parts) > 2:
                user_id = int(path_parts[2])
                response = supabase.table('users').select('*').eq('user_id', user_id).execute()
                result = response.data if response.data else {"error": "User not found"}
            else:
                # Otherwise, get all users
                response = supabase.table('users').select('*').execute()
                result = response.data
        except Exception as e:
            result = {"error": str(e)}
        
        self.wfile.write(json.dumps(result).encode())
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            # Create a new user
            supabase = get_supabase_client()
            
            # Insert the user into Supabase
            response = supabase.table('users').insert({
                'google_sso_id': data.get('google_sso_id', ''),
                'rss_feed_url': data.get('rss_feed_url', '')
            }).execute()
            
            # Prepare response
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            result = {"message": "User created successfully", "user": response.data[0] if response.data else None}
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            result = {"error": str(e)}
        
        self.wfile.write(json.dumps(result).encode()) 