from django.urls import path, include

urlpatterns = [
    path('api/reports/', include('reports.urls')),
]

