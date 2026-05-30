from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    # Keep your custom username lookups for the UI to display cleanly
    sender_username = serializers.ReadOnlyField(source='sender.username')
    recipient_username = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Notification
        # Unified fields array mapping both feature sets
        fields = [
            'id', 
            'recipient', 
            'recipient_username', 
            'sender', 
            'sender_username', 
            'event_type', 
            'message', 
            'is_read', 
            'meta', 
            'task',
            'created_at'
        ]
        # Protect the core event data from being altered via API updates
        read_only_fields = ['id', 'recipient', 'sender', 'event_type', 'message', 'meta', 'task', 'created_at']