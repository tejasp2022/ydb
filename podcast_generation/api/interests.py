from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import parse_qs, urlparse

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_supabase_client
from models.models import Interest, UserInterest

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
            
            # Check if we're getting interests for a specific user
            if len(path_parts) > 3 and path_parts[0] == 'api' and path_parts[1] == 'users' and path_parts[3] == 'interests':
                user_id = int(path_parts[2])
                
                # Get user's interests through a join query
                response = supabase.rpc(
                    'get_user_interests',
                    {'user_id_param': user_id}
                ).execute()
                
                result = response.data if response.data else []
            else:
                # Otherwise, get all interests
                response = supabase.table('interests').select('*').execute()
                result = response.data
        except Exception as e:
            result = {"error": str(e)}
        
        self.wfile.write(json.dumps(result).encode())
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # Parse the URL to check if we're adding an interest to a user
        parsed_url = urlparse(self.path)
        path_parts = parsed_url.path.strip('/').split('/')
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            supabase = get_supabase_client()
            
            # Check if we're adding an interest to a user
            if len(path_parts) > 3 and path_parts[0] == 'api' and path_parts[1] == 'users' and path_parts[3] == 'interests':
                user_id = int(path_parts[2])
                
                # First, create or get the interest
                interest_response = supabase.table('interests').insert({
                    'description': data.get('description', '')
                }).execute()
                
                if interest_response.data and len(interest_response.data) > 0:
                    interest_id = interest_response.data[0]['interest_id']
                    
                    # Then, create the user-interest relationship
                    user_interest_response = supabase.table('user_interests').insert({
                        'user_id': user_id,
                        'interest_id': interest_id
                    }).execute()
                    
                    result = {"message": "Interest added to user successfully", "interest": interest_response.data[0]}
                else:
                    result = {"error": "Failed to create interest"}
            else:
                # Just create a new interest
                response = supabase.table('interests').insert({
                    'description': data.get('description', '')
                }).execute()
                
                result = {"message": "Interest created successfully", "interest": response.data[0] if response.data else None}
            
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