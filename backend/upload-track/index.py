'''
Business: Upload music track file and save metadata to database
Args: event with POST method, multipart/form-data with file and metadata
Returns: HTTP response with track ID and URL
'''

import json
import os
import base64
import uuid
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title')
        duration = body_data.get('duration', '0:00')
        file_data = body_data.get('fileData')
        file_name = body_data.get('fileName')
        
        if not title or not file_data or not file_name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields: title, fileData, fileName'})
            }
        
        file_bytes = base64.b64decode(file_data.split(',')[1] if ',' in file_data else file_data)
        file_size = len(file_bytes)
        
        unique_filename = f"{uuid.uuid4()}_{file_name}"
        file_url = f"https://cdn.poehali.dev/music/{unique_filename}"
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration missing'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO tracks (title, duration, file_url, file_name, file_size) "
            "VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (title, duration, file_url, file_name, file_size)
        )
        track_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'id': track_id,
                'title': title,
                'duration': duration,
                'url': file_url,
                'message': 'Track uploaded successfully'
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Upload failed: {str(e)}'})
        }