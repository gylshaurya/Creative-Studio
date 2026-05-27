from rest_framework import serializers
from .models import Project
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'studio', 'name', 'description', 'type',
            'status', 'deadline', 'tags', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'studio', 'created_by', 'created_at', 'updated_at']