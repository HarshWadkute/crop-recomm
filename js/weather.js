// API Key
const WEATHER_API_KEY = '47fb37a5aaf5a26292db0432c26e9dee';

// DOM Elements
let currentLocation = null;
let temperatureChart = null;
let rainfallChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listeners
    document.getElementById('useCurrentLocation').addEventListener('click', getCurrentLocation);
    document.getElementById('locationInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            updateWeatherByLocation(e.target.value);
        }
    });

    // Initialize charts
    initializeCharts();

    // Get initial location
    getCurrentLocation();
});

// Get current location
async function getCurrentLocation() {
    const locationElement = document.getElementById('currentLocation');
    locationElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Detecting location...';

    try {
        const position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };

        // Get location name
        const locationName = await getLocationName(currentLocation.lat, currentLocation.lon);
        locationElement.innerHTML = `
            <i class="fas fa-map-marker-alt mr-2"></i>
            <span>${locationName}</span>
        `;

        // Update weather data
        updateWeatherData();
    } catch (error) {
        locationElement.innerHTML = `
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>Unable to detect location. Please enter manually.</span>
        `;
        console.error('Error getting location:', error);
    }
}

// Get location name from coordinates
async function getLocationName(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`
        );
        const data = await response.json();
        return data[0]?.name || 'Unknown Location';
    } catch (error) {
        console.error('Error getting location name:', error);
        return 'Unknown Location';
    }
}

// Update weather by location name
async function updateWeatherByLocation(locationName) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${WEATHER_API_KEY}`
        );
        const data = await response.json();
        
        if (data.length === 0) {
            showNotification('Location not found', 'error');
            return;
        }

        currentLocation = {
            lat: data[0].lat,
            lon: data[0].lon
        };

        document.getElementById('currentLocation').innerHTML = `
            <i class="fas fa-map-marker-alt mr-2"></i>
            <span>${data[0].name}, ${data[0].country}</span>
        `;

        updateWeatherData();
    } catch (error) {
        console.error('Error updating weather by location:', error);
        showNotification('Error fetching location data', 'error');
    }
}

// Update weather data
async function updateWeatherData() {
    if (!currentLocation) return;

    try {
        // Fetch current weather
        const currentWeather = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ).then(res => res.json());

        // Fetch 7-day forecast
        const forecast = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ).then(res => res.json());

        // Update UI
        updateCurrentWeather(currentWeather);
        updateWeatherDetails(currentWeather);
        updateForecast(forecast);
        updateCharts(forecast);
        generateFarmingAlerts(currentWeather, forecast);
        updateHistoricalData(currentLocation);

    } catch (error) {
        console.error('Error updating weather data:', error);
        showNotification('Error fetching weather data', 'error');
    }
}

// Update current weather display
function updateCurrentWeather(data) {
    const container = document.getElementById('currentWeather');
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    container.innerHTML = `
        <div class="text-4xl font-bold mb-2">${temp}°C</div>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="mx-auto mb-2">
        <div class="text-xl capitalize">${description}</div>
    `;
}

// Update weather details
function updateWeatherDetails(data) {
    const container = document.getElementById('weatherDetails');
    const details = [
        { label: 'Humidity', value: `${data.main.humidity}%`, icon: 'fa-droplet' },
        { label: 'Wind Speed', value: `${data.wind.speed} m/s`, icon: 'fa-wind' },
        { label: 'Pressure', value: `${data.main.pressure} hPa`, icon: 'fa-gauge' },
        { label: 'Visibility', value: `${(data.visibility / 1000).toFixed(1)} km`, icon: 'fa-eye' }
    ];

    container.innerHTML = details.map(detail => `
        <div class="p-4 border rounded">
            <i class="fas ${detail.icon} text-green-600 mb-2"></i>
            <div class="text-sm text-gray-600">${detail.label}</div>
            <div class="font-semibold">${detail.value}</div>
        </div>
    `).join('');
}

// Update forecast display
function updateForecast(data) {
    const container = document.getElementById('forecast');
    const dailyForecasts = getDailyForecasts(data.list);

    container.innerHTML = dailyForecasts.map(day => `
        <div class="text-center p-4 border rounded">
            <div class="font-semibold mb-2">${formatDate(day.date)}</div>
            <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" class="mx-auto mb-2">
            <div class="text-sm capitalize mb-1">${day.description}</div>
            <div class="font-bold">${Math.round(day.temp)}°C</div>
        </div>
    `).join('');
}

// Get daily forecasts from 3-hour data
function getDailyForecasts(forecastList) {
    const dailyForecasts = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        const dayForecast = forecastList.find(item => {
            const itemDate = new Date(item.dt * 1000);
            return itemDate.getDate() === date.getDate() &&
                   itemDate.getMonth() === date.getMonth() &&
                   itemDate.getFullYear() === date.getFullYear();
        });

        if (dayForecast) {
            dailyForecasts.push({
                date: date,
                temp: dayForecast.main.temp,
                description: dayForecast.weather[0].description,
                icon: dayForecast.weather[0].icon
            });
        }
    }

    return dailyForecasts;
}

// Initialize charts
function initializeCharts() {
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    const rainCtx = document.getElementById('rainfallChart').getContext('2d');
    rainfallChart = new Chart(rainCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Rainfall (mm)',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update charts with forecast data
function updateCharts(forecast) {
    const dailyData = getDailyForecasts(forecast.list);
    
    temperatureChart.data.labels = dailyData.map(day => formatDate(day.date));
    temperatureChart.data.datasets[0].data = dailyData.map(day => day.temp);
    temperatureChart.update();

    // Simulated rainfall data (replace with actual data when available)
    rainfallChart.data.labels = dailyData.map(day => formatDate(day.date));
    rainfallChart.data.datasets[0].data = dailyData.map(() => Math.random() * 10);
    rainfallChart.update();
}

// Generate farming alerts based on weather conditions
function generateFarmingAlerts(currentWeather, forecast) {
    const container = document.getElementById('farmingAlerts');
    const alerts = [];

    // Temperature alerts
    if (currentWeather.main.temp > 35) {
        alerts.push({
            type: 'warning',
            message: 'High temperature alert: Consider additional irrigation for your crops'
        });
    }

    // Wind alerts
    if (currentWeather.wind.speed > 10) {
        alerts.push({
            type: 'warning',
            message: 'Strong winds: Protect sensitive crops and secure farm equipment'
        });
    }

    // Rain alerts
    const rainForecast = forecast.list.some(item => item.weather[0].main === 'Rain');
    if (rainForecast) {
        alerts.push({
            type: 'info',
            message: 'Rain expected: Prepare for potential irrigation adjustments'
        });
    }

    container.innerHTML = alerts.map(alert => `
        <div class="p-4 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}">
            <div class="flex items-center">
                <i class="fas ${alert.type === 'warning' ? 'fa-exclamation-triangle text-yellow-500' : 'fa-info-circle text-blue-500'} mr-2"></i>
                <span>${alert.message}</span>
            </div>
        </div>
    `).join('');
}

// Update historical weather data
async function updateHistoricalData(location) {
    // Simulated historical data (replace with actual API calls when available)
    const historicalData = {
        lastMonth: {
            avgTemp: '28°C',
            rainfall: '120mm',
            humidity: '65%'
        },
        last3Months: {
            avgTemp: '25°C',
            rainfall: '350mm',
            humidity: '70%'
        },
        lastYear: {
            avgTemp: '26°C',
            rainfall: '1400mm',
            humidity: '68%'
        }
    };

    document.getElementById('lastMonthData').innerHTML = `
        <div>Avg Temp: ${historicalData.lastMonth.avgTemp}</div>
        <div>Rainfall: ${historicalData.lastMonth.rainfall}</div>
        <div>Humidity: ${historicalData.lastMonth.humidity}</div>
    `;

    document.getElementById('last3MonthsData').innerHTML = `
        <div>Avg Temp: ${historicalData.last3Months.avgTemp}</div>
        <div>Rainfall: ${historicalData.last3Months.rainfall}</div>
        <div>Humidity: ${historicalData.last3Months.humidity}</div>
    `;

    document.getElementById('lastYearData').innerHTML = `
        <div>Avg Temp: ${historicalData.lastYear.avgTemp}</div>
        <div>Rainfall: ${historicalData.lastYear.rainfall}</div>
        <div>Humidity: ${historicalData.lastYear.humidity}</div>
    `;
}

// Utility functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 