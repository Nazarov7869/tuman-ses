from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from clients.permissions import IsMainOnly

from .serializers import (
    AdminCreateUserSerializer,
    AdminUpdateUserSerializer,
    AdminUserSerializer,
    ChangePasswordSerializer,
    EmailTokenObtainPairSerializer,
    MeSerializer,
    RegisterSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Public sign-up. Mirrors supabase.auth.signUp(): creates the account but
    grants no admin role — a main admin must assign one via /admin/."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class EmailTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class ChangePasswordView(APIView):
    """Settings page: any authenticated admin changes their own password."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Parol muvaffaqiyatli o'zgartirildi"})


class UserListCreateView(generics.ListCreateAPIView):
    """Settings > Foydalanuvchilar: only `main` may list admin accounts or
    create a new one with a role already attached (no separate /admin/ step)."""

    permission_classes = [permissions.IsAuthenticated, IsMainOnly]
    queryset = User.objects.select_related("role_entry").order_by("-date_joined")

    def get_serializer_class(self):
        return AdminCreateUserSerializer if self.request.method == "POST" else AdminUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """`main`-only: change an existing user's role/active status, or remove them."""

    permission_classes = [permissions.IsAuthenticated, IsMainOnly]
    queryset = User.objects.select_related("role_entry")

    def get_serializer_class(self):
        return AdminUpdateUserSerializer if self.request.method in ("PATCH", "PUT") else AdminUserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data)
