import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, Brain, TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import './SentimentAnalyzer.css';

const SentimentAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState('idle');
  const [analysisText, setAnalysisText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  // Sample metrics
  const sampleMetrics = {
    accuracy: 0.87,
    precision: { positive: 0.89, negative: 0.85, neutral: 0.86 },
    recall: { positive: 0.88, negative: 0.87, neutral: 0.86 },
    f1Score: { positive: 0.885, negative: 0.86, neutral: 0.86 }
  };

  const confusionMatrix = [
    { actual: 'Positive', predicted_pos: 450, predicted_neg: 30, predicted_neu: 20 },
    { actual: 'Negative', predicted_pos: 25, predicted_neg: 430, predicted_neu: 45 },
    { actual: 'Neutral', predicted_pos: 35, predicted_neg: 40, predicted_neu: 425 }
  ];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const startTraining = () => {
    setTrainingStatus('training');
    setTimeout(() => {
      setTrainingStatus('completed');
      setModelMetrics(sampleMetrics);
    }, 3000);
  };

  const analyzeSentiment = () => {
    if (!analysisText.trim()) return;
    
    const sentiments = ['positive', 'negative', 'neutral'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = (Math.random() * 0.3 + 0.7).toFixed(2);
    
    setPrediction({
      sentiment: randomSentiment,
      confidence: parseFloat(confidence),
      scores: {
        positive: randomSentiment === 'positive' ? confidence : (Math.random() * 0.3).toFixed(2),
        negative: randomSentiment === 'negative' ? confidence : (Math.random() * 0.3).toFixed(2),
        neutral: randomSentiment === 'neutral' ? confidence : (Math.random() * 0.3).toFixed(2)
      }
    });
  };

  const metricsData = modelMetrics ? [
    { metric: 'Positive', precision: modelMetrics.precision.positive, recall: modelMetrics.recall.positive, f1: modelMetrics.f1Score.positive },
    { metric: 'Negative', precision: modelMetrics.precision.negative, recall: modelMetrics.recall.negative, f1: modelMetrics.f1Score.negative },
    { metric: 'Neutral', precision: modelMetrics.precision.neutral, recall: modelMetrics.recall.neutral, f1: modelMetrics.f1Score.neutral }
  ] : [];

  return (
    <div className="sentiment-analyzer">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <Brain className="brain-icon" />
            <h1 className="title">Sentiment Analysis System</h1>
          </div>
          <p className="subtitle">Advanced ML-powered text sentiment classification</p>
        </header>

        {/* Navigation Tabs */}
        <nav className="tabs">
          {[
            { id: 'upload', label: 'Data & Training', icon: Upload },
            { id: 'analyze', label: 'Live Analysis', icon: MessageSquare },
            { id: 'metrics', label: 'Model Metrics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="tab-icon" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="content">
          {activeTab === 'upload' && (
            <div className="tab-content">
              <h2>Upload Dataset</h2>
              <div className="upload-area">
                <Upload className="upload-icon" />
                <input
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <span className="upload-text">Click to upload</span>
                  <span className="upload-subtext"> or drag and drop</span>
                </label>
                <p className="file-info">CSV, TXT, or JSON files (max 50MB)</p>
                {file && (
                  <div className="file-status">
                    <div className="file-success">
                      ✓ {file.name} uploaded ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  </div>
                )}
              </div>

              <div className="training-config">
                <h3>Training Configuration</h3>
                <div className="config-grid">
                  <div className="config-item">
                    <label>Model Type</label>
                    <select>
                      <option>Logistic Regression</option>
                      <option>Random Forest</option>
                      <option>SVM</option>
                      <option>Neural Network</option>
                    </select>
                  </div>
                  <div className="config-item">
                    <label>Vectorizer</label>
                    <select>
                      <option>TF-IDF</option>
                      <option>Count Vectorizer</option>
                      <option>Word2Vec</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={startTraining}
                disabled={!file || trainingStatus === 'training'}
                className={`train-button ${!file || trainingStatus === 'training' ? 'disabled' : ''}`}
              >
                {trainingStatus === 'training' ? (
                  <span className="training-text">
                    <span className="spinner"></span>
                    Training Model...
                  </span>
                ) : trainingStatus === 'completed' ? (
                  <span className="completed-text">
                    <CheckCircle className="check-icon" />
                    Training Completed!
                  </span>
                ) : (
                  'Start Training'
                )}
              </button>

              {trainingStatus === 'completed' && (
                <div className="training-result">
                  <div className="success-message">
                    <CheckCircle className="success-icon" />
                    <h3>Model Trained Successfully!</h3>
                    <p>Accuracy: {(sampleMetrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analyze' && (
            <div className="tab-content">
              <h2>Live Sentiment Analysis</h2>
              <textarea
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                placeholder="Enter text to analyze sentiment... (e.g., product review, tweet, comment)"
                className="analysis-textarea"
              />

              <button
                onClick={analyzeSentiment}
                disabled={!analysisText.trim()}
                className={`analyze-button ${!analysisText.trim() ? 'disabled' : ''}`}
              >
                Analyze Sentiment
              </button>

              {prediction && (
                <div className={`prediction-card ${prediction.sentiment}`}>
                  <div className="prediction-header">
                    <h3>Sentiment: {prediction.sentiment}</h3>
                    <span className="confidence">
                      {(prediction.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  
                  <div className="scores">
                    {Object.entries(prediction.scores).map(([sentiment, score]) => (
                      <div key={sentiment} className="score-bar">
                        <div className="score-label">
                          <span>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</span>
                          <span>{(score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${sentiment}`}
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && modelMetrics && (
            <div className="tab-content">
              <h2>Model Performance Metrics</h2>
              
              <div className="metrics-summary">
                <div className="metric-card accuracy">
                  <h3>Overall Accuracy</h3>
                  <p className="metric-value">{(modelMetrics.accuracy * 100).toFixed(1)}%</p>
                </div>
                <div className="metric-card precision">
                  <h3>Avg Precision</h3>
                  <p className="metric-value">
                    {((Object.values(modelMetrics.precision).reduce((a, b) => a + b, 0) / 3) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="metric-card recall">
                  <h3>Avg Recall</h3>
                  <p className="metric-value">
                    {((Object.values(modelMetrics.recall).reduce((a, b) => a + b, 0) / 3) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="chart-container">
                <h3>Classification Metrics by Sentiment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="precision" fill="#8b5cf6" />
                    <Bar dataKey="recall" fill="#ec4899" />
                    <Bar dataKey="f1" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="confusion-matrix-container">
                <h3>Confusion Matrix</h3>
                <table className="confusion-matrix">
                  <thead>
                    <tr>
                      <th>Actual / Predicted</th>
                      <th>Positive</th>
                      <th>Negative</th>
                      <th>Neutral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confusionMatrix.map((row, idx) => (
                      <tr key={idx}>
                        <td className="label">{row.actual}</td>
                        <td className="positive">{row.predicted_pos}</td>
                        <td className="negative">{row.predicted_neg}</td>
                        <td className="neutral">{row.predicted_neu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
