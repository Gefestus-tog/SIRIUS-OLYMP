﻿# SIRIUS Django Project

## Запуск в Docker

1. Соберите и запустите контейнер:

```bash
docker-compose up --build
```

2. Приложение будет доступно на http://localhost:8000/static/index.html

3. Админ панель будет на http://localhost:8000/admin

## Остановка

```bash
docker-compose down
```

## Применение миграций (если нужно вручную)

```bash
docker-compose exec web python manage.py migrate
```

## Создание суперпользователя

```bash
docker-compose exec web python manage.py createsuperuser
```
