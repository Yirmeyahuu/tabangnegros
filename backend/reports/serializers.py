from rest_framework import serializers
from .models import EmergencyReport

class EmergencyReportSerializer(serializers.ModelSerializer):
    photo1_url = serializers.SerializerMethodField()
    photo2_url = serializers.SerializerMethodField()
    
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
    
    def get_photo1_url(self, obj):
        if obj.photo1:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo1.url)
        return None
    
    def get_photo2_url(self, obj):
        if obj.photo2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo2.url)
        return None