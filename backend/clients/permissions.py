from rest_framework.permissions import BasePermission

from accounts.models import Role


def _role_of(user):
    role_entry = getattr(user, "role_entry", None)
    return role_entry.role if role_entry else None


class HasAnyAdminRole(BasePermission):
    """Any of the four admin roles may read. Matches ProtectedRoute, which
    lets every authenticated admin view every panel's data (just not act on it)."""

    def has_permission(self, request, view):
        return _role_of(request.user) is not None


class IsMainOnly(BasePermission):
    def has_permission(self, request, view):
        return _role_of(request.user) == Role.MAIN


class IsQabulOrMain(BasePermission):
    def has_permission(self, request, view):
        return _role_of(request.user) in (Role.QABUL, Role.MAIN)


class IsPaymentOrMain(BasePermission):
    def has_permission(self, request, view):
        return _role_of(request.user) in (Role.PAYMENT, Role.MAIN)


class CanCompleteClient(BasePermission):
    """'Tugatish' (complete) is triggered from both the Qabul and Registrants
    panels in the frontend, so both roles (plus main) may call it."""

    def has_permission(self, request, view):
        return _role_of(request.user) in (Role.QABUL, Role.REGISTRANTS, Role.MAIN)
