from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from .views import serve_react

def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('health/', health_check),
    
    # Serve media files (uploaded photos) - works in production too
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Development-specific settings
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch-all route for React app (MUST BE LAST)
urlpatterns += [
    re_path(r'^.*$', serve_react, name='react-app'),
]