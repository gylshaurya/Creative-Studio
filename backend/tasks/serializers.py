from rest_framework import serializers
<<<<<<< HEAD
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
=======
from .models import Task


ALLOWED_TRANSITIONS = {
    'DRAFT':     ['REVIEW'],
    'REVIEW':    ['REVISION', 'APPROVED'],
    'REVISION':  ['REVIEW'],
    'APPROVED':  ['COMPLETED'],
    'COMPLETED': [],
}


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'title', 'description', 'assignee', 'assignee_name',
            'stage', 'priority', 'deadline', 'tags', 'attachments',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'project', 'created_by', 'created_at', 'updated_at']

    def validate(self, data):
        if self.instance is not None and 'stage' in data:
            current_stage = self.instance.stage
            new_stage = data['stage']

            if current_stage != new_stage:
                allowed = ALLOWED_TRANSITIONS.get(current_stage, [])
                if new_stage not in allowed:
                    raise serializers.ValidationError({
                        'stage': f"Cannot move from {current_stage} to {new_stage}. "
                                 f"Allowed transitions: {allowed}"
                    })
        return data
>>>>>>> origin/main
