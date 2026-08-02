import os
import requests
from dotenv import load_dotenv
from cachetools.func import ttl_cache

load_dotenv()

def execute_databricks_sql(query: str):
    """Helper function to run SQL in Databricks via REST API and wait for the result."""
    host = os.getenv("DATABRICKS_HOST")
    path = os.getenv("DATABRICKS_HTTP_PATH")
    token = os.getenv("DATABRICKS_TOKEN")
    
    if not all([host, path, token]):
        raise ValueError("Missing Databricks credentials in .env file")

    warehouse_id = path.split("/")[-1]
    
    url = f"https://{host}/api/2.0/sql/statements"
    headers = {
        "Authorization": f"Bearer {token}", 
        "Content-Type": "application/json"
    }
    
    data = {
        "warehouse_id": warehouse_id,
        "statement": query,
        "wait_timeout": "10s" 
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Databricks API error {response.status_code}: {response.text}")

# Caches up to 10 variations of the 'limit' parameter for 300 seconds (5 minutes)
@ttl_cache(maxsize=10, ttl=300)
def get_popular_searches(limit: int = 5):
    """Fetches the top N most popular search terms."""
    query = f"""
        SELECT 
            get_json_object(payload, '$.search_term') AS search_term,
            COUNT(*) as count
        FROM bookatlas.storage.analytics_events
        WHERE event_type = 'SearchExecuted'
        GROUP BY search_term
        ORDER BY count DESC
        LIMIT {limit}
    """
    
    try:
        result = execute_databricks_sql(query)
        
        popular_searches = []
        if "result" in result and "data_array" in result["result"]:
            for row in result["result"]["data_array"]:
                if row[0]: 
                    popular_searches.append({"search_term": row[0], "count": int(row[1])})
                
        return {"success": True, "data": popular_searches, "message": "Success"}
        
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}

# Caches up to 10 variations of the 'limit' parameter for 300 seconds (5 minutes)
@ttl_cache(maxsize=10, ttl=300)
def get_popular_books(limit: int = 5):
    """Fetches the top N most viewed books."""
    query = f"""
        SELECT 
            get_json_object(payload, '$.book_title') AS book_title,
            get_json_object(payload, '$.book_id') AS book_id,
            COUNT(*) as view_count
        FROM bookatlas.storage.analytics_events
        WHERE event_type = 'BookViewed'
        GROUP BY book_title, book_id
        ORDER BY view_count DESC
        LIMIT {limit}
    """
    
    try:
        result = execute_databricks_sql(query)
        
        popular_books = []
        if "result" in result and "data_array" in result["result"]:
            for row in result["result"]["data_array"]:
                if row[0]: 
                    popular_books.append({
                        "book_title": row[0], 
                        "book_id": row[1], 
                        "views": int(row[2])
                    })
                
        return {"success": True, "data": popular_books, "message": "Success"}
        
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}