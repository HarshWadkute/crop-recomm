const apiKey = 'pub_70133e1f011fb722154f36a821948704543d1';
const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=agriculture+farming+crop+harvest+soil&language=en`;

// Function to fetch and display more accurate agricultural news
function fetchAgricultureNews() {
    displayLoading();
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.status === 'success' && data.results?.length > 0) {
                const filteredArticles = data.results.filter(article =>
                    /agriculture|farming|crop|harvest|soil|irrigation|agronomy|farm/.test(article.title?.toLowerCase() || '')
                );
                displayNews(filteredArticles.length ? filteredArticles : data.results);
            } else {
                displayError('No agricultural news articles found.');
            }
        })
        .catch(error => {
            console.error('Error fetching the news:', error);
            displayError('Failed to fetch news. Please try again later.');
        });
}

// Function to display loading message
function displayLoading() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<div class="loading-message">Loading latest news...</div>';
}

// Function to display news articles dynamically
function displayNews(articles) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = articles.map(article => {
        const imageUrl = article.image_url || 'fallback-image.jpg'; // Use fallback image if no thumbnail
        return `
            <div class="news-card">
                <img src="${imageUrl}" alt="${article.title}" class="news-image">
                <div class="news-content">
                    <h2 class="news-title">${article.title}</h2>
                    <p class="news-date">${new Date(article.pubDate).toLocaleDateString('en-US')}</p>
                    <p class="news-description">${article.description || 'No description available'}</p>
                    <a href="${article.link}" target="_blank" class="read-more-btn">Read more</a>
                </div>
            </div>
        `;
    }).join('');
}

// Function to display error messages
function displayError(message) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

// Load agricultural news when page loads
document.addEventListener('DOMContentLoaded', fetchAgricultureNews);
