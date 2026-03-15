from django.contrib.auth.models import User
try:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.save()
    print('Admin password reset to: admin123')
except User.DoesNotExist:
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created with password: admin123')

user = User.objects.filter(is_superuser=False).first()
if user:
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f'Promoted {user.username} to superuser/staff')
