# places/admin.py
from django.contrib import admin
from .models import  Place, Review
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

# Регистрация моделей через цикл
# models_to_register = [Category, Place, Review]

# for model in models_to_register:
#     admin.site.register(model)

# Улучшенная настройка админ-панели

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'category', 'display_photo', 'review_count', 'average_rating')
    list_filter = ('category',)
    search_fields = ('name', 'address', 'category__name')
    readonly_fields = ('display_photo',)
    fieldsets = (
        (None, {
            'fields': ('name', 'address', 'category')
        }),
        (_('Детали'), {
            'fields': ('description', 'photo', 'display_photo'),
            'classes': ('collapse',)
        }),
    )
    
    def display_photo(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="100" />', obj.photo.url)
        return _("Нет фото")
    display_photo.short_description = _('Фото')
    
    def review_count(self, obj):
        return obj.reviews.count()
    review_count.short_description = _('Отзывов')
    
    def average_rating(self, obj):
        from django.db.models import Avg
        result = obj.reviews.aggregate(avg_rating=Avg('rating'))
        return round(result['avg_rating'], 1) if result['avg_rating'] else _('Нет оценок')
    average_rating.short_description = _('Средний рейтинг')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('place', 'rating_stars', 'short_comment', 'date')
    list_filter = ('rating', 'date')
    search_fields = ('place__name', 'comment')
    date_hierarchy = 'date'
    list_per_page = 20
    
    def rating_stars(self, obj):
        full_star = '★'
        empty_star = '☆'
        return full_star * obj.rating + empty_star * (5 - obj.rating)
    rating_stars.short_description = _('Рейтинг')
    
    def short_comment(self, obj):
        return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
    short_comment.short_description = _('Комментарий')