from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from .models import Place, Review
from .forms import PlaceForm, ReviewForm
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


# Create your views here.

# Список мест (GET, с фильтрацией по категории)
@method_decorator(csrf_exempt, name='dispatch')
def place_list(request):
    authentication_classes = []  # Отключаем аутентификацию
    permission_classes = []     # Отключаем проверку прав
    category = request.GET.get('category')
    places = Place.objects.all()
    if category:
        places = places.filter(category=category)
    data = [
        {
            'id': place.id,
            'name': place.name,
            'address': place.address,
            'lat': place.lat,
            'lng': place.lng,
            'description': place.description,
            'photo': place.photo.url if place.photo else None,
            'category': place.category,
            'average_rating': place.average_rating(),
        }
        for place in places
    ]
    return JsonResponse({'places': data})

# Детали места + отзывы (GET)
@method_decorator(csrf_exempt, name='dispatch')
def place_detail(request, pk):
    authentication_classes = []  # Отключаем аутентификацию
    permission_classes = []     # Отключаем проверку прав
    place = get_object_or_404(Place, pk=pk)
    reviews = place.reviews.all()
    data = {
        'id': place.id,
        'name': place.name,
        'address': place.address,
        'lat': place.lat,
        'lng': place.lng,
        'description': place.description,
        'photo': place.photo.url if place.photo else None,
        'category': place.category,
        'average_rating': place.average_rating(),
        'reviews': [
            {
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'date': review.date,
            }
            for review in reviews
        ]
    }
    return JsonResponse(data)

# Добавление места (POST + form)
@method_decorator(csrf_exempt, name='dispatch')
def place_add(request):
    authentication_classes = []  # Отключаем аутентификацию
    permission_classes = []     # Отключаем проверку прав
    if request.method == 'POST':
        print("POST data:", request.POST)
        print("FILES data:", request.FILES)
        
        # Проверяем, существует ли уже место с таким адресом
        address = request.POST.get('address')
        if address and Place.objects.filter(address=address).exists():
            return JsonResponse({
                'success': False, 
                'errors': {'address': ['Место с таким адресом уже существует.']}
            }, status=400)
        
        form = PlaceForm(request.POST, request.FILES)
        if form.is_valid():
            place = form.save()
            return JsonResponse({'success': True, 'place_id': place.id})
        else:
            print("Form errors:", form.errors)
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return HttpResponseBadRequest('Only POST allowed')

# Добавление отзыва (POST)
@method_decorator(csrf_exempt, name='dispatch')
def review_add(request):
    authentication_classes = []  # Отключаем аутентификацию
    permission_classes = []     # Отключаем проверку прав
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save()
            return JsonResponse({'success': True, 'review_id': review.id})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return HttpResponseBadRequest('Only POST allowed')
