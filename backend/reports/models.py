from django.db import models
from django.core.validators import FileExtensionValidator
from cloudinary.models import CloudinaryField

class EmergencyReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('acknowledged', 'Acknowledged'),
        ('responding', 'Responding'),
        ('resolved', 'Resolved'),
    ]
    
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy = models.FloatField(null=True, blank=True)
    message = models.TextField(blank=True)
    device_id = models.CharField(max_length=255)
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Cloudinary image fields
    photo1 = CloudinaryField('image', blank=True, null=True, folder='tabang_negros/reports')
    photo2 = CloudinaryField('image', blank=True, null=True, folder='tabang_negros/reports')
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} - {self.status}"
    
    @property
    def photo1_url(self):
        """Return the Cloudinary URL for photo1"""
        if self.photo1:
            return self.photo1.url
        return None
    
    @property
    def photo2_url(self):
        """Return the Cloudinary URL for photo2"""
        if self.photo2:
            return self.photo2.url
        return None