from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from .views import serve_react

def health_check(request):
    return JsonResponse({"status": "ok", "service": "Tabang Negros API"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
    path('health/', health_check),
    
    # Catch all - serve React app (WhiteNoise handles static files)
    re_path(r'^.*$', serve_react, name='react-app'),
]