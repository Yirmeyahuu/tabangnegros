from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from .models import EmergencyReport
from .serializers import EmergencyReportSerializer
import math
from django.http import HttpResponse
import os
from django.conf import settings

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

# Get active reports
@api_view(['GET'])
def get_active_reports(request):
    """Get all pending/active help requests"""
    active_reports = EmergencyReport.objects.filter(
        status__in=['pending', 'acknowledged', 'responding']
    )
    serializer = EmergencyReportSerializer(active_reports, many=True)
    return Response(serializer.data)

# Get reports by area
@api_view(['GET'])
def get_reports_by_area(request):
    """Get reports within a certain radius"""
    lat = float(request.GET.get('lat', 0))
    lng = float(request.GET.get('lng', 0))
    radius_km = float(request.GET.get('radius', 50))  # default 50km
    
    # Simple bounding box calculation
    # For more accuracy, use Haversine formula
    lat_range = radius_km / 111  # 1 degree ≈ 111km
    lng_range = radius_km / (111 * abs(math.cos(math.radians(lat))))
    
    reports = EmergencyReport.objects.filter(
        latitude__range=(lat - lat_range, lat + lat_range),
        longitude__range=(lng - lng_range, lng + lng_range),
        status__in=['pending', 'acknowledged', 'responding']
    )
    
    serializer = EmergencyReportSerializer(reports, many=True)
    return Response(serializer.data)

# Update report status
@api_view(['PATCH'])
def update_report_status(request, report_id):
    """Update report status"""
    try:
        report = EmergencyReport.objects.get(id=report_id)
        report.status = request.data.get('status', report.status)
        report.save()
        serializer = EmergencyReportSerializer(report)
        return Response(serializer.data)
    except EmergencyReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)
    

def serve_react(request):
    """Serve the React app's index.html"""
    try:
        with open(os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html')) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("React app not found. Run 'npm run build' first.", status=404)