from django.urls import path
from . import views

urlpatterns = [
    path('places/', views.place_list, name='place-list'),
    path('places/<int:pk>/', views.place_detail, name='place-detail'),
    path('places/add/', views.place_add, name='place-add'),
    path('reviews/add/', views.review_add, name='review-add'),
]
