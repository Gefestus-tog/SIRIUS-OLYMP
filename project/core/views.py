from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from .models import Place, Review
from .forms import PlaceForm, ReviewForm

# Create your views here.

# Список мест (GET, с фильтрацией по категории)
def place_list(request):
    category = request.GET.get('category')
    places = Place.objects.all()
    if category:
        places = places.filter(category=category)
    data = [
        {
            'id': place.id,
            'name': place.name,
            'address': place.address,
            'description': place.description,
            'photo': place.photo.url if place.photo else None,
            'category': place.category,
            'average_rating': place.average_rating(),
        }
        for place in places
    ]
    return JsonResponse({'places': data})

# Детали места + отзывы (GET)
def place_detail(request, pk):
    place = get_object_or_404(Place, pk=pk)
    reviews = place.reviews.all()
    data = {
        'id': place.id,
        'name': place.name,
        'address': place.address,
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
def place_add(request):
    if request.method == 'POST':
        form = PlaceForm(request.POST, request.FILES)
        if form.is_valid():
            place = form.save()
            return JsonResponse({'success': True, 'place_id': place.id})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return HttpResponseBadRequest('Only POST allowed')

# Добавление отзыва (POST)
def review_add(request):
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save()
            return JsonResponse({'success': True, 'review_id': review.id})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return HttpResponseBadRequest('Only POST allowed')
