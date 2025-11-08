from django.db import models

class EmergencyReport(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy = models.FloatField(null=True, blank=True)  # optional
    message = models.TextField(blank=True)
    device_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=50,
        default="Pending",
        choices=[
            ("Pending", "Pending"),
            ("In Progress", "In Progress"),
            ("Resolved", "Resolved"),
        ]
    )

    def __str__(self):
        return f"Report {self.id} - {self.status}"
