// Tab Navigation
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// File Upload Handling
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileStatus = document.getElementById('fileStatus');
const trainButton = document.getElementById('trainButton');

let uploadedFile = null;

fileInput.addEventListener('change', handleFileUpload);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#9333ea';
    uploadArea.style.background = '#f3e8ff';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#c084fc';
    uploadArea.style.background = '#faf5ff';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#c084fc';
    uploadArea.style.background = '#faf5ff';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload();
    }
});

function handleFileUpload() {
    const file = fileInput.files[0];
    if (file) {
        uploadedFile = file;
        fileStatus.innerHTML = `
            <div class="file-success">
                ✓ ${file.name} uploaded (${(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
        `;
        trainButton.disabled = false;
    }
}

// Training Model
trainButton.addEventListener('click', startTraining);

function startTraining() {
    if (!uploadedFile) return;
    
    const modelType = document.getElementById('modelType').value;
    const vectorizer = document.getElementById('vectorizer').value;
    const trainingResult = document.getElementById('trainingResult');
    
    // Disable button and show training state
    trainButton.disabled = true;
    trainButton.classList.add('training');
    trainButton.innerHTML = `
        <span style="display: flex; align-items: center; justify-content: center;">
            <span style="border: 3px solid #fff; border-top-color: transparent; border-radius: 50%; width: 1.5rem; height: 1.5rem; animation: spin 1s linear infinite; margin-right: 0.5rem;"></span>
            Training Model...
        </span>
    `;
    
    // Add spinning animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Simulate training process (replace with actual API call)
    setTimeout(() => {
        trainButton.classList.remove('training');
        trainButton.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center;">
                ✓ Training Completed!
            </span>
        `;
        
        trainingResult.innerHTML = `
            <div class="success-message">
                <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h3>Model Trained Successfully!</h3>
                <p>Accuracy: 87.0%</p>
                <p style="margin-top: 0.5rem; font-size: 0.875rem;">
                    Model: ${modelType.replace('_', ' ').toUpperCase()} | 
                    Vectorizer: ${vectorizer.toUpperCase()}
                </p>
            </div>
        `;
        
        // Enable metrics tab visualization
        initializeMetricsChart();
    }, 3000);
}

// Sentiment Analysis
const analysisText = document.getElementById('analysisText');
const analyzeButton = document.getElementById('analyzeButton');
const predictionResult = document.getElementById('predictionResult');

analyzeButton.addEventListener('click', analyzeSentiment);

function analyzeSentiment() {
    const text = analysisText.value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze');
        return;
    }
    
    // Simulate sentiment prediction (replace with actual API call)
    const sentiments = ['positive', 'negative', 'neutral'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = (Math.random() * 0.3 + 0.7).toFixed(2);
    
    const scores = {
        positive: randomSentiment === 'positive' ? confidence : (Math.random() * 0.3).toFixed(2),
        negative: randomSentiment === 'negative' ? confidence : (Math.random() * 0.3).toFixed(2),
        neutral: randomSentiment === 'neutral' ? confidence : (Math.random() * 0.3).toFixed(2)
    };
    
    displayPrediction(randomSentiment, parseFloat(confidence), scores);
}

function displayPrediction(sentiment, confidence, scores) {
    predictionResult.innerHTML = `
        <div class="prediction-card ${sentiment}">
            <div class="prediction-header">
                <h3>Sentiment: ${sentiment}</h3>
                <span class="confidence">${(confidence * 100).toFixed(1)}% confidence</span>
            </div>
            
            ${Object.entries(scores).map(([sent, score]) => `
                <div class="score-bar">
                    <div class="score-label">
                        <span>${sent.charAt(0).toUpperCase() + sent.slice(1)}</span>
                        <span>${(score * 100).toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${sent}" style="width: ${score * 100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Initialize Metrics Chart
let metricsChart = null;

function initializeMetricsChart() {
    const ctx = document.getElementById('metricsChart');
    
    if (metricsChart) {
        metricsChart.destroy();
    }
    
    metricsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [
                {
                    label: 'Precision',
                    data: [0.89, 0.85, 0.86],
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Recall',
                    data: [0.88, 0.87, 0.86],
                    backgroundColor: 'rgba(236, 72, 153, 0.8)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 2
                },
                {
                    label: 'F1-Score',
                    data: [0.885, 0.86, 0.86],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + (context.parsed.y * 100).toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Initialize chart when metrics tab is first clicked
tabs.forEach(tab => {
    if (tab.dataset.tab === 'metrics') {
        tab.addEventListener('click', () => {
            setTimeout(initializeMetricsChart, 100);
        });
    }
});

// Sample text suggestions
const sampleTexts = [
    "This product is absolutely amazing! I love it!",
    "Terrible experience. Would not recommend to anyone.",
    "It's okay, nothing special but does the job.",
    "Best purchase I've made this year! Highly recommended!",
    "Waste of money. Very disappointed with the quality."
];

// Add sample text button (optional enhancement)
analysisText.addEventListener('focus', function() {
    if (!this.value) {
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        this.placeholder = `Try: "${randomText}"`;
    }
});

// Real-time character count (optional enhancement)
analysisText.addEventListener('input', function() {
    const charCount = this.value.length;
    if (charCount > 0) {
        analyzeButton.style.opacity = '1';
    } else {
        analyzeButton.style.opacity = '0.7';
    }
});
