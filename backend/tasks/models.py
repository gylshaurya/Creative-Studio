from django.db import models
from django.conf import settings
from projects.models import Project  # Keep their project grouping reference

class Task(models.Model):
    # Adopt their formal corporate stage choices for the pipeline
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

    # Combined Fields
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Keep their formal project assignee tracking field
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


# ✨ PRESERVE YOUR ATTACHMENT MODEL (Updated to point to integrated Task)
class Attachment(models.Model):
    LABEL_CHOICES = [
        ('design', 'Design Asset'),
        ('video', 'Video/Motion Graphic'),
        ('copy', 'Copy/Script'),
        ('brief', 'Campaign Brief'),
        ('other', 'Other Resource'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='task_attachments')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_attachments')
    title = models.CharField(max_length=255)
    resource_url = models.URLField(max_length=500)
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='other')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_label_display()})"
    

# ✨ PRESERVE YOUR COMMENT MODEL 
class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_comments')
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )

    def __str__(self):
        return f"Comment by {self.author.username} on Task {self.task_id}"