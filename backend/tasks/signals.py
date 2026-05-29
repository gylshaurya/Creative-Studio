from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task
from notifications.models import Notification


@receiver(post_save, sender=Task)
def handle_task_notifications(sender, instance, created, **kwargs):

    if created:
        if instance.assignee:
            Notification.objects.create(
                recipient=instance.assignee,
                event_type=Notification.TASK_ASSIGNED,
                message=f"You have been assigned to '{instance.title}'",
                meta={
                    'task_id': instance.id,
                    'task_title': instance.title,
                    'project_id': instance.project.id,
                    'project_name': instance.project.name,
                }
            )
        return 

    stage_changed = instance._original_stage != instance.stage
    assignee_changed = False

    try:
        old_task = Task.objects.get(pk=instance.pk)
    except Task.DoesNotExist:
        pass

    if stage_changed:
        if instance.assignee:
            Notification.objects.create(
                recipient=instance.assignee,
                event_type=Notification.STAGE_CHANGED,
                message=f"Task '{instance.title}' moved to {instance.stage}",
                meta={
                    'task_id': instance.id,
                    'task_title': instance.title,
                    'project_id': instance.project.id,
                    'project_name': instance.project.name,
                    'old_stage': instance._original_stage,
                    'new_stage': instance.stage,
                }
            )

        if instance.created_by and instance.created_by != instance.assignee:
            Notification.objects.create(
                recipient=instance.created_by,
                event_type=Notification.STAGE_CHANGED,
                message=f"Task '{instance.title}' moved to {instance.stage}",
                meta={
                    'task_id': instance.id,
                    'task_title': instance.title,
                    'old_stage': instance._original_stage,
                    'new_stage': instance.stage,
                }
            )