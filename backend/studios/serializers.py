from rest_framework import serializers
from django.utils.text import slugify
from .models import Studio, StudioMember
from django.contrib.auth import get_user_model

User = get_user_model()


class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class StudioSerializer(serializers.ModelSerializer):
    created_by = BasicUserSerializer(read_only=True)

    class Meta:
        model = Studio
        fields = ['id', 'name', 'slug', 'created_by', 'created_at']
        read_only_fields = ['id', 'slug', 'created_by', 'created_at']

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class StudioMemberSerializer(serializers.ModelSerializer):
    user = BasicUserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = StudioMember
        fields = ['id', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']