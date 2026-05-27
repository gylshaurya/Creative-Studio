from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import StudioViewSet, StudioMemberViewSet

router = DefaultRouter()
router.register('studios', StudioViewSet, basename='studio')

studios_router = nested_routers.NestedDefaultRouter(router, 'studios', lookup='studio')
studios_router.register('members', StudioMemberViewSet, basename='studio-members')

urlpatterns = router.urls + studios_router.urls