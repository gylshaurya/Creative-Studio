from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
# ✨ CRITICAL IMPORT: Bring in the JWT authentication mechanism explicitly
from rest_framework_simplejwt.authentication import JWTAuthentication 
from .models import Attachment, Comment, Task

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    authentication_classes = [JWTAuthentication] # 🔒 Force JWT verification
    permission_classes = [IsAuthenticated]

    @property
    def serializer_class(self):
        from .serializers import AttachmentSerializer
        return AttachmentSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication] # 🔒 Force JWT verification
    permission_classes = [IsAuthenticated]

    @property
    def serializer_class(self):
        from .serializers import CommentSerializer
        return CommentSerializer

    def get_queryset(self):
        queryset = Comment.objects.all()
        task_id = self.request.query_params.get('task')

        if task_id is not None:
            queryset = queryset.filter(task_id=task_id)

        if self.action == 'list':
            queryset = queryset.filter(parent__isnull=True)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    authentication_classes = [JWTAuthentication] # 🔒 Force JWT verification
    permission_classes = [IsAuthenticated]

    @property
    def serializer_class(self):
        from .serializers import TaskSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the creator of the task
        serializer.save(created_by=self.request.user)