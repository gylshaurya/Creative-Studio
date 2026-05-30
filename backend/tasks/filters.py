import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    stage = django_filters.CharFilter(field_name='stage', lookup_expr='exact')
    assignee = django_filters.NumberFilter(field_name='assignee__id')
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='exact')
    deadline_before = django_filters.DateFilter(field_name='deadline', lookup_expr='lte')
    deadline_after = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')
    project = django_filters.NumberFilter(field_name='project__id')

    class Meta:
        model = Task
        fields = ['stage', 'assignee', 'priority','project']