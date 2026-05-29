from django.db import models
from django.conf import settings  # Ensure this exact import is present

class Notification(models.Model):
    TYPES = [
        ('mention', 'Mentioned in a comment'),
        ('assignment', 'Assigned to a task'),
        ('review_request', 'Review requested'),
        ('stage_change', 'Task stage updated')
    ]

    # CORRECT: Passed directly as a variable reference, NOT a string literal
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='triggered_notifications')
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    noti_type = models.CharField(max_length=25, choices=TYPES)
    verb = models.CharField(max_length=255)
    task = models.ForeignKey('tasks.Task', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.verb}"