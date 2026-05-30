from rest_framework.permissions import BasePermission
from .models import StudioMember


def get_membership(user, studio_id):
    try:
        return StudioMember.objects.get(user=user, studio_id=studio_id)
    except StudioMember.DoesNotExist:
        return None


def resolve_studio_id(view, obj=None):
    """Extract studio_id from view kwargs or from the object itself."""
    if obj is not None:
        if isinstance(obj, StudioMember):
            return obj.studio_id
        if hasattr(obj, 'studio_id'):
            return obj.studio_id
        if hasattr(obj, 'id'):
            return obj.id
    return view.kwargs.get('studio_pk') or view.kwargs.get('pk')


class IsStudioMember(BasePermission):
    def has_permission(self, request, view):
        studio_id = resolve_studio_id(view)
        if not studio_id:
            return True  # Let has_object_permission handle it
        return get_membership(request.user, studio_id) is not None

    def has_object_permission(self, request, view, obj):
        studio_id = resolve_studio_id(view, obj)
        return get_membership(request.user, studio_id) is not None


class IsStudioAdmin(BasePermission):
    def has_permission(self, request, view):
        studio_id = resolve_studio_id(view)
        if not studio_id:
            return True  # Let has_object_permission handle it
        membership = get_membership(request.user, studio_id)
        return membership is not None and membership.role == StudioMember.ADMIN

    def has_object_permission(self, request, view, obj):
        studio_id = resolve_studio_id(view, obj)
        membership = get_membership(request.user, studio_id)
        return membership is not None and membership.role == StudioMember.ADMIN


class IsProjectLead(BasePermission):
    def has_permission(self, request, view):
        studio_id = resolve_studio_id(view)
        if not studio_id:
            return True
        membership = get_membership(request.user, studio_id)
        return membership is not None and membership.role in [StudioMember.ADMIN, StudioMember.LEAD]

    def has_object_permission(self, request, view, obj):
        studio_id = resolve_studio_id(view, obj)
        membership = get_membership(request.user, studio_id)
        return membership is not None and membership.role in [StudioMember.ADMIN, StudioMember.LEAD]


class IsClientViewer(BasePermission):
    def has_permission(self, request, view):
        studio_id = resolve_studio_id(view)
        if not studio_id:
            return True
        membership = get_membership(request.user, studio_id)
        if membership is None:
            return False
        if membership.role == StudioMember.CLIENT:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        return True

    def has_object_permission(self, request, view, obj):
        studio_id = resolve_studio_id(view, obj)
        membership = get_membership(request.user, studio_id)
        if membership is None:
            return False
        if membership.role == StudioMember.CLIENT:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        return True