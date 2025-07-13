// Конфигурация приложения
const BASE_URL = 'http://localhost:8000'
const API_BASE_URL = 'http://localhost:8000/api';
const MAP_INITIAL_VIEW = [43.402, 39.996];
const MAP_INITIAL_ZOOM = 13.77;

// Инициализация карты
const map = L.map('map').setView(MAP_INITIAL_VIEW, MAP_INITIAL_ZOOM);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Глобальные переменные
let markers = {};
let currentCategory = 'AllCATEGORYS';

// Элементы DOM
const DOM = {
    addButton: document.getElementById('add-button'),
    addForm: document.getElementById('add-marker-form'),
    closeFormBtn: document.getElementById('close-form-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    addBtn: document.getElementById('add-btn'),
    fileInput: document.getElementById('marker-photo'),
    fileName: document.getElementById('file-name'),
    fileBtnText: document.getElementById('file-btn-text'),
    previewContainer: document.getElementById('preview-container'),
    previewImage: document.getElementById('preview-image'),
    placesContainer: document.getElementById('places-container'),
    placeDetailContainer: document.getElementById('place-detail-container'),
    backButton: document.getElementById('back-button'),
    detailTitle: document.getElementById('detail-title'),
    detailPhoto: document.getElementById('detail-photo'),
    detailRating: document.getElementById('detail-rating'),
    detailAddress: document.getElementById('detail-address'),
    detailDescription: document.getElementById('detail-description'),
    reviewsList: document.getElementById('reviews-list'),
    reviewText: document.getElementById('review-text'),
    submitReviewButton: document.getElementById('submit-review'),
    addressInput: document.getElementById('address-input'),
    markerTitle: document.getElementById('marker-title'),
    markerDescription: document.getElementById('marker-description'),
    markerCategory: document.getElementById('marker-category')
};

// Цвета и иконки категорий
const categoryColors = {
    'Museum': '#8dc157',
    'Cafe': '#ffa15e',
    'Restaurant': '#ffa15e',
    'Monument': '#8dc157',
    'Shopping': '#60a8f0',
    'Theater': '#8dc157',
    'Cinema': '#8dc157',
    'Gallery': '#8dc157',
    'Hotel': '#9c89fa',
    'Park': '#8dc157',
    'Other': '#60a8f0'
};

const categoryIcons = {
    'Museum': 'fa-landmark',
    'Cafe': 'fa-coffee',
    'Restaurant': 'fa-utensils',
    'Monument': 'fa-monument',
    'Shopping': 'fa-shopping-cart',
    'Theater': 'fa-theater-masks',
    'Cinema': 'fa-film',
    'Gallery': 'fa-image',
    'Hotel': 'fa-hotel',
    'Park': 'fa-tree',
    'Other': 'fa-ellipsis'
};

// Инициализация приложения
function initApp() {
    setupEventListeners();
    loadMarkers();
    setRating(0);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма добавления маркера
    DOM.addButton.addEventListener('click', () => DOM.addForm.showModal());
    DOM.closeFormBtn.addEventListener('click', () => closeForm());
    DOM.cancelBtn.addEventListener('click', () => closeForm());
    DOM.fileInput.addEventListener('change', handleFileUpload);
    DOM.addBtn.addEventListener('click', addMarker);
    
    // Категории
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', handleCategoryClick);
    });
    
    // Детали места
    DOM.backButton.addEventListener('click', showPlacesList);
    DOM.submitReviewButton.addEventListener('click', submitReview);
    
    // Звезды рейтинга
    document.querySelectorAll('.rating-stars i').forEach(star => {
        star.addEventListener('click', handleRatingClick);
    });
}

// Закрытие формы
function closeForm() {
    DOM.addForm.close();
    resetFileInput();
}

// Обработка загрузки файла
function handleFileUpload() {
    if (!this.files?.[0]) return;
    
    const file = this.files[0];
    
    // Проверка типа и размера файла
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        resetFileInput();
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер 5MB');
        resetFileInput();
        return;
    }
    
    DOM.fileName.textContent = file.name;
    DOM.fileBtnText.textContent = 'Изменить файл';
    
    const reader = new FileReader();
    reader.onload = e => {
        DOM.previewImage.src = e.target.result;
        DOM.previewContainer.style.display = 'block';
    }
    reader.readAsDataURL(file);
}

// Сброс загрузки файла
function resetFileInput() {
    DOM.fileInput.value = '';
    DOM.fileName.textContent = '';
    DOM.fileBtnText.textContent = 'Выберите файл';
    DOM.previewContainer.style.display = 'none';
    DOM.previewImage.src = '';
}

// Обработка клика по категории
function handleCategoryClick() {
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.remove('active');
    });
    
    this.classList.add('active');
    currentCategory = this.dataset.category;
    
    if (currentCategory === 'AllCATEGORYS') {
        loadMarkers();
    } else {
        loadPlacesByCategory(currentCategory);
    }
}

// Обработка клика по звезде рейтинга
function handleRatingClick() {
    const rating = parseInt(this.dataset.rating);
    setRating(rating);
}

// Установка рейтинга
function setRating(rating) {
    const stars = document.querySelectorAll('.rating-stars i');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far', 'fa-star-half-alt');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas', 'fa-star-half-alt');
            star.classList.add('far');
        }
    });
    
    document.querySelector('.rating-stars').dataset.rating = rating;
}

// Форматирование даты
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Отрисовка звезд рейтинга
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else if (halfStar && i === fullStars + 1) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    
    return starsHtml;
}

// Загрузка маркеров с сервера
async function loadMarkers() {
    try {
        const response = await axios.get(`${API_BASE_URL}/places/`);
        const places = response.data.places;
        
        // Очистка существующих маркеров
        clearMarkers();
        
        // Очистка списка мест
        DOM.placesContainer.innerHTML = '';
        
        // Добавление маркеров
        places.forEach(place => {
            if (place.lat && place.lng) {
                const photoUrl = place.photo 
                    ? `${BASE_URL}${place.photo}` 
                    : null;
                
                const category = Array.isArray(place.category) 
                    ? place.category[0] || 'Other' 
                    : place.category;
                
                markers[place.id] = createMarker(
                    place.lat,
                    place.lng,
                    place.address,
                    place.name,
                    place.description,
                    category,
                    photoUrl,
                    false,
                    place.id,
                    place.average_rating
                );
            }
        });
        
        // Центрирование карты
        const markerIds = Object.keys(markers);
        if (markerIds.length > 0) {
            const lastId = markerIds[markerIds.length - 1];
            const lastMarker = markers[lastId];
        }
        
    } catch (error) {
        console.error('Ошибка загрузки маркеров:', error);
        DOM.placesContainer.innerHTML = '<div class="no-places">Ошибка загрузки данных</div>';
    }
}

// Загрузка мест по категории
async function loadPlacesByCategory(category) {
    try {
        const url = category === 'All' 
            ? `${API_BASE_URL}/places/` 
            : `${API_BASE_URL}/places/?category=${category}`;
        
        const response = await axios.get(url);
        displayPlaces(response.data.places);
    } catch (error) {
        console.error('Ошибка загрузки мест:', error);
        DOM.placesContainer.innerHTML = '<div class="no-places">Ошибка загрузки данных</div>';
    }
}

// Отображение мест в интерфейсе
function displayPlaces(places) {
    DOM.placesContainer.innerHTML = '';
    
    if (!places || places.length === 0) {
        DOM.placesContainer.innerHTML = '<div class="no-places">Нет мест в этой категории</div>';
        return;
    }
    
    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        placeCard.dataset.id = place.id;
        
        const photoHtml = place.photo
            ? `<img src="${BASE_URL}${place.photo}" class="place-photo" alt="${place.name}">`
            : '';
        
        placeCard.innerHTML = `
            <div class="place-header">
                <div class="place-name">${place.name}</div>
                <div class="place-rating">${place.average_rating?.toFixed(1) || 'Нет оценок'}</div>
            </div>
            ${photoHtml}
            <div class="place-address">${place.address}</div>
        `;
        
        placeCard.addEventListener('click', () => {
            loadPlaceDetails(place.id);
            centerMapOnPlace(place.id);
        });
        
        DOM.placesContainer.appendChild(placeCard);
    });
}

// Центрирование карты на месте
function centerMapOnPlace(placeId) {
    const marker = markers[placeId];
    if (marker) {
        map.setView([marker.lat, marker.lon], 15);
        marker.marker.openPopup();
    }
}

// Очистка маркеров
function clearMarkers() {
    for (const id in markers) {
        map.removeLayer(markers[id].marker);
    }
    markers = {};
}

// Создание маркера
function createMarker(lat, lon, address, title, description, category = 'Other', 
                     photoUrl = null, center = true, id, avg_rating) {
    
    // Определение цвета и иконки
    const color = categoryColors[category] || '#60a8f0';
    const iconClass = categoryIcons[category] || 'fa-map-marker-alt';
    
    // Создание кастомной иконки
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="background: ${color}; 
                width: 32px; height: 32px; border-radius: 50%; 
                display: flex; justify-content: center; align-items: center; 
                color: white; font-weight: bold; border: 2px solid white; 
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
                <i class="fas ${iconClass}"></i>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    
    // Создание маркера
    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    
    // Формирование контента для popup
    let popupContent = `
        <div style="min-width: 250px;">
            <h3 style="margin: 0 0 10px; color: ${color}; font-size: 18px;">
                <i class="fas ${iconClass}" style="margin-right: 8px;"></i>${title}
            </h3>
            <p style="margin-bottom: 5px;"><strong>Адрес:</strong> ${address}</p>
            <p style="margin-bottom: 10px; color: #555;">${description || 'Описание отсутствует'}</p>
    `;
    
    if (photoUrl) {
        popupContent += `
            <div style="margin-bottom: 10px;">
                <img src="${photoUrl}" style="width:100%; max-height:150px; object-fit:cover; border-radius:8px;">
            </div>
        `;
    }
    
    popupContent += `
        <div style="display: flex; justify-content: flex-end; align-items: center; 
            gap: 8px; font-size: 15px; color: #555;">
            <span style="font-weight: 500;">Рейтинг:</span>
            <span style="color: #ffc107; font-weight: bold;">
                ${avg_rating ? avg_rating.toFixed(1) : 'Нет оценок'}
            </span>
        </div>
    </div>
    `;
    
    // Привязка popup к маркеру
    marker.bindPopup(popupContent);
    
    // Центрирование карты при необходимости
    if (center) {
        marker.openPopup();
        map.setView([lat, lon], 15);
    }
    
    // Обработчик клика на маркере
    marker.on('click', () => loadPlaceDetails(id));
    
    // Возврат объекта маркера
    return {
        marker,
        address,
        title,
        description,
        category,
        photo: photoUrl,
        lat,
        lon,
        rating: avg_rating,
        id
    };
}

// Добавление нового маркера
async function addMarker() {
    // Получение данных из формы
    const address = DOM.addressInput.value;
    const title = DOM.markerTitle.value || address;
    const description = DOM.markerDescription.value || '';
    const category = DOM.markerCategory.value;
    const photoFile = DOM.fileInput.files[0];
    
    // Валидация
    if (!address || !title || !category) {
        alert('Заполните обязательные поля: адрес, название и категория');
        return;
    }
    
    try {
        // Геокодирование адреса
        const coords = await geocodeAddress(address);
        if (!coords) {
            alert('Не удалось определить координаты по указанному адресу');
            return;
        }
        
        // Подготовка данных для отправки
        const formData = new FormData();
        formData.append('name', title);
        formData.append('address', address);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('lat', coords.lat);
        formData.append('lng', coords.lon);
        
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        
        // Отправка данных на сервер
        const response = await axios.post(
            `${API_BASE_URL}/places/add/`, 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Обработка ответа
        if (response.data.success) {
            const placeId = response.data.place_id;
            const photoUrl = response.data.photo_url 
                ? `${BASE_URL}${response.data.photo_url}` 
                : null;
            
            // Добавление маркера на карту
            markers[placeId] = createMarker(
                coords.lat,
                coords.lon,
                address,
                title,
                description,
                category,
                photoUrl,
                true,
                placeId
            );
            
            // Закрытие формы
            closeForm();
        } else {
            // Обработка ошибок валидации
            let errorMessage = 'Ошибка при добавлении места:\n';
            for (const field in response.data.errors) {
                errorMessage += `${field}: ${response.data.errors[field].join(', ')}\n`;
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Ошибка добавления места:', error);
        alert('Произошла ошибка при добавлении места');
    }
}

// Геокодирование адреса
async function geocodeAddress(address) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                format: 'json',
                q: address,
                limit: 1
            }
        });
        
        if (response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Ошибка геокодирования:', error);
        return null;
    }
}

// Загрузка деталей места
async function loadPlaceDetails(placeId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/places/${placeId}/`);
        const place = response.data;
        
        // Заполнение данных
        DOM.detailTitle.textContent = place.name;
        DOM.detailAddress.textContent = place.address;
        DOM.detailDescription.textContent = place.description || 'Описание отсутствует';
        
        // Фото
        if (place.photo) {
            DOM.detailPhoto.src = `${BASE_URL}${place.photo}`;
            DOM.detailPhoto.style.display = 'block';
        } else {
            DOM.detailPhoto.style.display = 'none';
        }
        
        // Рейтинг
        const avgRating = place.average_rating || 0;
        const reviewsCount = place.reviews?.length || 0;
        DOM.detailRating.innerHTML = `
            <span class="stars">${renderStars(avgRating)}</span>
            <span class="avg-rating">${avgRating.toFixed(1)}</span>
            <span class="reviews-count">(${reviewsCount} отзывов)</span>
        `;
        
        // Отзывы
        DOM.reviewsList.innerHTML = '';
        if (place.reviews?.length > 0) {
            place.reviews.forEach(review => {
                const reviewEl = document.createElement('div');
                reviewEl.className = 'review-item';
                reviewEl.innerHTML = `
                    <div class="review-header">
                        <span class="review-rating">${renderStars(review.rating)}</span>
                        <span class="review-date">${formatDate(review.date)}</span>
                    </div>
                    <div class="review-text">${review.comment}</div>
                `;
                DOM.reviewsList.appendChild(reviewEl);
            });
        } else {
            DOM.reviewsList.innerHTML = '<div class="no-reviews">Нет отзывов</div>';
        }
        
        // Сохранение ID места
        DOM.submitReviewButton.dataset.placeId = placeId;
        
        // Отображение деталей
        showPlaceDetails();
        
    } catch (error) {
        console.error('Ошибка загрузки деталей места:', error);
        DOM.reviewsList.innerHTML = '<div class="no-reviews">Ошибка загрузки данных места</div>';
        DOM.detailTitle.textContent = 'Ошибка загрузки';
        DOM.detailAddress.textContent = '';
        DOM.detailDescription.textContent = 'Не удалось загрузить информацию о месте.';
        showPlaceDetails();
    }
}

// Отображение списка мест
function showPlacesList() {
    document.querySelector('.categories-container').style.display = 'block';
    DOM.placesContainer.style.display = 'block';
    DOM.placeDetailContainer.style.display = 'none';
}

// Отображение деталей места
function showPlaceDetails() {
    document.querySelector('.categories-container').style.display = 'none';
    DOM.placesContainer.style.display = 'none';
    DOM.placeDetailContainer.style.display = 'flex';
}

// Обновление маркера
function updateMarkerPopup(placeId, newRating) {
    const marker = markers[placeId];
    if (!marker) return;
    
    // Обновление данных
    marker.rating = newRating;
    const color = categoryColors[marker.category] || '#60a8f0';
    const iconClass = categoryIcons[marker.category] || 'fa-map-marker-alt';
    
    // Формирование нового контента popup
    let popupContent = `
        <div style="min-width: 250px;">
            <h3 style="margin: 0 0 10px; color: ${color}; font-size: 18px;">
                <i class="fas ${iconClass}" style="margin-right: 8px;"></i>${marker.title}
            </h3>
            <p style="margin-bottom: 5px;"><strong>Адрес:</strong> ${marker.address}</p>
            <p style="margin-bottom: 10px; color: #555;">${marker.description}</p>
    `;
    
    if (marker.photo) {
        popupContent += `
            <div style="margin-bottom: 10px;">
                <img src="${marker.photo}" style="width:100%; max-height:150px; object-fit:cover; border-radius:8px;">
            </div>
        `;
    }
    
    popupContent += `
        <div style="display: flex; justify-content: flex-end; align-items: center; 
            gap: 8px; font-size: 15px; color: #555;">
            <span style="font-weight: 500;">Рейтинг:</span>
            <span style="color: #ffc107; font-weight: bold;">
                ${newRating.toFixed(1)}
            </span>
        </div>
    </div>
    `;
    
    // Обновление popup
    marker.marker.unbindPopup();
    marker.marker.bindPopup(popupContent);
    
    // Переоткрытие popup для обновления
    if (marker.marker.isPopupOpen()) {
        marker.marker.closePopup();
        marker.marker.openPopup();
    }
}

// Отправка отзыва
async function submitReview() {
    const placeId = this.dataset.placeId;
    const text = DOM.reviewText.value;
    const rating = document.querySelector('.rating-stars').dataset.rating;
    
    if (!rating || rating == 0) {
        alert('Пожалуйста, поставьте оценку');
        return;
    }
    
    try {
        // Подготовка данных
        const formData = new FormData();
        formData.append('place', placeId);
        formData.append('rating', rating);
        formData.append('comment', text);
        
        // Отправка отзыва
        const response = await axios.post(
            `${API_BASE_URL}/reviews/add/`,
            formData
        );
        
        if (response.data.success) {
            // Обновление данных места
            const placeResponse = await axios.get(`${API_BASE_URL}/places/${placeId}/`);
            const newRating = placeResponse.data.average_rating;
            
            // Обновление интерфейса
            updateMarkerPopup(placeId, newRating);
            loadPlaceDetails(placeId);
            
            // Сброс формы
            DOM.reviewText.value = '';
            setRating(0);
        } else {
            console.error('Ошибка: ' + JSON.stringify(response.data.errors));
            alert('Ошибка при отправке отзыва');
        }
    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        alert('Произошла ошибка при отправке отзыва');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);