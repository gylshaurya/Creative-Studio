from django.db import models
from django.conf import settings

class Notification(models.Model):
    # Combined event choice slugs to satisfy both notification systems
    TASK_ASSIGNED = 'TASK_ASSIGNED'
    STAGE_CHANGED = 'STAGE_CHANGED'
    TASK_CREATED = 'TASK_CREATED'
    MENTION = 'MENTION'
    REVIEW_REQUEST = 'REVIEW_REQUEST'

    EVENT_CHOICES = [
        (TASK_ASSIGNED, 'Task Assigned'),
        (STAGE_CHANGED, 'Stage Changed'),
        (TASK_CREATED, 'Task Created'),
        (MENTION, 'Mentioned in a comment'),
        (REVIEW_REQUEST, 'Review Requested'),
    ]

    # Core relationship mappings
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    # Kept from HEAD: lets you know exactly who triggered the notification
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='triggered_notifications'
    )
    
    # Combined types and payload fields
    event_type = models.CharField(max_length=30, choices=EVENT_CHOICES)
    message = models.TextField()  # Captures the text block or verb string safely
    is_read = models.BooleanField(default=False)
    
    # Kept from HEAD: clean direct lookups to your tasks app
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Kept from origin/main: great for passing extra custom payload dictionaries
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username} - {self.event_type}"