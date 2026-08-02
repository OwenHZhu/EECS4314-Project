"""
shared/publish_event.py

Centralized helper for publishing fire-and-forget analytics events
to RabbitMQ. Used by any service (book_service, forum_service, 
auth_service, etc.) that needs to track user activity.
"""

import json
import pika
from datetime import datetime, timezone


def publish_analytics_event(event_type: str, payload: dict):
    """Publishes a fire-and-forget message to RabbitMQ for analytics tracking."""
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
        channel.exchange_declare(exchange="analytics_events", exchange_type="fanout")

        event = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }

        channel.basic_publish(
            exchange="analytics_events", 
            routing_key="",
            body=json.dumps(event)
        )
        connection.close()
    except Exception as e:
        print(f"Failed to publish analytics event: {e}")