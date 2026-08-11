from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ClientViewSet, ServiceListView

router = DefaultRouter()
router.register("clients", ClientViewSet, basename="client")

urlpatterns = [
    path("services/", ServiceListView.as_view(), name="service-list"),
    path("", include(router.urls)),
]
