from django.db import models
from django.utils import timezone



class Place(models.Model):
    MUSEUM = 'Museum'
    CAFE = 'Cafe'
    RESTAURANT = 'Restaurant'
    MONUMENT = 'Monument'
    SHOPPING = 'Shopping'
    THEATER = 'Theater'
    CINEMA = 'Cinema'
    GALLERY = 'Gallery'
    HOTEL = 'Hotel'
    OTHER = 'Other'

    CATEGORYS = [
        (MUSEUM, 'Музеи'),
        (CAFE, 'Кафе'),
        (RESTAURANT, 'Рестораны'),
        (MONUMENT, 'Памятники'),
        (SHOPPING, 'Торговые центры'),
        (THEATER, 'Театры'),
        (CINEMA, 'Кинотеатры'),
        (GALLERY, 'Галереи'),
        (HOTEL, 'Отели'),
        (OTHER, 'Другие места'),
    ]


    name = models.CharField(
        max_length=200,
        verbose_name="Name"
    )
    address = models.CharField(
        max_length=255,
        verbose_name="Address",
        unique=True
    )
    description = models.TextField(
        verbose_name="Description",
        blank=True
    )
    photo = models.ImageField(
        upload_to='places/',
        verbose_name="Photo",
        blank=True,
        null=True
    )
    category = models.CharField(
        max_length=255,
        choices=CATEGORYS,
        default=OTHER,
        verbose_name="Category",
        blank=True,
        null=True
    )
    
    class Meta:
        verbose_name = "Место"
        verbose_name_plural = "Места"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['address']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.address})"

    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return None  # Можно вернуть 0, если так удобнее
        return sum([review.rating for review in reviews]) / reviews.count()

class Review(models.Model):
    """Модель отзыва о месте"""
    RATING_CHOICES = [
        (1, '1 - Ужасно'),
        (2, '2 - Плохо'),
        (3, '3 - Удовлетворительно'),
        (4, '4 - Хорошо'),
        (5, '5 - Отлично'),
    ]
    
    place = models.ForeignKey(
        Place,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Place"
    )
    rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        verbose_name="Rating"
    )
    comment = models.TextField(
        verbose_name="Comment",
        blank=True
    )
    date = models.DateTimeField(
        verbose_name="Date",
        default=timezone.now,
        editable=False
    )
    
    class Meta:
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ['-date']
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name="valid_rating_range"
            )
        ]
    
    def __str__(self):
        return f"Review of {self.place.name} ({self.rating}/5)"