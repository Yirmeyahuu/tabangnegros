from rest_framework import serializers
from .models import EmergencyReport

class EmergencyReportSerializer(serializers.ModelSerializer):
    photo1_url = serializers.ReadOnlyField()
    photo2_url = serializers.ReadOnlyField()
    
    class Meta:
        model = EmergencyReport
        fields = [
            'id', 
            'latitude', 
            'longitude', 
            'accuracy', 
            'message', 
            'device_id', 
            'status',
            'created_at',
            'updated_at',
            'photo1',
            'photo2',
            'photo1_url',
            'photo2_url'
        ]
        read_only_fields = ('created_at', 'updated_at', 'photo1_url', 'photo2_url')
    
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