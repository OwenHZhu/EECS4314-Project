import json
import os
import pika
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

def insert_into_databricks(event):
    """Inserts the incoming event using the Databricks REST API."""
    print("--- Starting Databricks Insertion (REST API) ---")
    
    host = os.getenv("DATABRICKS_HOST")
    path = os.getenv("DATABRICKS_HTTP_PATH")
    token = os.getenv("DATABRICKS_TOKEN")
    
    warehouse_id = path.split("/")[-1]
    
    event_type = event.get("event_type")
    event_timestamp = event.get("timestamp")
    payload = json.dumps(event.get("payload", {}))
    
    url = f"https://{host}/api/2.0/sql/statements"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "warehouse_id": warehouse_id,
        "statement": """
            INSERT INTO bookatlas.storage.analytics_events 
            (event_type, event_timestamp, payload) 
            VALUES (:event_type, CAST(:event_timestamp AS TIMESTAMP), :payload)
        """,
        "parameters": [
            {"name": "event_type", "value": str(event_type), "type": "STRING"},
            {"name": "event_timestamp", "value": str(event_timestamp), "type": "STRING"},
            {"name": "payload", "value": payload, "type": "STRING"}
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print(f"Successfully inserted {event_type} event into SQL table!")
        else:
            print(f"Database insertion failed. Error code: {response.status_code}")
    except Exception as e:
        print(f"HTTP request failed: {e}")

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.exchange_declare(exchange="analytics_events", exchange_type="fanout")
    channel.queue_declare(queue="analytics_queue")
    channel.queue_bind(exchange="analytics_events", queue="analytics_queue")

    def callback(ch, method, properties, body):
        event = json.loads(body)
        print(f"Received event from queue: {event.get('event_type')}")
        insert_into_databricks(event)

    channel.basic_consume(
        queue="analytics_queue",
        on_message_callback=callback,
        auto_ack=True
    )

    print("Analytics HTTP consumer is running and waiting for events...")
    channel.start_consuming()

if __name__ == "__main__":
    main()