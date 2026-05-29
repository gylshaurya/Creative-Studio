from rest_framework import serializers
from .models import Notification

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