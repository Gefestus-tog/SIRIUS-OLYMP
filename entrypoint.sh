#!/bin/sh
set -e

cd /app/project

python manage.py migrate --noinput
python manage.py collectstatic --noinput || true

if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser \
    --noinput \
    --username "$DJANGO_SUPERUSER_USERNAME" \
    --email "$DJANGO_SUPERUSER_EMAIL" || true
  python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u=User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').first(); u.set_password('$DJANGO_SUPERUSER_PASSWORD'); u.save()" || true
fi

exec python manage.py runserver 0.0.0.0:8000 