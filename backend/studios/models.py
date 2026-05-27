from django.db import models
from django.conf import settings


class Studio(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_studios'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class StudioMember(models.Model):

    ADMIN = 'ADMIN'
    LEAD = 'LEAD'
    DESIGNER = 'DESIGNER'
    WRITER = 'WRITER'
    REVIEWER = 'REVIEWER'
    CLIENT = 'CLIENT'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (LEAD, 'Project Lead'),
        (DESIGNER, 'Designer'),
        (WRITER, 'Writer'),
        (REVIEWER, 'Reviewer'),
        (CLIENT, 'Client Viewer'),
    ]

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='studio_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=DESIGNER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('studio', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.studio.name} ({self.role})"