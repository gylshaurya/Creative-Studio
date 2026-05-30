from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            task_id=self.kwargs['task_pk'],
            parent=None
        )

    def perform_create(self, serializer):
        from tasks.models import Task
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(task=task, author=self.request.user)