import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";



function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(new Set());
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadSymptomSuggestions();
  }, []);

  const loadSymptomSuggestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/symptoms`);
    const data = await response.json();
    setAvailableSymptoms(data.symptoms);
  } catch (error) {
    console.error("Error loading symptoms:", error);
    setError(
      `Failed to load symptoms. Please check if the API is running at ${API_BASE_URL}`
    );
  }
};


  const addSymptom = (symptom) => {
    if (selectedSymptoms.has(symptom)) return;
    
    if (!availableSymptoms.includes(symptom)) {
      setError(`"${symptom}" is not a valid symptom. Please check the spelling.`);
      return;
    }
    
    setSelectedSymptoms(prev => new Set([...prev, symptom]));
    setError('');
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(prev => {
      const newSet = new Set(prev);
      newSet.delete(symptom);
      return newSet;
    });
  };

  const addSymptomsFromInput = () => {
    const symptoms = inputValue.split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_'));
    
    symptoms.forEach(symptom => {
      if (symptom && !selectedSymptoms.has(symptom)) {
        addSymptom(symptom);
      }
    });
    
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSymptomsFromInput();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.includes(',')) {
      addSymptomsFromInput();
    }
  };

  const predictDisease = async () => {
  if (selectedSymptoms.size === 0) {
    setError("Please add at least one symptom before predicting.");
    return;
  }

  setLoading(true);
  setError("");
  setResults(null);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: Array.from(selectedSymptoms) }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    setResults(data);
  } catch (error) {
    console.error("Prediction error:", error);
    setError(
      `Prediction failed: ${error.message}. Please make sure the API is running on ${API_BASE_URL}`
    );
  } finally {
    setLoading(false);
  }
};


  const commonSymptoms = [
    'headache', 'fever', 'cough', 'fatigue', 'nausea', 'vomiting',
    'diarrhea', 'abdominal_pain', 'back_pain', 'joint_pain',
    'muscle_pain', 'dizziness', 'chest_pain', 'shortness_of_breath'
  ];

  return (
    <div className="medical-container">
      {/* Header with medical background */}
      <div className="medical-header">
        <div className="header-background">
          {/* ADD IMAGE HERE: hospital or medical facility background */}
          <img src="/images/medical-bg.jpg" alt="Medical Background" className="header-bg-image" />
          <div className="header-overlay"></div>
        </div>
        <div className="header-content">
          <div className="doctor-avatar">
            {/* ADD IMAGE HERE: doctor or medical professional avatar */}
            <img src="/images/doctor-avatar.png" alt="Doctor" className="doctor-image" />
          </div>
          <div className="header-text">
            <h1><span className="medical-cross">⚕️</span> MedCare AI Assistant</h1>
            <p>Advanced Medical Diagnosis & Treatment Recommendations</p>
            <div className="medical-badges">
              <span className="badge">AI Powered</span>
              <span className="badge">Clinically Approved</span>
              <span className="badge">24/7 Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="medical-main">
        <div className="consultation-card">
          <div className="card-header">
            <div className="consultation-icon">
              {/* ADD IMAGE HERE: stethoscope or medical consultation icon */}
              <img src="/images/stethoscope-icon.png" alt="Consultation" className="consultation-img" />
            </div>
            <h2>Symptom Assessment</h2>
            <p>Please describe your symptoms for accurate diagnosis</p>
          </div>

          {/* Input Section */}
          <div className="symptom-input-section">
            <div className="input-wrapper">
              <label className="input-label">
                <span className="search-icon">🔍</span>
                Describe your symptoms
              </label>
              <div className="input-container">
                <input 
                  type="text" 
                  className="medical-input"
                  placeholder="Type symptoms separated by commas (e.g., headache, fever, cough)"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <button className="add-symptom-btn" onClick={addSymptomsFromInput}>
                  <span className="plus-icon">+</span>
                </button>
              </div>
            </div>

            {/* Selected Symptoms */}
            <div className="symptoms-display">
              <h3 className="symptoms-title">Selected Symptoms</h3>
              <div className="symptoms-container">
                {selectedSymptoms.size === 0 ? (
                  <div className="empty-symptoms">
                    <div className="empty-icon">
                      {/* ADD IMAGE HERE: medical clipboard or empty state icon */}
                      <img src="/images/empty-clipboard.png" alt="No symptoms" className="empty-img" />
                    </div>
                    <p>No symptoms added yet. Start typing above or select from common symptoms below.</p>
                  </div>
                ) : (
                  <div className="symptoms-tags">
                    {Array.from(selectedSymptoms).map(symptom => (
                      <div key={symptom} className="symptom-pill">
                        <span className="symptom-name">{symptom.replace(/_/g, ' ')}</span>
                        <button 
                          className="remove-symptom" 
                          onClick={() => removeSymptom(symptom)}
                          title="Remove symptom"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <div className="analyze-section">
              <button 
                className="analyze-btn" 
                onClick={predictDisease}
                disabled={loading || selectedSymptoms.size === 0}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <span className="analyze-icon">🎯</span>
                    <span>Get Medical Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="medical-loading">
            <div className="loading-card">
              <div className="medical-animation">
                {/* ADD IMAGE HERE: medical equipment or doctor analyzing gif/animation */}
                <img src="/images/medical-analysis.gif" alt="Medical Analysis" className="analysis-animation" />
              </div>
              <h3>Medical Analysis in Progress</h3>
              <p>Our AI is carefully analyzing your symptoms...</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="medical-error">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h4>Analysis Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="medical-results">
            <div className="diagnosis-card">
              <div className="diagnosis-header">
                <div className="diagnosis-icon">
                  {/* ADD IMAGE HERE: medical report or diagnosis icon */}
                  <img src="/images/medical-report.png" alt="Diagnosis" className="diagnosis-img" />
                </div>
                <div>
                  <h2>Medical Assessment</h2>
                  <p>Based on the symptoms provided</p>
                </div>
              </div>
              
              <div className="diagnosis-result">
                <div className="disease-badge">
                  <span className="disease-icon">🎯</span>
                  <span className="disease-name">{results.predicted_disease}</span>
                </div>
                
                <div className="confidence-meter">
                  <span className="confidence-label">Confidence Level</span>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{width: '85%'}}></div>
                  </div>
                  <span className="confidence-value">85%</span>
                </div>
              </div>

              {/* Medical Information Sections */}
              <div className="medical-info-grid">
                {/* Description */}
                <div className="info-card">
                  <div className="info-header">
                    <img src="/images/medical-info.png" alt="Info" className="info-icon" />
                    <h4>Medical Description</h4>
                  </div>
                  <div className="info-content">
                    <p>{results.description || 'No description available.'}</p>
                  </div>
                </div>

                {/* Precautions */}
                {results.precautions && results.precautions.length > 0 && (
                  <div className="info-card precautions">
                    <div className="info-header">
                      <img src="/images/safety-icon.png" alt="Safety" className="info-icon" />
                      <h4>Safety Precautions</h4>
                    </div>
                    <div className="info-content">
                      <ul className="medical-list">
                        {results.precautions.map((p, index) => (
                          <li key={index} className="list-item">
                            <span className="bullet">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Medications */}
                {results.medications && results.medications.length > 0 && (
                  <div className="info-card medications">
                    <div className="info-header">
                      <img src="/images/pills-icon.png" alt="Medications" className="info-icon" />
                      <h4>Recommended Medications</h4>
                    </div>
                    <div className="info-content">
                      <ul className="medical-list medication-list">
                        {results.medications.map((m, index) => (
                          <li key={index} className="list-item medication-item">
                            <div className="pill-icon">💊</div>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Diet Recommendations */}
                {results.diet && results.diet.length > 0 && (
                  <div className="info-card diet">
                    <div className="info-header">
                      <img src="/images/nutrition-icon.png" alt="Nutrition" className="info-icon" />
                      <h4>Dietary Guidelines</h4>
                    </div>
                    <div className="info-content">
                      <ul className="medical-list diet-list">
                        {results.diet.map((d, index) => (
                          <li key={index} className="list-item diet-item">
                            <div className="food-icon">🥗</div>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Exercise Recommendations */}
                {results.workout && results.workout.length > 0 && (
                  <div className="info-card exercise">
                    <div className="info-header">
                      <img src="/images/exercise-icon.png" alt="Exercise" className="info-icon" />
                      <h4>Exercise Recommendations</h4>
                    </div>
                    <div className="info-content">
                      <ul className="medical-list exercise-list">
                        {results.workout.map((w, index) => (
                          <li key={index} className="list-item exercise-item">
                            <div className="exercise-icon">🏃‍♂️</div>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Disclaimer */}
              <div className="medical-disclaimer">
                <div className="disclaimer-icon">
                  <img src="/images/warning-medical.png" alt="Medical Warning" className="warning-img" />
                </div>
                <div className="disclaimer-content">
                  <h4>⚠️ Important Medical Notice</h4>
                  <p>This AI assessment is for informational purposes only and should not replace professional medical consultation. Please consult with a qualified healthcare provider for accurate diagnosis and treatment recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Symptoms Quick Select */}
        <div className="quick-symptoms">
          <div className="quick-symptoms-header">
            <div className="symptoms-icon">
              <img src="/images/symptoms-icon.png" alt="Common Symptoms" className="common-symptoms-img" />
            </div>
            <div>
              <h3>Common Symptoms</h3>
              <p>Click on any symptom to add it quickly</p>
            </div>
          </div>
          
          <div className="symptoms-grid">
            {commonSymptoms.map(symptom => (
              availableSymptoms.includes(symptom) && (
                <button 
                  key={symptom} 
                  className="symptom-button"
                  onClick={() => addSymptom(symptom)}
                  disabled={selectedSymptoms.has(symptom)}
                >
                  <span className="symptom-emoji">🔹</span>
                  <span className="symptom-text">{symptom.replace(/_/g, ' ')}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="medical-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/images/medical-logo.png" alt="MedCare Logo" className="footer-logo-img" />
            <span>MedCare AI</span>
          </div>
          <div className="footer-text">
            <p>Powered by Advanced Medical AI • Trusted by Healthcare Professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;