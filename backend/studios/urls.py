from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import StudioViewSet, StudioMemberViewSet

# DefaultRouter auto-generates these URLs for StudioViewSet:
# GET  /studios/         -> list all studios
# POST /studios/         -> create a studio
# GET  /studios/{id}/    -> get one studio
# PUT  /studios/{id}/    -> update a studio
# DELETE /studios/{id}/  -> delete a studio
router = DefaultRouter()
router.register('studios', StudioViewSet, basename='studio')

# Nested router generates member URLs under studios:
# GET  /studios/{studio_pk}/members/        -> list members
# POST /studios/{studio_pk}/members/        -> invite a member
# DELETE /studios/{studio_pk}/members/{id}/ -> remove a member
studios_router = nested_routers.NestedDefaultRouter(router, 'studios', lookup='studio')
studios_router.register('members', StudioMemberViewSet, basename='studio-members')

urlpatterns = router.urls + studios_router.urls