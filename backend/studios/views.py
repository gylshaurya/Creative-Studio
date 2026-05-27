from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Studio, StudioMember
from .serializers import StudioSerializer, StudioMemberSerializer
from .permissions import IsStudioAdmin, IsStudioMember


class StudioViewSet(viewsets.ModelViewSet):
    serializer_class = StudioSerializer
    permission_classes = [IsAuthenticated]

    # Only return studios that the logged-in user is a member of
    def get_queryset(self):
        return Studio.objects.filter(members__user=self.request.user)

    # When a studio is created, automatically add the creator as ADMIN
    def perform_create(self, serializer):
        studio = serializer.save(created_by=self.request.user)
        # Create a membership for the creator with ADMIN role
        StudioMember.objects.create(
            studio=studio,
            user=self.request.user,
            role=StudioMember.ADMIN
        )

    # For update/delete, check if user is an admin of that specific studio
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStudioAdmin()]
        return [IsAuthenticated()]


class StudioMemberViewSet(viewsets.ModelViewSet):
    serializer_class = StudioMemberSerializer
    permission_classes = [IsAuthenticated]

    # Only return members of the studio in the URL
    # studio_pk comes from the nested URL: /api/studios/{studio_pk}/members/
    def get_queryset(self):
        return StudioMember.objects.filter(studio_id=self.kwargs['studio_pk'])

    # When inviting a member, automatically set which studio they're joining
    def perform_create(self, serializer):
        studio = Studio.objects.get(pk=self.kwargs['studio_pk'])
        serializer.save(studio=studio)

    # Only admins can invite, remove, or change roles
    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAuthenticated(), IsStudioAdmin()]
        return [IsAuthenticated()]