from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.http import JsonResponse

# Health check view
def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('health/', health_check),  # Move health check to /health/
    
    # Serve React app for all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
]