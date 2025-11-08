from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from .views import serve_react

def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('health/', health_check),
]

# Serve static files
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch all EXCEPT static files - serve React app
urlpatterns += [
    re_path(r'^(?!assets/|static/|.*\.(js|css|svg|png|jpg|webp|woff|woff2|ico|json)).*$', serve_react, name='react-app'),
]