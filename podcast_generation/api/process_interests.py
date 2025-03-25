# podcast_generation/api/process_interests.py
from http.server import BaseHTTPRequestHandler
import json
import os
import asyncio
from generate_podcast.researcher import generate_research
from supabase_client import supabase_client

def handle_request(event_body):
    try:
        user_id = event_body.get('user_id')
        interests = event_body.get('interests')
        
        # Execute research generation (sync version for serverless)
        research_results = generate_research(user_id, interests, synchronous=True)
        
        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'user_id': user_id,
                'research_id': research_results.get('research_id')
            })
        }
    except Exception as e:
        print(f"Error processing interests: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        event_data = json.loads(post_data)
        
        result = handle_request(event_data)
        
        self.send_response(result['statusCode'])
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(json.loads(result['body'])).encode())
        return