// static/script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('prediction-form');
    const resultCard = document.getElementById('result-card');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            resultCard.innerHTML = `
                <h2>Recommended Crop</h2>
                <p class="crop-result">${data.crop}</p>
                <p>This crop is recommended based on your soil and environmental conditions.</p>
            `;
            resultCard.style.display = 'block';
            
            // Scroll to the result
            resultCard.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            resultCard.innerHTML = `
                <h2>Error</h2>
                <p>There was an error processing your request. Please try again.</p>
            `;
            resultCard.style.display = 'block';
        });
    });
});