from django.db import models
from django.conf import settings
from projects.models import Project


class Task(models.Model):

    DRAFT = 'DRAFT'
    REVIEW = 'REVIEW'
    REVISION = 'REVISION'
    APPROVED = 'APPROVED'
    COMPLETED = 'COMPLETED'

    STAGE_CHOICES = [
        (DRAFT, 'Draft'),
        (REVIEW, 'Review'),
        (REVISION, 'Revision'),
        (APPROVED, 'Approved'),
        (COMPLETED, 'Completed'),
    ]

    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'

    PRIORITY_CHOICES = [
        (LOW, 'Low'),
        (MEDIUM, 'Medium'),
        (HIGH, 'High'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default=DRAFT)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=MEDIUM)
    deadline = models.DateField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_stage = self.stage

    def __str__(self):
        return f"{self.title} [{self.stage}]"
    
class Attachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachment_items')
    label = models.CharField(max_length=255)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attachments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.label