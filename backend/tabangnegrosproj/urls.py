from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from .views import serve_react

# Health check view
def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('health/', health_check),
]

# Serve static files
if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch all - serve React app (must be last)
urlpatterns += [
    re_path(r'^.*$', serve_react, name='react-app'),
]