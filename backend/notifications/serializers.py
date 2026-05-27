from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'event_type', 'message', 'is_read', 'meta', 'created_at']
        read_only_fields = ['id', 'event_type', 'message', 'meta', 'created_at']