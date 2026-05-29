from django.db import models
from django.conf import settings

# ✨ ADDING THE MISSING TASK MODEL HERE
class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('done', 'Done'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# ATTACHMENT MODEL (Now points seamlessly to the real Task model above)
class Attachment(models.Model):
    LABEL_CHOICES = [
        ('design', 'Design Asset'),
        ('video', 'Video/Motion Graphic'),
        ('copy', 'Copy/Script'),
        ('brief', 'Campaign Brief'),
        ('other', 'Other Resource'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_attachments')

    title = models.CharField(max_length=255)
    resource_url = models.URLField(max_length=500)
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='other')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_label_display()})"
    

# COMMENT MODEL
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