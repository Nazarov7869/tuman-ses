from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "first_name",
            "last_name",
            "birth_year",
            "address",
            "workplace",
            "service_type",
            "status",
            "payment_status",
            "payment_date",
            "payment_amount",
            "notes",
            "registered_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "payment_status",
            "payment_date",
            "payment_amount",
            "registered_at",
            "created_at",
        ]

    def validate_first_name(self, value):
        return self._non_empty(value, "Ism")

    def validate_last_name(self, value):
        return self._non_empty(value, "Familiya")

    def validate_address(self, value):
        return self._non_empty(value, "Manzil")

    def validate_workplace(self, value):
        return self._non_empty(value, "Ish joyi")

    @staticmethod
    def _non_empty(value, label):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(f"{label} kiritilishi shart")
        return value
