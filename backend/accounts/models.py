from django.conf import settings
from django.db import models


class Role(models.TextChoices):
    MAIN = "main", "Main"
    QABUL = "qabul", "Qabul"
    PAYMENT = "payment", "Payment"
    REGISTRANTS = "registrants", "Registrants"


class UserRole(models.Model):
    """Mirrors the Supabase `user_roles` table. One role per user, assigned by
    a main admin (via Django admin) after they self-register."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="role_entry"
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} -> {self.role}"
