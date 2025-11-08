document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const questionChips = document.querySelectorAll('.bg-green-600.px-4.py-2.rounded-full');
    
    // OpenRouter API Key - Store this securely in production!
    const API_KEY = "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"; // Replace with your OpenRouter API key
    
    // Farming keywords to filter non-farming questions
    const farmingKeywords = [
        'crop', 'plant', 'soil', 'farm', 'harvest', 
        'seed', 'fertilizer', 'pest', 'water', 'agriculture',
        'irrigation', 'organic', 'garden', 'grow', 'yield',
        'weed', 'season', 'compost', 'cultivation', 'field',
        'produce', 'vegetable', 'fruit', 'grain', 'livestock',
        'drought', 'nutrient', 'sustainable', 'rotating', 'weather',
        'guide','Farming', 'Agriculture', 'Agribusiness', 'Sustainable farming', 'Organic farming',
        'Traditional farming', 'Modern farming', 'Smart farming', 'Regenerative agriculture', 'Permaculture',
        'Crop cultivation', 'Best crops for season/location', 'Crop rotation', 'High-yield crops',
        'Organic crop farming', 'Greenhouse farming', 'Hydroponics', 'Vertical farming', 'Precision agriculture', 'Soil health for crops',
        'Farm machinery', 'Tractors for farming', 'Drip irrigation system', 'Smart irrigation',
        'IoT in agriculture', 'AI in farming', 'GPS farming', 'Automated farming', 'Precision farming tools', 'Agri-tech innovations',
        'Soil testing', 'Best fertilizers for crops', 'Organic fertilizers',
        'Composting techniques', 'Manure vs. chemical fertilizers', 'Soil erosion control',
        'Soil improvement techniques', 'pH levels in soil', 'Nitrogen-rich fertilizers', 'Vermicomposting',
        'Pest control in farming', 'Common crop diseases', 'Organic pesticides', 'Integrated pest management',
        'Natural insect repellents', 'Fungal infections in plants', 'Biological pest control', 
        'Best pesticides for vegetables', 'Disease-resistant crops', 'Early signs of plant diseases',
        'Climate change and farming', 'Weather impact on crops', 'Best crops for drought conditions', 
        'Frost protection for crops', 'Rainwater harvesting for farms', 'Wind-resistant crops', 
        'Best crops for cold climates', 'Solar energy for farming', 'Greenhouse gas emissions in agriculture', 'Seasonal farming guide',
        'How to start a farm business', 'Profitable farming ideas', 'Farming grants and subsidies',
        'Government schemes for farmers', 'Market trends in agriculture', 'Selling farm products online', 
        'Local farmers', 'markets', 'Best cash crops for small farmers', 'Supply chain in agriculture', 'Agricultural exports and imports',
        'Sustainable agriculture methods', 'Organic vs. conventional farming', 'Zero-waste farming', 
        'Agroforestry techniques', 'Conservation tillage', 'Carbon farming', 'Water conservation in farming', 
        'Cover crops benefits', 'Biodynamic farming', 'Wildlife-friendly farming','list'
    ];
    
    // Add event listener for send button
    sendButton.addEventListener('click', sendMessage);
    
    // Add event listener for Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add event listeners for suggested questions
    questionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.textContent;
            sendMessage();
        });
    });
    
    function createLoadingAnimation() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'flex flex-col items-start mb-4';
        loadingDiv.innerHTML = `
            <div class="bg-green-100 text-green-800 p-3 rounded-lg flex items-center space-x-2">
                <span class="bot-icon"></span>
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        return loadingDiv;
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input field
        userInput.value = '';
        
        // Add loading animation
        const loadingAnimation = createLoadingAnimation();
        chatMessages.appendChild(loadingAnimation);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Check if message is farming-related
        const isFarmingRelated = checkIfFarmingRelated(message);
        
        if (isFarmingRelated) {
            // Send to API and get response
            sendToOpenRouter(message)
                .then(response => {
                    loadingAnimation.remove(); // Remove loading animation
                    addBotMessage(response);
                })
                .catch(error => {
                    console.error('Error:', error);
                    loadingAnimation.remove(); // Remove loading animation
                    addBotMessage("Sorry, I'm having trouble connecting right now. Please try again later.");
                });
        } else {
            // Not farming related
            setTimeout(() => {
                loadingAnimation.remove(); // Remove loading animation
                addBotMessage("I'm sorry, but I can only answer questions related to farming and agriculture. If you have any questions about crops, soil, pest management, or other agricultural topics, I'd be happy to help!");
            }, 1000);
        }
    }
    
    function checkIfFarmingRelated(message) {
        message = message.toLowerCase();
        return farmingKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    }
    
    // Updated user message function
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex flex-col items-end mb-4';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'bg-green-600 text-white p-3 rounded-lg max-w-3/4';
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Updated bot message function with proper formatting
    function addBotMessage(text) {
        // Create the message container
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex flex-col items-start mb-4';
        
        // Create the message content container
        const messageContent = document.createElement('div');
        messageContent.className = 'bg-green-100 text-green-800 p-3 rounded-lg max-w-3/4';
        
        // Process and format the text
        const formattedText = formatBotResponse(text);
        messageContent.innerHTML = '<span class="bot-icon">🌾</span> ' + formattedText;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Add custom styling for formatted messages if not already added
        if (!document.querySelector('#formatted-message-styles')) {
            const style = document.createElement('style');
            style.id = 'formatted-message-styles';
            style.textContent = `
                .bg-green-100 {
                    line-height: 1.5;
                    font-size: 15px;
                }
                .bg-green-100 p {
                    margin-bottom: 10px;
                }
                .bg-green-100 strong {
                    font-weight: 600;
                    color: #2E7D32;
                }
                .bg-green-100 h3 {
                    margin: 12px 0 8px;
                    color: #2E7D32;
                    font-size: 16px;
                    font-weight: 600;
                }
                .bg-green-100 ul, .bg-green-100 ol {
                    margin: 8px 0;
                    padding-left: 20px;
                }
                .bg-green-100 li {
                    margin-bottom: 6px;
                }
                .bg-green-100 hr {
                    margin: 10px 0;
                    border: none;
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
                .bot-icon {
                    margin-right: 5px;
                    font-size: 16px;
                }
                .key-point {
                    background-color: rgba(139, 195, 74, 0.1);
                    border-left: 3px solid #8BC34A;
                    padding: 8px 12px;
                    margin: 10px 0;
                    border-radius: 0 4px 4px 0;
                }
                .tip-box {
                    background-color: rgba(76, 175, 80, 0.1);
                    border: 1px solid rgba(76, 175, 80, 0.3);
                    border-radius: 4px;
                    padding: 10px;
                    margin: 10px 0;
                }
                .tip-box:before {
                    content: "💡 Tip: ";
                    font-weight: bold;
                    color: #4CAF50;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Format bot responses with improved styling and structure
    function formatBotResponse(text) {
        if (!text) return "";
        
        // Convert markdown-style formatting to HTML
        let formattedText = text
            // Headers
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Lists (Convert bullet points)
            .replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>')
            
            // Wrap list items in ul tags
            .replace(/(<li>.*?<\/li>)\s*(?=<li>|$)/gs, '<ul>$1</ul>')
            
            // Numbered lists
            .replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li>$2</li>')
            
            // Horizontal rule
            .replace(/^---$/gm, '<hr>')
            
            // Paragraphs (add paragraph breaks)
            .replace(/\n\s*\n/g, '</p><p>')
            
            // Highlight key points
            .replace(/^(Important|Key Point|Note):(.*?)$/gm, '<div class="key-point">$1: $2</div>')
            
            // Create tip boxes
            .replace(/^(Tip|Hint|Advice):(.*?)$/gm, '<div class="tip-box">$2</div>');
        
        // Enhance common farming terms with bold
        const farmingTerms = ['crop rotation', 'soil pH', 'irrigation', 'fertilization', 'harvest', 
                             'organic farming', 'sustainable', 'pest management'];
        
        farmingTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            formattedText = formattedText.replace(regex, '<strong>$&</strong>');
        });
        
        // Detect if there might be a list and ensure it's properly formatted
        if ((text.match(/-\s/g) || []).length >= 3 || (text.match(/\d+\.\s/g) || []).length >= 3) {
            // This might be a list, ensure it has proper list formatting
            formattedText = formattedText.replace(/<\/p><p>(<li>)/g, '<ul>$1');
            formattedText = formattedText.replace(/(<\/li>)<\/p><p>/g, '$1</ul>');
        }
        
        // Wrap in paragraph tags if not already done
        if (!formattedText.startsWith('<p>')) {
            formattedText = '<p>' + formattedText + '</p>';
        }
        
        return formattedText;
    }
    
    async function sendToOpenRouter(message) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.href, // OpenRouter requires this
                    'X-Title': 'FarmFriend Chatbot' // Optional but good practice
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo', // You can change to any model supported by OpenRouter
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a friendly and helpful farming assistant named FarmFriend. You provide agricultural advice and expertise to farmers. You only answer questions related to farming, cultivation, agriculture, gardening, and related topics. If asked about non-farming topics, politely decline to answer. Keep your responses helpful, informative, and concise. Use a friendly, conversational tone that a farmer would appreciate. When appropriate, format your responses with bullet points using "-" at the start of lines for lists, use ** for important terms, and organize information with clear sections. For important tips, start lines with "Tip:" to highlight advice.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            const data = await response.json();
            
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                console.error('API Response:', data);
                throw new Error('No valid response from API');
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    

});