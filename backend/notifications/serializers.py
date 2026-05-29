from rest_framework import serializers
from .models import Notification

<<<<<<< HEAD
class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    recipient_username = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Notification
        fields = [
            'id', 
            'recipient', 
            'recipient_username', 
            'sender', 
            'sender_username', 
            'noti_type', 
            'verb', 
            'is_read', 
            'created_at', 
            'task'
        ]
=======

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'event_type', 'message', 'is_read', 'meta', 'created_at']
        read_only_fields = ['id', 'event_type', 'message', 'meta', 'created_at']
>>>>>>> origin/main
