from rest_framework.permissions import BasePermission
from .models import StudioMember


def get_membership(user, studio):
    try:
        return StudioMember.objects.get(user=user, studio=studio)
    except StudioMember.DoesNotExist:
        return None

def resolve_studio(obj):
    if isinstance(obj, StudioMember):
        return obj.studio
    return obj 


class IsStudioMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        studio = resolve_studio(obj)
        membership = get_membership(request.user, studio)
        return membership is not None


class IsStudioAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        studio = resolve_studio(obj)
        membership = get_membership(request.user, studio)
        if membership is None:
            return False
        return membership.role == StudioMember.ADMIN


class IsProjectLead(BasePermission):
    def has_object_permission(self, request, view, obj):
        studio = resolve_studio(obj)
        membership = get_membership(request.user, studio)
        if membership is None:
            return False
        return membership.role in [StudioMember.ADMIN, StudioMember.LEAD]


class IsClientViewer(BasePermission):
    def has_object_permission(self, request, view, obj):
        studio = resolve_studio(obj)
        membership = get_membership(request.user, studio)
        if membership is None:
            return False
        if membership.role == StudioMember.CLIENT:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        return True