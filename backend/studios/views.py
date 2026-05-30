from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Studio, StudioMember
from .serializers import StudioSerializer, StudioMemberSerializer
from .permissions import IsStudioAdmin, IsStudioMember

User = get_user_model()


class StudioViewSet(viewsets.ModelViewSet):
    serializer_class = StudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Studio.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        studio = serializer.save(created_by=self.request.user)
        # Creator automatically becomes ADMIN
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
        return StudioMember.objects.filter(
            studio_id=self.kwargs['studio_pk']
        ).select_related('user')

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update', 'invite']:
            return [IsAuthenticated(), IsStudioAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        studio = Studio.objects.get(pk=self.kwargs['studio_pk'])
        serializer.save(studio=studio)

    @action(detail=False, methods=['post'], url_path='invite')
    def invite(self, request, studio_pk=None):
        """
        POST /api/studios/{studio_pk}/members/invite/
        Body: { "email": "user@example.com", "role": "DESIGNER" }
        """
        email = request.data.get('email')
        role = request.data.get('role', StudioMember.DESIGNER)

        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': f'No user found with email {email}.'}, status=status.HTTP_404_NOT_FOUND)

        studio = Studio.objects.get(pk=studio_pk)

        if StudioMember.objects.filter(studio=studio, user=user).exists():
            return Response({'detail': 'User is already a member of this studio.'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in dict(StudioMember.ROLE_CHOICES):
            return Response({'detail': f'Invalid role: {role}.'}, status=status.HTTP_400_BAD_REQUEST)

        member = StudioMember.objects.create(studio=studio, user=user, role=role)
        return Response(StudioMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='change-role')
    def change_role(self, request, studio_pk=None, pk=None):
        """
        PATCH /api/studios/{studio_pk}/members/{id}/change-role/
        Body: { "role": "REVIEWER" }
        """
        member = self.get_object()
        role = request.data.get('role')

        if not role:
            return Response({'detail': 'Role is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in dict(StudioMember.ROLE_CHOICES):
            return Response({'detail': f'Invalid role: {role}.'}, status=status.HTTP_400_BAD_REQUEST)

        member.role = role
        member.save(update_fields=['role'])
        return Response(StudioMemberSerializer(member).data)