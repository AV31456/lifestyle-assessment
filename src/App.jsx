import React, { useState, useEffect } from 'react';
import { LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LifestyleMedicineAssessment = () => {
  const [currentStep, setCurrentStep] = useState('consent');
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [history, setHistory] = useState([]);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
   const [userInfo, setUserInfo] = useState({ age: '', city: '', state: '' });
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await window.storage.get(`history_${userId}`);
        if (result) {
          setHistory(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No previous history found');
      }
    };
    if (window.storage) loadHistory();
  }, [userId]);

  const questions = {
    sleep: [
      { id: 'sleep_hours', question: 'How many hours of sleep do you typically get per night?', type: 'slider', min: 3, max: 12, unit: 'hours', optimal: { min: 8, max: 10 } },
      { id: 'sleep_consistency', question: 'How consistent is your sleep schedule (going to bed and waking up at similar times)?', type: 'dropdown', options: ['Very inconsistent', 'Somewhat inconsistent', 'Neutral', 'Somewhat consistent', 'Very consistent'] },
      { id: 'sleep_quality', question: 'How would you rate your overall sleep quality?', type: 'dropdown', options: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
      { id: 'screen_before_bed', question: 'How often do you use screens (phone, TV, computer) within 1 hour before bed?', type: 'dropdown', options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'] }
    ],
    nutrition: [
      { id: 'meal_frequency', question: 'How many balanced meals do you eat per day?', type: 'slider', min: 0, max: 5, unit: 'meals', optimal: { min: 3, max: 3 } },
     {
  id: 'fruits',
  question: 'How many servings of fruit do you eat daily?',
  type: 'slider',
  min: 0,
  max: 8,
  unit: 'servings',
  optimal: { min: 2, max: 4 }
},
{
  id: 'vegetables',
  question: 'How many servings of vegetables do you eat daily?',
  type: 'slider',
  min: 0,
  max: 10,
  unit: 'servings',
  optimal: { min: 3, max: 5 }
},
      { id: 'water_intake', question: 'How many glasses of water do you drink daily?', type: 'slider', min: 0, max: 15, unit: 'glasses', optimal: { min: 8, max: 10 } },
      { id: 'processed_foods', question: 'How often do you eat highly processed or fast foods?', type: 'dropdown', options: ['Multiple times daily', 'Once daily', 'Few times weekly', 'Rarely', 'Never'] },
      { id: 'breakfast', question: 'How often do you eat breakfast?', type: 'dropdown', options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Every day'] }
    ],
    physical_activity: [
      { id: 'exercise_frequency', question: 'How many days per week do you engage in moderate to vigorous physical activity?', type: 'slider', min: 0, max: 7, unit: 'days', optimal: { min: 5, max: 7 } },
      { id: 'exercise_duration', question: 'On days you exercise, how many minutes do you typically exercise?', type: 'slider', min: 0, max: 120, unit: 'minutes', optimal: { min: 60, max: 90 } },
      { id: 'sedentary_time', question: 'How many hours per day do you spend sitting (excluding sleep)?', type: 'slider', min: 0, max: 16, unit: 'hours', optimal: { min: 0, max: 6 } },
      { id: 'active_transportation', question: 'How often do you walk or bike for transportation?', type: 'dropdown', options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Always'] }
    ],
    stress_management: [
      { id: 'stress_level', question: 'How would you rate your overall stress level?', type: 'dropdown', options: ['Extremely high', 'High', 'Moderate', 'Low', 'Very low'] },
      { id: 'stress_coping', question: 'How often do you practice stress management techniques (meditation, deep breathing, journaling)?', type: 'dropdown', options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Daily'] },
      { id: 'overwhelmed', question: 'How often do you feel overwhelmed by your responsibilities?', type: 'dropdown', options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'] },
      { id: 'relaxation_time', question: 'How much time do you dedicate to relaxation or hobbies daily?', type: 'slider', min: 0, max: 5, unit: 'hours', optimal: { min: 1, max: 2 } }
    ],
    social_connections: [
      { id: 'meaningful_conversations', question: 'How often do you have meaningful conversations with friends or family?', type: 'dropdown', options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Daily'] },
      { id: 'social_support', question: 'How supported do you feel by your social network?', type: 'dropdown', options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'] },
      { id: 'social_activities', question: 'How many times per week do you engage in social activities?', type: 'slider', min: 0, max: 15, unit: 'times', optimal: { min: 3, max: 7 } },
      { id: 'loneliness', question: 'How often do you feel lonely?', type: 'dropdown', options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'] }
    ],
    screen_time: [
      { id: 'daily_screen_time', question: 'How many hours per day do you spend on screens for non-school/work purposes?', type: 'slider', min: 0, max: 16, unit: 'hours', optimal: { min: 0, max: 2 } },
      { id: 'social_media', question: 'How much time do you spend on social media daily?', type: 'slider', min: 0, max: 8, unit: 'hours', optimal: { min: 0, max: 1 } },
      { id: 'screen_breaks', question: 'How often do you take breaks from screens?', type: 'dropdown', options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Very frequently'] }
    ]
  };

  const calculateScores = (answers) => {
    const scoreByCategory = {};
    Object.keys(questions).forEach(category => {
      const categoryQuestions = questions[category];
      let totalScore = 0;
      let questionCount = 0;
      categoryQuestions.forEach(q => {
        const answer = answers[q.id];
        if (answer !== undefined && answer >= 0) {
          let score = 0;
          if (q.type === 'slider') {
            if (q.optimal) {
              const value = answer;
              if (q.id === 'sedentary_time' || q.id === 'daily_screen_time' || q.id === 'social_media') {
                const maxBad = q.max;
                const maxGood = q.optimal.max;
                score = value <= maxGood ? 10 : Math.max(0, 10 - ((value - maxGood) / (maxBad - maxGood)) * 10);
              } else {
                if (value >= q.optimal.min && value <= q.optimal.max) {
                  score = 10;
                } else if (value < q.optimal.min) {
                  score = (value / q.optimal.min) * 10;
                } else {
                  score = Math.max(0, 10 - ((value - q.optimal.max) / (q.max - q.optimal.max)) * 5);
                }
              }
            }
          } else if (q.type === 'dropdown') {
            const index = answer;
            const optionsCount = q.options.length;
            const lowerIsBetter = q.id.includes('processed') || q.id.includes('stress_level') || q.id.includes('overwhelmed') || q.id.includes('loneliness') || q.id.includes('screen_before_bed');
            if (lowerIsBetter) {
              score = ((optionsCount - 1 - index) / (optionsCount - 1)) * 10;
            } else {
              score = (index / (optionsCount - 1)) * 10;
            }
          }
          totalScore += score;
          questionCount++;
        }
      });
      scoreByCategory[category] = questionCount > 0 ? totalScore / questionCount : 0;
    });
    return scoreByCategory;
  };

  const generateRecommendations = async (s) => {
    setLoading(true);
    try {
      const KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Provide 5 short wellness tips for these wellness scores: " + JSON.stringify(s) + ". Return ONLY a JSON array: [{\"category\": \"string\", \"title\": \"string\", \"action\": \"string\", \"why\": \"string\"}]" }] }]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `HTTP Error ${res.status}`);
      const rawText = data.candidates[0].content.parts[0].text;
      const cleaned = rawText.replace(/```json|json|```/gi, "").trim();
      setRecommendations(JSON.parse(cleaned));
    } catch (e) {
      console.error("API Error:", e);
      setRecommendations([
        { category: "general", title: "Start Small", action: "Pick one healthy habit to focus on this week.", why: "Small, consistent changes lead to lasting results." },
        { category: "general", title: "Track Progress", action: "Retake this assessment in 4 weeks.", why: "Monitoring helps maintain motivation." }
      ]);
    }
    setLoading(false);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

 const handleSubmit = async () => {
  const calculatedScores = calculateScores(answers);
  setScores(calculatedScores);
  generateRecommendations(calculatedScores);
  setCurrentStep('results');
  
  // Track submission to Google Sheets
  const overallScore = Object.values(calculatedScores).reduce((a, b) => a + b, 0) / Object.keys(calculatedScores).length;
  try {
    await fetch('https://api.sheetbest.com/sheets/a99766d4-2760-4aaa-9610-31c98d7c09bf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Timestamp: new Date().toLocaleString(),
        Age: userInfo.age,
        City: userInfo.city,
        State: userInfo.state,
        'Sleep Score': calculatedScores.sleep?.toFixed(1) || '0',
        'Nutrition Score': calculatedScores.nutrition?.toFixed(1) || '0',
        'Physical Activity Score': calculatedScores.physical_activity?.toFixed(1) || '0',
        'Stress Management Score': calculatedScores.stress_management?.toFixed(1) || '0',
        'Social Connections Score': calculatedScores.social_connections?.toFixed(1) || '0',
        'Screen Time Score': calculatedScores.screen_time?.toFixed(1) || '0',
        'Overall Score': overallScore.toFixed(1),
        'Feedback Rating': ''
      })
    });
  } catch (e) {
    console.log('Failed to track submission:', e);
  }
};

  const restartAssessment = () => {
    setCurrentStep('consent');
    setAnswers({});
    setScores(null);
    setRecommendations(null);
    setShowCrisisResources(false);
  };

  const getCurrentQuestions = () => {
    if (currentStep === 'consent' || currentStep === 'results') return [];
    return questions[currentStep] || [];
  };

  const currentQuestions = getCurrentQuestions();
  const allQuestionsAnswered = currentQuestions.every(q => {
    const ans = answers[q.id];
    return ans !== undefined && ans !== -1 && ans !== '';
  });
  
  const categorySteps = Object.keys(questions);
  const currentStepIndex = categorySteps.indexOf(currentStep);
  const progress = currentStep === 'results' ? 100 : currentStep === 'consent' ? 0 : ((currentStepIndex + 1) / categorySteps.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: '"Epilogue", system-ui, sans-serif', padding: '2rem 1rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.6s ease-out; }
        .slide-in { animation: slideIn 0.4s ease-out; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 8px; border-radius: 5px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); outline: none; opacity: 0.9; transition: opacity 0.2s; }
        input[type="range"]:hover { opacity: 1; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.2s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: none; transition: transform 0.2s; }
        input[type="range"]::-moz-range-thumb:hover { transform: scale(1.2); }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Lifestyle Medicine Assessment</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto', fontWeight: '400' }}>Discover your wellness baseline and get personalized recommendations</p>
        </div>

        {currentStep !== 'consent' && (
          <div className="fade-in" style={{ background: 'rgba(255,255,255,0.2)', height: '8px', borderRadius: '20px', marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ background: 'white', height: '100%', width: `${progress}%`, borderRadius: '20px', transition: 'width 0.5s ease' }} />
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '24px', padding: 'clamp(1.5rem, 4vw, 3rem)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minHeight: '500px' }}>
          
          {currentStep === 'consent' && (
  <div className="fade-in">
    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1a1a2e' }}>Before We Begin</h2>
    
    <div style={{ background: '#fff4e6', border: '2px solid #ff9800', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 1rem 0', color: '#e65100' }}>⚠️ Important Disclaimer</h3>
      <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.6', color: '#2c2c3e' }}>This tool provides <strong>general educational information</strong> about healthy lifestyle habits based on evidence-based guidelines from the American College of Lifestyle Medicine and Stanford Lifestyle Medicine.</p>
      <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.6', color: '#2c2c3e' }}>This is <strong>NOT medical advice</strong> and does NOT diagnose, treat, or prevent any disease. Always consult with a healthcare provider before making changes to your health routine, especially if you have existing medical conditions.</p>
      <p style={{ margin: '0', lineHeight: '1.6', color: '#2c2c3e' }}>Your responses are stored anonymously for progress tracking only and are never shared with third parties.</p>
    </div>

    <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.75rem 0', color: '#1a1a2e' }}>Your Information</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c2c3e' }}>Age *</label>
        <input type="number" id="userAge" min="13" max="120" placeholder="Enter your age" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid #e0e0e0', borderRadius: '8px' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c2c3e' }}>City</label>
        <input type="text" id="userCity" placeholder="Enter your city" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid #e0e0e0', borderRadius: '8px' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c2c3e' }}>State</label>
        <input type="text" id="userState" placeholder="Enter your state" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid #e0e0e0', borderRadius: '8px' }} />
      </div>
      
      <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '0.75rem' }}>
        <input type="checkbox" id="ageConfirm" style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer', accentColor: '#667eea' }} />
        <span style={{ lineHeight: '1.6', color: '#2c2c3e' }}>I confirm that I am 13 years of age or older. If I am under 18, I will discuss my results with a parent or guardian.</span>
      </label>
    </div>

    <div style={{ background: '#e8f5e9', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.75rem 0', color: '#1a1a2e' }}>What to Expect</h3>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8', color: '#2c2c3e' }}>
        <li>6 categories covering all pillars of lifestyle medicine</li>
        <li>Approximately 10 minutes to complete</li>
        <li>Personalized recommendations based on your responses</li>
        <li>Visual dashboard showing your wellness profile</li>
        <li>Ability to track progress over time</li>
      </ul>
    </div>

   <button onClick={() => { 
  const checkbox = document.getElementById('ageConfirm'); 
  const age = document.getElementById('userAge').value;
  const city = document.getElementById('userCity').value || 'Not provided';
  const state = document.getElementById('userState').value || 'Not provided';
  if (checkbox && checkbox.checked && age >= 13) {
    setUserInfo({ age, city, state });
    setCurrentStep('sleep'); 
  } else if (!age || age < 13) {
    alert('Please enter a valid age (13 or older).');
  } else {
    alert('Please confirm you are 13 or older to continue.'); 
  }
}} style={{ width: '100%', padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'; }}>Start Assessment</button>
  </div>
)}
{currentStep === 'feedback' && (
  <div className="fade-in">
    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1a1a2e' }}>One More Thing!</h2>
    <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>Before we show your results, please rate your experience</p>
    
    <div style={{ background: '#f0f4ff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', border: '2px solid #667eea' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a2e', textAlign: 'center' }}>How helpful was this assessment?</h3>
      <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center' }}>Rate from 1 (not helpful) to 10 (extremely helpful)</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
          <button 
            key={num}
            onClick={async () => {
              try {
                await fetch('https://api.sheetbest.com/sheets/a99766d4-2760-4aaa-9610-31c98d7c09bf', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    Timestamp: new Date().toLocaleString(),
                    Type: 'Feedback',
                    'Feedback Rating': num
                  })
                });
              } catch (e) {
                console.log('Failed to track feedback');
              }
              setCurrentStep('results');
            }}
            style={{ 
              padding: '1rem', 
              background: num <= 4 ? '#f44336' : num <= 7 ? '#ff9800' : '#4caf50',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '1.2rem', 
              fontWeight: '700', 
              cursor: 'pointer',
              minWidth: '60px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

          {currentStep !== 'consent' && currentStep !== 'results' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#1a1a2e', textTransform: 'capitalize' }}>{currentStep.replace('_', ' ')}</h2>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.9rem', color: '#667eea', fontWeight: '700' }}>{currentStepIndex + 1} / {categorySteps.length}</span>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                {currentQuestions.map((q, idx) => (
                  <div key={q.id} className="slide-in" style={{ marginBottom: '2.5rem', animationDelay: `${idx * 0.1}s` }}>
                    <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2c2c3e', lineHeight: '1.4' }}>{q.question}</label>
                    {q.type === 'slider' && (
                      <div>
                        <input type="range" min={q.min} max={q.max} value={answers[q.id] !== undefined ? answers[q.id] : q.min} onChange={(e) => handleAnswer(q.id, parseFloat(e.target.value))} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                          <span>{q.min} {q.unit}</span>
                          <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#667eea' }}>{answers[q.id] !== undefined ? answers[q.id] : q.min} {q.unit}</span>
                          <span>{q.max} {q.unit}</span>
                        </div>
                      </div>
                    )}
                    {q.type === 'dropdown' && (
                      <select value={answers[q.id] !== undefined ? answers[q.id] : '-1'} onChange={(e) => { const val = parseInt(e.target.value); if (val >= 0) handleAnswer(q.id, val); }} style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: '2px solid #e0e0e0', borderRadius: '10px', background: 'white', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23667eea' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '3rem', color: answers[q.id] !== undefined && answers[q.id] >= 0 ? '#2c2c3e' : '#9ca3af', fontWeight: answers[q.id] !== undefined && answers[q.id] >= 0 ? '600' : '400' }}>
                        <option value="-1" disabled>Select an option...</option>
                        {q.options.map((option, optIdx) => (
                          <option key={optIdx} value={optIdx}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                {currentStepIndex > 0 && (
                  <button onClick={() => setCurrentStep(categorySteps[currentStepIndex - 1])} style={{ padding: '0.875rem 1.75rem', background: 'white', color: '#667eea', border: '2px solid #667eea', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f0f4ff'} onMouseLeave={(e) => e.target.style.background = 'white'}>← Back</button>
                )}
                <button onClick={() => { if (currentStepIndex < categorySteps.length - 1) { setCurrentStep(categorySteps[currentStepIndex + 1]); } else { handleSubmit(); }}} disabled={!allQuestionsAnswered} style={{ padding: '0.875rem 1.75rem', background: allQuestionsAnswered ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: allQuestionsAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginLeft: 'auto' }} onMouseEnter={(e) => { if (allQuestionsAnswered) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'; }}} onMouseLeave={(e) => { if (allQuestionsAnswered) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}}>{currentStepIndex < categorySteps.length - 1 ? 'Next →' : 'Get Results'}</button>
              </div>
            </div>
          )}

          {currentStep === 'results' && scores && (
            <div className="fade-in">
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1a1a2e' }}>Your Wellness Profile</h2>
              <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>Here's your personalized assessment based on evidence-based lifestyle medicine principles</p>
              <div style={{ background: '#f8f9ff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1a1a2e', textAlign: 'center' }}>Your Lifestyle Medicine Score</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={Object.entries(scores).map(([category, score]) => ({ category: category.replace('_', ' '), score: parseFloat(score.toFixed(1)), fullMark: 10 }))}>
                    <PolarGrid stroke="#667eea" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#2c2c3e', fontSize: 12, fontWeight: 600 }} style={{ textTransform: 'capitalize' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#666' }} />
                    <Radar name="Your Score" dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.6} strokeWidth={3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {Object.entries(scores).map(([category, score]) => (
                  <div key={category} style={{ background: 'white', border: `3px solid ${score >= 7 ? '#4caf50' : score >= 4 ? '#ff9800' : '#f44336'}`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{category.replace('_', ' ')}</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: score >= 7 ? '#4caf50' : score >= 4 ? '#ff9800' : '#f44336' }}>{score.toFixed(1)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>out of 10</div>
                  </div>
                ))}
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #667eea', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: '#666' }}>Generating your personalized recommendations...</p>
                </div>
              ) : recommendations ? (
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1a1a2e' }}>Your Personalized Action Plan</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recommendations.map((rec, idx) => (
                      <div key={idx} style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)', border: '2px solid #e0e7ff', borderRadius: '12px', padding: '1.5rem', borderLeft: '6px solid #667eea' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <span style={{ background: '#667eea', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 }}>{idx + 1}</span>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{rec.category || 'general'}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e' }}>{rec.title}</div>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#2c2c3e', lineHeight: '1.6' }}><strong>Action:</strong> {rec.action}</p>
                        {rec.why && <p style={{ margin: '0', fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}><strong>Why:</strong> {rec.why}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button onClick={restartAssessment} style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', flex: '1', minWidth: '200px' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>Take Assessment Again</button>
              </div>
              <div style={{ background: '#f0f4ff', borderRadius: '16px', padding: '2rem', marginTop: '2rem', border: '2px solid #667eea' }}>
  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a2e' }}>Was this assessment helpful?</h3>
  <p style={{ marginBottom: '1.5rem', color: '#666' }}>Your feedback helps us improve the tool for other teens!</p>
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
  </div>
</div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'white', fontSize: '0.9rem', opacity: 0.9 }}>
  <p style={{ margin: '0.5rem 0' }}>Powered by <strong>Teen Lifestyle Medicine</strong></p>
  <p style={{ margin: '0.5rem 0' }}>In partnership with <strong>Stanford Lifestyle Medicine</strong> & <strong>ACLM</strong></p>
  <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>This tool is for educational purposes only and does not provide medical advice</p>
</div>
      </div>
    </div>
  );
};

export default LifestyleMedicineAssessment;
