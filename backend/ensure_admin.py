import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'autoexpense.settings')
django.setup()

User = get_user_model()

def ensure_superuser():
    username = os.environ.get('WEB_ADMIN_USERNAME', 'admin@example.com')
    email = os.environ.get('WEB_ADMIN_EMAIL', 'admin@example.com')
    password = os.environ.get('WEB_ADMIN_PASSWORD', 'admin123')

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser: {username}")
        User.objects.create_superuser(username, email, password)
    else:
        print(f"Superuser {username} already exists.")

if __name__ == '__main__':
    ensure_superuser()
