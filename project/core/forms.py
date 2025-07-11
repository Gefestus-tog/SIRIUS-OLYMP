from django import forms
from .models import Place, Review

class PlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        fields = ['name', 'address', 'description', 'photo', 'category', 'lat', 'lng']

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['place', 'rating', 'comment']
