from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

# Health check view
def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('health/', health_check),
    
    # Catch all other routes and serve React app
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)