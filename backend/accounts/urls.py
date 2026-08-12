from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    EmailTokenObtainPairView,
    MeView,
    RegisterView,
    UserDetailView,
    UserListCreateView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("users/", UserListCreateView.as_view(), name="auth-users"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="auth-user-detail"),
]
