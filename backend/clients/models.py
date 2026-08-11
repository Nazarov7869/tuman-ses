from datetime import date

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


def validate_birth_year_range(value):
    year = int(value)
    if year < 1900 or year > 2100:
        raise ValidationError("Tug'ilgan yil 1900 va 2100 orasida bo'lishi kerak")


class Client(models.Model):
    class Status(models.TextChoices):
        NEW = "yangi", "Yangi"
        SEEN = "ko'rildi", "Ko'rildi"
        DONE = "tugatildi", "Tugatildi"

    class PaymentStatus(models.TextChoices):
        PENDING = "kutilmoqda", "Kutilmoqda"
        PAID = "tolangan", "To'langan"
        REJECTED = "rad_etilgan", "Rad etilgan"

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_year = models.CharField(
        max_length=4,
        validators=[
            RegexValidator(r"^\d{4}$", "Tug'ilgan yil 4 ta raqamdan iborat bo'lishi kerak"),
            validate_birth_year_range,
        ],
    )
    address = models.CharField(max_length=500)
    workplace = models.CharField(max_length=200)
    service_type = models.CharField(max_length=255, default="Ichak infeksiyasi")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    payment_date = models.DateTimeField(null=True, blank=True)
    payment_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, default=0
    )
    notes = models.TextField(null=True, blank=True)
    registered_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-registered_at"]

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    def clean(self):
        for field_name in ("first_name", "last_name", "address", "workplace"):
            if not getattr(self, field_name).strip():
                raise ValidationError({field_name: "Bu maydon bo'sh bo'lishi mumkin emas"})
        if self.payment_amount is not None and self.payment_amount < 0:
            raise ValidationError({"payment_amount": "To'lov miqdori manfiy bo'lishi mumkin emas"})
