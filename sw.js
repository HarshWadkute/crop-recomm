// service-worker.js
const CACHE_NAME = 'KrishiGyan-v2';
const API_CACHE_NAME = 'KrishiGyan-api-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/assets/hero-image.jpg',
    '/assets/default-news.jpg',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (![CACHE_NAME, API_CACHE_NAME].includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Enhanced Fetch Handling
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API Cache Strategy
    if (url.pathname.startsWith('/api/')) {
        if (url.pathname === '/api/news') {
            event.respondWith(
                networkFirstThenCache(event.request, API_CACHE_NAME)
            );
        } else {
            event.respondWith(cacheFirst(event.request));
        }
    } else {
        event.respondWith(cacheFirst(event.request));
    }
});

async function networkFirstThenCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());

        // Store news in IndexedDB
        if (request.url.includes('/api/news')) {
            const articles = await networkResponse.clone().json();
            storeNewsArticles(articles);
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || Response.error();
    }
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
}

// IndexedDB News Storage
function storeNewsArticles(articles) {
    const farmingKeywords = [
        'agriculture', 'farming', 'crop', 'harvest', 'fertilizer',
        'irrigation', 'livestock', 'tractor', 'soil', 'organic'
    ];

    const processedArticles = articles.map(article => ({
        ...article,
        keywords: farmingKeywords.filter(keyword =>
            article.title.toLowerCase().includes(keyword) ||
            (article.description || '').toLowerCase().includes(keyword)
        ),
        timestamp: Date.now()
    }));

    indexedDB.open('NewsDB', 2).onsuccess = event => {
        const db = event.target.result;
        const tx = db.transaction('news', 'readwrite');
        const store = tx.objectStore('news');

        // Clear old entries
        store.clear().onsuccess = () => {
            processedArticles.forEach(article => store.add(article));
        };
    };
}

// Initialize News Database
indexedDB.open('NewsDB', 2).onupgradeneeded = event => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('news')) {
        const store = db.createObjectStore('news', { keyPath: 'id' });
        store.createIndex('keywords', 'keywords', { multiEntry: true });
        store.createIndex('timestamp', 'timestamp');
    }
};

// Rest of service worker code (sync, push, notification) remains same


// Background Sync
self.addEventListener('sync', event => {
    if (event.tag === 'sync-weather') {
        event.waitUntil(syncWeatherData());
    }
});

// Push Notification
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icon.png',
        badge: '/assets/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('KrishiGyan Update', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function for weather data sync
async function syncWeatherData() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const weatherData = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=20.5937&lon=78.9629&appid=47fb37a5aaf5a26292db0432c26e9dee');
        const weatherJson = await weatherData.json();
        
        // Store in IndexedDB for offline access
        const db = await openWeatherDB();
        await storeWeatherData(db, weatherJson);
        
        return weatherJson;
    } catch (error) {
        console.error('Error syncing weather data:', error);
        return null;
    }
}

// IndexedDB setup for weather data
function openWeatherDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WeatherDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('weather')) {
                db.createObjectStore('weather', { keyPath: 'timestamp' });
            }
        };
    });
}

function storeWeatherData(db, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['weather'], 'readwrite');
        const store = transaction.objectStore('weather');
        const request = store.add({
            timestamp: Date.now(),
            data: data
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
} 