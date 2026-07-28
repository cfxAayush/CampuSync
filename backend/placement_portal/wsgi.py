import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement_portal.settings')
application = get_wsgi_application()

try:
    from seed import seed_database
    seed_database()
except Exception as e:
    print(f"[!] WSGI seed info: {e}")
