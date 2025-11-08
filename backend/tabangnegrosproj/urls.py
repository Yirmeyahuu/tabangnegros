from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Add a health check view
def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('', health_check),  # Add this line for root URL
]