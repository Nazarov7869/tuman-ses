from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "last_name",
        "first_name",
        "service_type",
        "status",
        "payment_status",
        "payment_amount",
        "registered_at",
    )
    list_filter = ("status", "payment_status", "service_type")
    search_fields = ("first_name", "last_name", "address", "workplace")
    date_hierarchy = "registered_at"
