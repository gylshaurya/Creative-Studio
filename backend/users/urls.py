from django.urls import path
from .views import RegisterView, MeView
from .views import UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('me/', MeView.as_view()),
    path('me/', UserProfileView.as_view(), name='user-profile'),
]