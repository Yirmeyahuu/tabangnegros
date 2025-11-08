from django.shortcuts import render
from rest_framework import generics
from rest_framework.throttling import AnonRateThrottle
from .models import EmergencyReport
from .serializers import EmergencyReportSerializer

# Custom throttle for emergency reports
class EmergencyReportThrottle(AnonRateThrottle):
    rate = '10/hour'  # 10 reports per hour per IP

# Create new distress report
class EmergencyReportCreateView(generics.CreateAPIView):
    queryset = EmergencyReport.objects.all()
    serializer_class = EmergencyReportSerializer
    throttle_classes = [EmergencyReportThrottle]

# Retrieve all reports (for dashboard)
class EmergencyReportListView(generics.ListAPIView):
    queryset = EmergencyReport.objects.all().order_by('-created_at')
    serializer_class = EmergencyReportSerializer

# Update status (for responders)
class EmergencyReportUpdateView(generics.UpdateAPIView):
    queryset = EmergencyReport.objects.all()
    serializer_class = EmergencyReportSerializer