// API Keys
const WEATHER_API_KEY = '47fb37a5aaf5a26292db0432c26e9dee';
const NEWS_API_KEY = 'pub_70133e1f011fb722154f36a821948704543d1';
const CHATBOT_API_KEY = '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';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize weather widget
    initializeWeatherWidget();
    
    // Initialize news feed
    initializeNewsFeed();
    
    // Initialize market prices
    initializeMarketPrices();
    
    // Initialize map if present
    if (document.getElementById('map')) {
        initializeMap();
    }
});

// Weather Widget
async function initializeWeatherWidget() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;

    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;

        // Fetch weather data
        const weatherData = await fetchWeatherData(latitude, longitude);
        displayWeatherData(weatherData, weatherWidget);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherWidget.innerHTML = 'Unable to load weather data';
    }
}

async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function fetchWeatherData(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    return await response.json();
}

function displayWeatherData(data, container) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    
    container.innerHTML = `
        <div class="weather-widget">
            <div class="text-2xl font-bold">${temp}°C</div>
            <div class="text-lg capitalize">${description}</div>
            <div class="text-sm">Humidity: ${humidity}%</div>
        </div>
    `;
}

// News Feed
async function initializeNewsFeed() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    try {
        const news = await fetchNews();
        displayNews(news, newsContainer);
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = 'Unable to load news';
    }
}

async function fetchNews() {
    const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=agriculture&language=en`
    );
    const data = await response.json();
    return data.results.slice(0, 6); // Get latest 6 news items
}



function displayNews(news, container) {
    container.innerHTML = news.map(item => `
        <div class="news-card bg-white p-6 rounded-lg shadow-md">
            <img src="${item.image_url || 'assets/default-news.jpg'}" alt="${item.title}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-xl font-semibold mb-2">${item.title}</h3>
            <p class="text-gray-600 mb-4">${item.description || 'No description available'}</p>
            <a href="${item.link}" target="_blank" class="text-green-600 hover:text-green-700">Read More →</a>
        </div>
    `).join('');
}

// Market Prices
async function initializeMarketPrices() {
    const marketPrices = document.getElementById('market-prices');
    if (!marketPrices) return;

    try {
        // Simulated market data (replace with actual API call)
        const prices = await fetchMarketPrices();
        displayMarketPrices(prices, marketPrices);
    } catch (error) {
        console.error('Error fetching market prices:', error);
        marketPrices.innerHTML = 'Unable to load market prices';
    }
}

async function fetchMarketPrices() {
    // Simulated data - replace with actual API call
    return [
        { crop: 'Wheat', price: '₹2,100/quintal', trend: 'up' },
        { crop: 'Rice', price: '₹3,200/quintal', trend: 'down' },
        { crop: 'Cotton', price: '₹5,800/quintal', trend: 'stable' }
    ];
}

function displayMarketPrices(prices, container) {
    container.innerHTML = prices.map(item => `
        <div class="market-price-card bg-white p-4 rounded-lg shadow-sm mb-2">
            <div class="flex justify-between items-center">
                <span class="font-semibold">${item.crop}</span>
                <span class="text-lg">${item.price}</span>
            </div>
            <div class="text-sm text-gray-500">
                Trend: ${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
            </div>
        </div>
    `).join('');
}

// Map Initialization
function initializeMap() {
    const map = L.map('map').setView([20.5937, 78.9629], 5); // Center on India
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for major agricultural regions
    const agriculturalRegions = [
        { name: 'Punjab', coords: [30.9293, 75.8033] },
        { name: 'Haryana', coords: [29.0588, 76.0856] },
        { name: 'Uttar Pradesh', coords: [26.8467, 80.9462] }
    ];

    agriculturalRegions.forEach(region => {
        L.marker(region.coords)
            .bindPopup(region.name)
            .addTo(map);
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Error Handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// Offline Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
} 