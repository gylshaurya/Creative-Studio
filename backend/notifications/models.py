from django.db import models
from django.conf import settings


class Notification(models.Model):
    TASK_ASSIGNED = 'TASK_ASSIGNED'
    STAGE_CHANGED = 'STAGE_CHANGED'
    TASK_CREATED = 'TASK_CREATED'

    EVENT_CHOICES = [
        (TASK_ASSIGNED, 'Task Assigned'),
        (STAGE_CHANGED, 'Stage Changed'),
        (TASK_CREATED, 'Task Created'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    event_type = models.CharField(max_length=30, choices=EVENT_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} - {self.event_type}"