from django.http import HttpResponse
import os
from django.conf import settings

def serve_react(request):
    """Serve the React app's index.html"""
    try:
        with open(os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html')) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("React app not found. Run 'npm run build' first.", status=404)