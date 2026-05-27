from django.db import models
from django.conf import settings
from studios.models import Studio


class Project(models.Model):

    POSTER = 'POSTER'
    VIDEO = 'VIDEO'
    CAMPAIGN = 'CAMPAIGN'
    CONTENT = 'CONTENT'

    TYPE_CHOICES = [
        (POSTER, 'Poster'),
        (VIDEO, 'Video'),
        (CAMPAIGN, 'Campaign'),
        (CONTENT, 'Content'),
    ]

    STATUS_ACTIVE = 'ACTIVE'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_ARCHIVED = 'ARCHIVED'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_ARCHIVED, 'Archived'),
    ]

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    deadline = models.DateField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_projects'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.studio.name})"