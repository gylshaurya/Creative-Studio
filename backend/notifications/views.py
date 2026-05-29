from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)

        unread = self.request.query_params.get('unread')
        if unread == 'true':
            queryset = queryset.filter(is_read=False)

        return queryset