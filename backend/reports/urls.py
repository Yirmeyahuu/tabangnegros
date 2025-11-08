from django.urls import path
from . import views

from .views import (
    EmergencyReportCreateView,
    EmergencyReportListView,
    EmergencyReportUpdateView,
    get_active_reports,
    get_reports_by_area,
    update_report_status,
    admin_login,
    admin_logout
)

urlpatterns = [
    path('send/', EmergencyReportCreateView.as_view(), name='send_report'),
    path('all/', EmergencyReportListView.as_view(), name='all_reports'),
    path('update/<int:pk>/', EmergencyReportUpdateView.as_view(), name='update_report'),
    path('active/', get_active_reports, name='active_reports'),
    path('nearby/', get_reports_by_area, name='nearby_reports'),
    path('<int:report_id>/status/', update_report_status, name='update_status'),

    # Auth endpoints
    path('auth/login/', admin_login, name='admin-login'),  # Changed
    path('auth/logout/', admin_logout, name='admin-logout'),  # Changed
]