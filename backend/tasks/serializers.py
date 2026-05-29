from rest_framework import serializers
from django.contrib.auth import get_user_model 
from .models import Attachment, Comment

User = get_user_model()

class AttachmentSerializer(serializers.ModelSerializer):
    label_display = serializers.CharField(source='get_label_display', read_only=True)
    
    class Meta:
        model = Attachment
        fields = [
            'id', 
            'task', 
            'title', 
            'resource_url', 
            'label', 
            'label_display', 
            'uploaded_by', 
            'date'
        ]
        read_only_fields = ['uploaded_by', 'date']


class UserMinifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class CommentSerializer(serializers.ModelSerializer):
    author_details = UserMinifiedSerializer(source='author', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 
            'task', 
            'author', 
            'author_details', 
            'text', 
            'parent', 
            'replies', 
            'date'
        ]
        read_only_fields = ['author', 'date']

   
    def get_replies(self, obj):
        """Custom method to fetch and serialize only the immediate children of this comment."""
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []