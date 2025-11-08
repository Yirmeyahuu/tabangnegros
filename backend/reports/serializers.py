from rest_framework import serializers
from .models import EmergencyReport

class EmergencyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyReport
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Invalid latitude")
        return value
    
    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Invalid longitude")
        return value
    
    def validate_message(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Message too short")
        return value