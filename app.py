from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
from werkzeug.utils import secure_filename
from sentiment_analysis import SentimentAnalyzer

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'txt', 'json'}
MODEL_PATH = 'sentiment_model.pkl'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global analyzer instance
analyzer = SentimentAnalyzer()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Sentiment Analysis API is running'
    })


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload dataset file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Validate file
        try:
            df = pd.read_csv(filepath)
            return jsonify({
                'success': True,
                'filename': filename,
                'filepath': filepath,
                'rows': len(df),
                'columns': df.columns.tolist()
            })
        except Exception as e:
            return jsonify({'error': f'Invalid file format: {str(e)}'}), 400
    
    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/api/train', methods=['POST'])
def train_model():
    """Train sentiment analysis model"""
    try:
        data = request.json
        filepath = data.get('filepath')
        model_type = data.get('model_type', 'logistic')
        text_column = data.get('text_column', 'text')
        label_column = data.get('label_column', 'sentiment')
        test_size = data.get('test_size', 0.2)
        
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 400
        
        # Load and prepare data
        df = analyzer.load_data(filepath, text_column, label_column)
        if df is None:
            return jsonify({'error': 'Failed to load data'}), 400
        
        X_train, X_test, y_train, y_test = analyzer.prepare_data(
            df, text_column, label_column, test_size
        )
        
        # Train model
        analyzer.train_model(X_train, y_train, model_type)
        
        # Evaluate model
        accuracy, confusion_matrix = analyzer.evaluate_model(X_test, y_test)
        
        # Save model
        analyzer.save_model(MODEL_PATH)
        
        # Get detailed metrics
        from sklearn.metrics import classification_report
        X_test_vec = analyzer.vectorizer.transform(X_test)
        y_pred = analyzer.model.predict(X_test_vec)
        
        report = classification_report(
            y_test, y_pred, 
            target_names=['Negative', 'Neutral', 'Positive'],
            output_dict=True
        )
        
        return jsonify({
            'success': True,
            'accuracy': float(accuracy),
            'metrics': {
                'precision': {
                    'negative': report['Negative']['precision'],
                    'neutral': report['Neutral']['precision'],
                    'positive': report['Positive']['precision']
                },
                'recall': {
                    'negative': report['Negative']['recall'],
                    'neutral': report['Neutral']['recall'],
                    'positive': report['Positive']['recall']
                },
                'f1_score': {
                    'negative': report['Negative']['f1-score'],
                    'neutral': report['Neutral']['f1-score'],
                    'positive': report['Positive']['f1-score']
                }
            },
            'confusion_matrix': confusion_matrix.tolist(),
            'model_saved': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def predict_sentiment():
    """Predict sentiment for given text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Load model if not already loaded
        if analyzer.model is None:
            if os.path.exists(MODEL_PATH):
                analyzer.load_model(MODEL_PATH)
            else:
                return jsonify({'error': 'Model not trained yet'}), 400
        
        # Make prediction
        result = analyzer.predict_sentiment(text)
        
        return jsonify({
            'success': True,
            'text': text,
            'sentiment': result['sentiment'],
            'confidence': float(result['confidence']),
            'probabilities': {
                'negative': float(result['probabilities']['Negative']),
                'neutral': float(result['probabilities']['Neutral']),
                'positive': float(result['probabilities']['Positive'])
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/batch_predict', methods=['POST'])
def batch_predict():
    """Predict sentiment for multiple texts"""
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        # Load model if not already loaded
        if analyzer.model is None:
            if os.path.exists(MODEL_PATH):
                analyzer.load_model(MODEL_PATH)
            else:
                return jsonify({'error': 'Model not trained yet'}), 400
        
        # Make predictions
        results = []
        for text in texts:
            result = analyzer.predict_sentiment(text)
            results.append({
                'text': text,
                'sentiment': result['sentiment'],
                'confidence': float(result['confidence'])
            })
        
        return jsonify({
            'success': True,
            'predictions': results,
            'total': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model_info', methods=['GET'])
def model_info():
    """Get information about the current model"""
    try:
        if not os.path.exists(MODEL_PATH):
            return jsonify({
                'model_exists': False,
                'message': 'No trained model found'
            })
        
        file_stats = os.stat(MODEL_PATH)
        
        return jsonify({
            'model_exists': True,
            'model_path': MODEL_PATH,
            'file_size': file_stats.st_size,
            'last_modified': file_stats.st_mtime
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/load_model', methods=['POST'])
def load_model():
    """Load pre-trained model"""
    try:
        if not os.path.exists(MODEL_PATH):
            return jsonify({'error': 'Model file not found'}), 404
        
        analyzer.load_model(MODEL_PATH)
        
        return jsonify({
            'success': True,
            'message': 'Model loaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 50MB'}), 413


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Starting Sentiment Analysis API...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Model path: {MODEL_PATH}")
    app.run(debug=True, host='0.0.0.0', port=5000)
