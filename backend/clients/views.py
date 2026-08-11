from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Client
from .permissions import (
    CanCompleteClient,
    HasAnyAdminRole,
    IsMainOnly,
    IsPaymentOrMain,
    IsQabulOrMain,
)
from .serializers import ClientSerializer
from .services import SERVICE_CATEGORIES, get_service_price


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    search_fields = ["first_name", "last_name", "address", "workplace", "service_type"]
    ordering_fields = ["registered_at", "payment_date", "created_at"]
    ordering = ["-registered_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update"):
            permission_classes = [IsAuthenticated, IsQabulOrMain]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, IsMainOnly]
        elif self.action in ("mark_paid", "reject_payment"):
            permission_classes = [IsAuthenticated, IsPaymentOrMain]
        elif self.action == "complete":
            permission_classes = [IsAuthenticated, CanCompleteClient]
        else:
            permission_classes = [IsAuthenticated, HasAnyAdminRole]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        payment_status = self.request.query_params.get("payment_status")
        status_param = self.request.query_params.get("status")
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(status=Client.Status.NEW, payment_status=Client.PaymentStatus.PENDING)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.payment_status != Client.PaymentStatus.PENDING:
            raise PermissionDenied("To'lovi tasdiqlangan mijozni tahrirlab bo'lmaydi")
        serializer.save()

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        client = self.get_object()
        client.payment_amount = get_service_price(client.service_type)
        client.payment_status = Client.PaymentStatus.PAID
        client.payment_date = timezone.now()
        client.status = Client.Status.SEEN
        client.save()
        return Response(ClientSerializer(client).data)

    @action(detail=True, methods=["post"])
    def reject_payment(self, request, pk=None):
        client = self.get_object()
        client.payment_status = Client.PaymentStatus.REJECTED
        client.status = Client.Status.NEW
        client.save()
        return Response(ClientSerializer(client).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        client = self.get_object()
        client.status = Client.Status.DONE
        client.save()
        return Response(ClientSerializer(client).data)


class ServiceListView(APIView):
    """Read-only service catalogue (categories + prices) so the frontend
    doesn't need to duplicate SERVICE_CATEGORIES from validations.ts."""

    permission_classes = [IsAuthenticated, HasAnyAdminRole]

    def get(self, request):
        return Response(SERVICE_CATEGORIES)
