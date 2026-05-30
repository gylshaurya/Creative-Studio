from rest_framework import serializers
from .models import Task, Attachment


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
    
class AttachmentSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source='added_by.username', read_only=True)

    class Meta:
        model = Attachment
        fields = ['id', 'task', 'label', 'added_by', 'added_by_name', 'created_at']
        read_only_fields = ['id', 'task', 'added_by', 'added_by_name', 'created_at']