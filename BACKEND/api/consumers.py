# BACKEND/api/consumers.py
"""
WebSocket consumers for real-time AI updates.
Handles bidirectional communication between frontend and AI processing tasks.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class AIConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for AI updates.
    Listens for AI task completions and sends updated site configs to frontend.
    """
    
    async def connect(self):
        """Accept WebSocket connection and add to user's group."""
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'ai_updates_{self.user_id}'
        
        # Join user-specific group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected for user {self.user_id}")
    
    async def disconnect(self, close_code):
        """Remove from group on disconnect."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected for user {self.user_id} (code: {close_code})")
    
    async def receive(self, text_data):
        """
        Handle messages from WebSocket (optional).
        Currently not used, but available for future bidirectional communication.
        """
        try:
            data = json.loads(text_data)
            logger.debug(f"Received WebSocket message from user {self.user_id}: {data}")
            # Could be used for ping/pong, task cancellation, etc.
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON received from user {self.user_id}")
    
    async def send_ai_update(self, event):
        """
        Receive message from Celery task and send to WebSocket.
        This method is called when channel_layer.group_send() is invoked.
        """
        logger.info(f"[Consumer] Received event for user {self.user_id} with keys: {list(event.keys())}")
        
        # Extract all fields except 'type' (which is for routing)
        message_data = {k: v for k, v in event.items() if k != 'type'}
        
        logger.info(f"[Consumer] Prepared message_data with keys: {list(message_data.keys())}")
        logger.info(f"[Consumer] Message has site: {message_data.get('site') is not None}")
        logger.info(f"[Consumer] Status: {message_data.get('status')}, Explanation: {message_data.get('explanation', 'N/A')[:100]}")
        
        await self.send(text_data=json.dumps(message_data))
        logger.info(f"[Consumer] Successfully sent AI update to WebSocket for user {self.user_id}")
