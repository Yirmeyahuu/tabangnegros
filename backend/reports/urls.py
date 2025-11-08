from django.urls import path
from .views import (
    EmergencyReportCreateView,
    EmergencyReportListView,
    EmergencyReportUpdateView
)

urlpatterns = [
    path('send/', EmergencyReportCreateView.as_view(), name='send_report'),
    path('all/', EmergencyReportListView.as_view(), name='all_reports'),
    path('update/<int:pk>/', EmergencyReportUpdateView.as_view(), name='update_report'),
]
