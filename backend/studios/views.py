from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Studio, StudioMember
from .serializers import StudioSerializer, StudioMemberSerializer
from .permissions import IsStudioAdmin, IsStudioMember


class StudioViewSet(viewsets.ModelViewSet):
    serializer_class = StudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Studio.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        studio = serializer.save(created_by=self.request.user)

        StudioMember.objects.create(
            studio=studio,
            user=self.request.user,
            role=StudioMember.ADMIN
        )

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStudioAdmin()]
        return [IsAuthenticated()]


class StudioMemberViewSet(viewsets.ModelViewSet):
    serializer_class = StudioMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudioMember.objects.filter(studio_id=self.kwargs['studio_pk'])

    def perform_create(self, serializer):
        studio = Studio.objects.get(pk=self.kwargs['studio_pk'])
        serializer.save(studio=studio)

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAuthenticated(), IsStudioAdmin()]
        return [IsAuthenticated()]