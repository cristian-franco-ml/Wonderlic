// Wonderlic Practice App
class WonderlicApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.currentSession = [];
        this.selectedAnswer = null;
        this.timer = null;
        this.timeLeft = 120; // 2 minutes per question
        this.sessionStats = {
            correct: 0,
            incorrect: 0,
            total: 0
        };
        
        // Learning analytics system
        this.userAnalytics = {
            weakAreas: {
                math: { correct: 0, total: 0, percentage: 0 },
                logic: { correct: 0, total: 0, percentage: 0 },
                analogy: { correct: 0, total: 0, percentage: 0 },
                comprehension: { correct: 0, total: 0, percentage: 0 },
                knowledge: { correct: 0, total: 0, percentage: 0 },
                vocabulary: { correct: 0, total: 0, percentage: 0 }
            },
            commonMistakes: [],
            timeAnalysis: {
                fast: { correct: 0, total: 0 },
                medium: { correct: 0, total: 0 },
                slow: { correct: 0, total: 0 }
            },
            improvementSuggestions: []
        };
        
        this.apiKey = localStorage.getItem('kimi_api_key') || '';
        
        this.initializeApp();
        this.bindEvents();
        this.loadStats();
        this.loadAnalytics();
        this.startNewSession();
    }

    // Wonderlic-style questions database
    questions = [
        {
            id: 1,
            question: "What is the next number in the sequence? 2, 4, 8, 16, ?",
            options: ["24", "32", "20", "28"],
            correct: 1,
            type: "math",
            explanation: "Each number is multiplied by 2. 16 × 2 = 32"
        },
        {
            id: 2,
            question: "If you buy 3 apples for $2.40, how much do 5 apples cost?",
            options: ["$4.00", "$3.60", "$4.20", "$3.80"],
            correct: 0,
            type: "math",
            explanation: "Each apple costs $0.80 ($2.40 ÷ 3). 5 apples cost $4.00 (5 × $0.80)"
        },
        {
            id: 3,
            question: "Which of these words does not belong to the group?",
            options: ["Dog", "Cat", "Bird", "Table"],
            correct: 3,
            type: "logic",
            explanation: "Table is an inanimate object, while the others are animals"
        },
        {
            id: 4,
            question: "A train travels 60 miles in 45 minutes. What is its speed in miles per hour?",
            options: ["75 mph", "80 mph", "85 mph", "90 mph"],
            correct: 1,
            type: "math",
            explanation: "60 miles in 45 minutes = 60 ÷ (45/60) = 60 ÷ 0.75 = 80 mph"
        },
        {
            id: 5,
            question: "If BOOK is to READ as FOOD is to:",
            options: ["Cook", "Eat", "Buy", "Serve"],
            correct: 1,
            type: "analogy",
            explanation: "The relationship is object-primary action: BOOK is used to read, FOOD is used to eat"
        },
        {
            id: 6,
            question: "How many months have exactly 30 days?",
            options: ["4", "5", "6", "7"],
            correct: 0,
            type: "logic",
            explanation: "April, June, September, and November have exactly 30 days (4 months)"
        },
        {
            id: 7,
            question: "If a product costs $80 and has a 25% discount, what is the final price?",
            options: ["$60", "$65", "$55", "$70"],
            correct: 0,
            type: "math",
            explanation: "Discount: $80 × 0.25 = $20. Final price: $80 - $20 = $60"
        },
        {
            id: 8,
            question: "What is the area of a rectangle 8 meters long and 6 meters wide?",
            options: ["48 m²", "42 m²", "54 m²", "36 m²"],
            correct: 0,
            type: "math",
            explanation: "Area = length × width = 8 × 6 = 48 m²"
        },
        {
            id: 9,
            question: "If today is Tuesday, what day will it be in 100 days?",
            options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
            correct: 2,
            type: "logic",
            explanation: "100 ÷ 7 = 14 weeks and 2 days. Tuesday + 2 days = Thursday"
        },
        {
            id: 10,
            question: "Find the missing number: 3, 7, 15, 31, ?",
            options: ["47", "63", "55", "71"],
            correct: 1,
            type: "math",
            explanation: "Pattern: each number is (previous × 2) + 1. 31 × 2 + 1 = 63"
        },
        {
            id: 11,
            question: "What is the opposite of 'Abundant'?",
            options: ["Scarce", "Much", "Large", "Small"],
            correct: 0,
            type: "vocabulary",
            explanation: "Abundant means there is plenty of something, the opposite is scarce"
        },
        {
            id: 12,
            question: "If 5x + 3 = 18, what is the value of x?",
            options: ["3", "4", "5", "2"],
            correct: 0,
            type: "math",
            explanation: "5x + 3 = 18 → 5x = 15 → x = 3"
        },
        {
            id: 13,
            question: "How many letters are in the English alphabet?",
            options: ["24", "25", "26", "27"],
            correct: 2,
            type: "knowledge",
            explanation: "The English alphabet has 26 letters"
        },
        {
            id: 14,
            question: "If a circle has a radius of 5 cm, what is its diameter?",
            options: ["10 cm", "15 cm", "20 cm", "25 cm"],
            correct: 0,
            type: "math",
            explanation: "The diameter is twice the radius: 5 × 2 = 10 cm"
        },
        {
            id: 15,
            question: "Which of these numbers is prime?",
            options: ["15", "21", "17", "25"],
            correct: 2,
            type: "math",
            explanation: "17 is prime because it is only divisible by 1 and itself"
        }
    ];

    initializeApp() {
        this.updateDisplay();
        
        // API modal will be shown when user tries to use AI features
        // or clicks API Settings button
    }

    bindEvents() {
        // Question controls
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        
        // General controls
        document.getElementById('new-questions-btn').addEventListener('click', () => this.startNewSession());
        document.getElementById('generate-ai-btn').addEventListener('click', () => this.generateAIQuestions());
        document.getElementById('learning-dashboard-btn').addEventListener('click', () => this.showLearningDashboard());
        document.getElementById('api-config-btn').addEventListener('click', () => this.showApiModal());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistory());
        document.getElementById('reset-stats-btn').addEventListener('click', () => this.resetStats());
        
        // Modals
        document.getElementById('close-history').addEventListener('click', () => this.closeModal('history-modal'));
        document.getElementById('close-api').addEventListener('click', () => this.closeModal('api-modal'));
        document.getElementById('close-learning-dashboard').addEventListener('click', () => this.closeModal('learning-dashboard-modal'));
        document.getElementById('save-api-key').addEventListener('click', () => this.saveApiKey());
        
        // History filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterHistory(e.target.dataset.filter));
        });
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    startNewSession() {
        this.currentQuestionIndex = 0;
        this.sessionStats = { correct: 0, incorrect: 0, total: 0 };
        this.currentSession = this.shuffleArray([...this.questions]).slice(0, 10);
        this.hideFeedback();
        this.loadQuestion();
        this.updateSessionDisplay();
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.currentSession.length) {
            this.endSession();
            return;
        }

        const question = this.currentSession[this.currentQuestionIndex];
        this.selectedAnswer = null;
        
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-in-session').textContent = this.currentSession.length;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                ${option}
            `;
            optionDiv.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionDiv);
        });
        
        document.getElementById('submit-btn').disabled = true;
        this.resetTimer();
        this.startTimer();
    }

    selectOption(index) {
        // Limpiar selecciones anteriores
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Seleccionar nueva opción
        document.querySelectorAll('.option')[index].classList.add('selected');
        this.selectedAnswer = index;
        document.getElementById('submit-btn').disabled = false;
    }

    submitAnswer() {
        if (this.selectedAnswer === null) return;
        
        this.stopTimer();
        const question = this.currentSession[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct;
        const timeSpent = 120 - this.timeLeft;
        
        // Update learning analytics
        this.updateAnalytics(question, this.selectedAnswer, isCorrect, timeSpent);
        
        // Actualizar estadísticas
        if (isCorrect) {
            this.sessionStats.correct++;
        } else {
            this.sessionStats.incorrect++;
        }
        this.sessionStats.total++;
        
        // Guardar en historial
        this.saveToHistory({
            question: question.question,
            options: question.options,
            userAnswer: this.selectedAnswer,
            correctAnswer: question.correct,
            isCorrect: isCorrect,
            explanation: question.explanation,
            timestamp: new Date().toISOString(),
            type: question.type,
            timeSpent: timeSpent
        });
        
        // Mostrar feedback visual
        this.showAnswerFeedback(isCorrect, question);
        
        // Obtener feedback de IA si está disponible
        if (this.apiKey && !isCorrect) {
            this.getAIFeedback(question, this.selectedAnswer);
        }
        
        this.updateDisplay();
        
        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'inline-flex';
    }

    showAnswerFeedback(isCorrect, question) {
        const options = document.querySelectorAll('.option');
        options.forEach((option, index) => {
            option.classList.add('disabled');
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === this.selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackExplanation = document.getElementById('feedback-explanation');
        
        feedbackSection.className = 'feedback-section';
        if (!isCorrect) {
            feedbackSection.classList.add('incorrect');
        }
        
        feedbackTitle.textContent = isCorrect ? 'Correct Answer!' : 'Incorrect Answer';
        feedbackExplanation.textContent = question.explanation;
        
        feedbackSection.style.display = 'block';
    }

    async getAIFeedback(question, userAnswer) {
        const aiFeedback = document.getElementById('ai-feedback');
        const aiFeedbackContent = document.getElementById('ai-feedback-content');
        
        aiFeedback.style.display = 'block';
        aiFeedbackContent.textContent = 'Analyzing your answer...';
        
        // Enhanced local feedback when API is not available
        if (!this.apiKey) {
            const feedback = this.generateLocalFeedback(question, userAnswer);
            aiFeedbackContent.textContent = feedback;
            return;
        }
        
        try {
            const prompt = `
            Analyze this Wonderlic test question:
            
            Question: ${question.question}
            Options: ${question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}
            Correct answer: ${String.fromCharCode(65 + question.correct)}) ${question.options[question.correct]}
            User's answer: ${String.fromCharCode(65 + userAnswer)}) ${question.options[userAnswer]}
            
            Please provide a detailed analysis in English of why the user's answer is incorrect and explain the correct reasoning in an educational and constructive manner. Keep an encouraging tone.
            `;
            
            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-8k',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                aiFeedbackContent.textContent = data.choices[0].message.content;
            } else {
                const errorData = await response.text();
                console.error('API Response:', response.status, errorData);
                if (response.status === 401) {
                    // Fallback to local feedback
                    const feedback = this.generateLocalFeedback(question, userAnswer);
                    aiFeedbackContent.textContent = feedback;
                } else if (response.status === 429) {
                    aiFeedbackContent.textContent = 'Rate limit exceeded. Please try again later.';
                } else {
                    aiFeedbackContent.textContent = `API Error: ${response.status}. Using local feedback instead.`;
                    const feedback = this.generateLocalFeedback(question, userAnswer);
                    aiFeedbackContent.textContent = feedback;
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            const feedback = this.generateLocalFeedback(question, userAnswer);
            aiFeedbackContent.textContent = feedback;
        }
    }

    generateLocalFeedback(question, userAnswer) {
        const userAnswerText = question.options[userAnswer];
        const correctAnswerText = question.options[question.correct];
        
        let feedback = `🤔 **Analysis of Your Answer**\n\n`;
        feedback += `**Your answer:** ${userAnswerText}\n`;
        feedback += `**Correct answer:** ${correctAnswerText}\n\n`;
        feedback += `**Explanation:** ${question.explanation}\n\n`;
        
        // Add personalized feedback based on learning analytics
        const personalizedFeedback = this.getPersonalizedFeedback(question.type);
        feedback += personalizedFeedback;
        
        return feedback;
    }

    updateAnalytics(question, userAnswer, isCorrect, timeSpent) {
        const questionType = question.type;
        
        // Update weak areas analysis
        if (this.userAnalytics.weakAreas[questionType]) {
            this.userAnalytics.weakAreas[questionType].total++;
            if (isCorrect) {
                this.userAnalytics.weakAreas[questionType].correct++;
            }
            this.userAnalytics.weakAreas[questionType].percentage = 
                (this.userAnalytics.weakAreas[questionType].correct / this.userAnalytics.weakAreas[questionType].total) * 100;
        }
        
        // Update time analysis
        let timeCategory = 'medium';
        if (timeSpent < 30) timeCategory = 'fast';
        else if (timeSpent > 90) timeCategory = 'slow';
        
        this.userAnalytics.timeAnalysis[timeCategory].total++;
        if (isCorrect) {
            this.userAnalytics.timeAnalysis[timeCategory].correct++;
        }
        
        // Track common mistakes
        if (!isCorrect) {
            const mistake = {
                type: questionType,
                question: question.question,
                userAnswer: question.options[userAnswer],
                correctAnswer: question.options[question.correct],
                timeSpent: timeSpent,
                timestamp: new Date().toISOString()
            };
            this.userAnalytics.commonMistakes.push(mistake);
            
            // Keep only last 20 mistakes to avoid memory issues
            if (this.userAnalytics.commonMistakes.length > 20) {
                this.userAnalytics.commonMistakes.shift();
            }
        }
        
        // Generate improvement suggestions
        this.generateImprovementSuggestions();
        
        // Save analytics to localStorage
        this.saveAnalytics();
    }

    getPersonalizedFeedback(questionType) {
        const weakArea = this.userAnalytics.weakAreas[questionType];
        const percentage = weakArea ? weakArea.percentage : 0;
        
        let feedback = '';
        
        // Base encouraging messages with personalization
        const encouragingMessages = {
            'math': {
                high: '🎯 **Excellent!** Your math skills are strong. Focus on speed and complex problems.',
                medium: '📊 **Good progress!** Practice breaking down problems into smaller steps.',
                low: '🔢 **Focus area:** Math needs attention. Practice basic operations and problem-solving strategies.'
            },
            'logic': {
                high: '🧠 **Sharp thinking!** Your logical reasoning is excellent.',
                medium: '🔍 **Good logic!** Practice identifying patterns and relationships.',
                low: '🧩 **Focus area:** Logic needs work. Practice pattern recognition and sequence problems.'
            },
            'analogy': {
                high: '🔗 **Great connections!** Your analogy skills are strong.',
                medium: '⚡ **Good analogies!** Practice identifying relationships between concepts.',
                low: '🔗 **Focus area:** Analogies need practice. Study word relationships and connections.'
            },
            'comprehension': {
                high: '📖 **Excellent reading!** Your comprehension skills are strong.',
                medium: '📚 **Good reading!** Practice reading carefully and identifying key details.',
                low: '📖 **Focus area:** Comprehension needs work. Practice reading strategies and detail recognition.'
            },
            'knowledge': {
                high: '📚 **Great knowledge!** Your general knowledge is impressive.',
                medium: '🌍 **Good knowledge!** Keep reading and staying curious.',
                low: '📚 **Focus area:** General knowledge needs expansion. Read widely and stay curious.'
            },
            'vocabulary': {
                high: '📖 **Excellent vocabulary!** Your word knowledge is strong.',
                medium: '📝 **Good vocabulary!** Keep building your word knowledge.',
                low: '📖 **Focus area:** Vocabulary needs work. Read widely and look up unfamiliar words.'
            }
        };
        
        let performance = 'low';
        if (percentage >= 80) performance = 'high';
        else if (percentage >= 60) performance = 'medium';
        
        const messages = encouragingMessages[questionType] || encouragingMessages['knowledge'];
        feedback += messages[performance] + '\n\n';
        
        // Add specific improvement suggestions
        const suggestions = this.getImprovementSuggestions(questionType);
        if (suggestions.length > 0) {
            feedback += '🎯 **Personalized Tips:**\n';
            suggestions.forEach(suggestion => {
                feedback += `• ${suggestion}\n`;
            });
            feedback += '\n';
        }
        
        return feedback;
    }

    generateImprovementSuggestions() {
        this.userAnalytics.improvementSuggestions = [];
        
        // Analyze weak areas
        Object.entries(this.userAnalytics.weakAreas).forEach(([type, stats]) => {
            if (stats.total >= 3 && stats.percentage < 60) {
                this.userAnalytics.improvementSuggestions.push({
                    type: type,
                    priority: 'high',
                    message: `Focus on ${type} questions - your accuracy is ${stats.percentage.toFixed(1)}%`
                });
            }
        });
        
        // Analyze time patterns
        const timeStats = this.userAnalytics.timeAnalysis;
        if (timeStats.fast.total > 0 && (timeStats.fast.correct / timeStats.fast.total) < 0.5) {
            this.userAnalytics.improvementSuggestions.push({
                type: 'timing',
                priority: 'medium',
                message: 'Slow down on easy questions - rushing leads to mistakes'
            });
        }
        
        if (timeStats.slow.total > 0 && (timeStats.slow.correct / timeStats.slow.total) < 0.7) {
            this.userAnalytics.improvementSuggestions.push({
                type: 'timing',
                priority: 'medium',
                message: 'Practice time management - some questions take too long'
            });
        }
        
        // Sort by priority
        this.userAnalytics.improvementSuggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    getImprovementSuggestions(questionType) {
        return this.userAnalytics.improvementSuggestions
            .filter(suggestion => suggestion.type === questionType || suggestion.type === 'timing')
            .slice(0, 3)
            .map(suggestion => suggestion.message);
    }

    loadAnalytics() {
        const saved = localStorage.getItem('wonderlic_analytics');
        if (saved) {
            this.userAnalytics = JSON.parse(saved);
        }
    }

    saveAnalytics() {
        localStorage.setItem('wonderlic_analytics', JSON.stringify(this.userAnalytics));
    }

    async generateAIQuestions() {
        if (!this.apiKey) {
            // Generate new questions locally instead of showing API modal
            this.generateLocalQuestions();
            return;
        }
        
        document.getElementById('loading-overlay').style.display = 'block';
        
        try {
            // Get user's weak areas to focus on those
            const weakAreas = this.getWeakAreas();
            const focusAreas = weakAreas.length > 0 ? 
                `Focus especially on: ${weakAreas.join(', ')}` : 
                'Include a balanced mix of all question types';
            
            const prompt = `
            Generate 10 completely NEW and ORIGINAL questions for a Wonderlic-style aptitude test. 
            These must be completely different from any existing questions.
            
            Requirements:
            - 3 math questions (arithmetic, percentages, basic algebra, geometry)
            - 2 logic and pattern questions (sequences, analogies, reasoning)
            - 2 verbal analogy questions (word relationships, comparisons)
            - 2 comprehension and reasoning questions (reading comprehension, problem solving)
            - 1 general knowledge question (current events, science, history)
            
            ${focusAreas}
            
            IMPORTANT: Make questions challenging but fair, similar to real Wonderlic test difficulty.
            Ensure all questions are completely original and not variations of existing ones.
            
            Use this exact JSON format:
            [
                {
                    "question": "original question text",
                    "options": ["option A", "option B", "option C", "option D"],
                    "correct": correct_answer_index (0-3),
                    "type": "math|logic|analogy|comprehension|knowledge",
                    "explanation": "detailed explanation of why this answer is correct"
                }
            ]
            
            Make sure all questions are in English and completely original.
            `;
            
            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-8k',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.9,
                    max_tokens: 2000
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                
                // Extract JSON from the content
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    try {
                        const newQuestions = JSON.parse(jsonMatch[0]);
                        if (Array.isArray(newQuestions) && newQuestions.length > 0) {
                            // Validate and enhance questions
                            const validatedQuestions = newQuestions.map((q, index) => ({
                                ...q,
                                id: Date.now() + index,
                                question: q.question.trim(),
                                options: q.options.map(opt => opt.trim()),
                                correct: parseInt(q.correct),
                                type: q.type || 'knowledge',
                                explanation: q.explanation || 'Correct answer explanation'
                            })).filter(q => 
                                q.question && 
                                q.options.length === 4 && 
                                q.correct >= 0 && 
                                q.correct < 4
                            );
                            
                            if (validatedQuestions.length >= 5) {
                                this.questions = validatedQuestions;
                                this.startNewSession();
                                alert(`Generated ${validatedQuestions.length} new AI questions successfully!`);
                            } else {
                                throw new Error('Not enough valid questions generated');
                            }
                        } else {
                            throw new Error('Invalid question format');
                        }
                    } catch (parseError) {
                        console.error('JSON Parse Error:', parseError);
                        alert('Error parsing AI response. Using local generation instead.');
                        this.generateLocalQuestions();
                    }
                } else {
                    console.error('No JSON found in response');
                    alert('No valid questions found in AI response. Using local generation instead.');
                    this.generateLocalQuestions();
                }
            } else {
                const errorData = await response.text();
                console.error('API Response:', response.status, errorData);
                if (response.status === 401) {
                    // Fallback to local question generation
                    this.generateLocalQuestions();
                } else if (response.status === 429) {
                    alert('Rate limit exceeded. Please try again later.');
                } else {
                    alert(`API Error: ${response.status}. Using local generation instead.`);
                    this.generateLocalQuestions();
                }
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            // Fallback to local question generation
            this.generateLocalQuestions();
        } finally {
            document.getElementById('loading-overlay').style.display = 'none';
        }
    }

    getWeakAreas() {
        const weakAreas = [];
        Object.entries(this.userAnalytics.weakAreas).forEach(([type, stats]) => {
            if (stats.total >= 3 && stats.percentage < 60) {
                weakAreas.push(type);
            }
        });
        return weakAreas;
    }

    generateLocalQuestions() {
        // Create a larger pool of diverse questions
        const questionPool = [
            // Math Questions
            {
                question: "If a car travels 240 miles in 4 hours, what is its average speed in miles per hour?",
                options: ["50 mph", "60 mph", "70 mph", "80 mph"],
                correct: 1,
                type: "math",
                explanation: "Average speed = distance ÷ time = 240 ÷ 4 = 60 mph"
            },
            {
                question: "What is 25% of 80?",
                options: ["15", "20", "25", "30"],
                correct: 1,
                type: "math",
                explanation: "25% = 0.25, so 0.25 × 80 = 20"
            },
            {
                question: "If a rectangle has a length of 12 and width of 8, what is its area?",
                options: ["80", "96", "100", "104"],
                correct: 1,
                type: "math",
                explanation: "Area = length × width = 12 × 8 = 96"
            },
            {
                question: "What is the next number in the sequence: 3, 6, 12, 24, ?",
                options: ["36", "48", "42", "30"],
                correct: 1,
                type: "logic",
                explanation: "Each number is multiplied by 2. 24 × 2 = 48"
            },
            {
                question: "Which word does not belong: Apple, Orange, Banana, Carrot?",
                options: ["Apple", "Orange", "Banana", "Carrot"],
                correct: 3,
                type: "logic",
                explanation: "Carrot is a vegetable, while the others are fruits"
            },
            {
                question: "If BOOK is to READ as FOOD is to:",
                options: ["Cook", "Eat", "Buy", "Serve"],
                correct: 1,
                type: "analogy",
                explanation: "The relationship is object-primary action: BOOK is used to read, FOOD is used to eat"
            },
            {
                question: "What is the opposite of 'BRIEF'?",
                options: ["Short", "Long", "Quick", "Fast"],
                correct: 1,
                type: "analogy",
                explanation: "Brief means short, so the opposite is long"
            },
            {
                question: "A company has 120 employees. If 30% are managers, how many managers are there?",
                options: ["30", "36", "40", "45"],
                correct: 1,
                type: "math",
                explanation: "30% of 120 = 0.30 × 120 = 36"
            },
            {
                question: "Which planet is closest to the Sun?",
                options: ["Venus", "Mercury", "Earth", "Mars"],
                correct: 1,
                type: "knowledge",
                explanation: "Mercury is the closest planet to the Sun in our solar system"
            },
            {
                question: "If today is Monday, what day will it be in 7 days?",
                options: ["Monday", "Tuesday", "Sunday", "Saturday"],
                correct: 0,
                type: "logic",
                explanation: "7 days from Monday is the next Monday"
            }
        ];
        
        // Select 10 random questions from the pool
        const shuffledPool = this.shuffleArray([...questionPool]);
        const selectedQuestions = shuffledPool.slice(0, 10).map((q, index) => ({
            ...q,
            id: Date.now() + index
        }));
        
        this.questions = selectedQuestions;
        this.startNewSession();
        alert('New diverse questions generated successfully! (Local generation)');
    }

    varyQuestion(question) {
        // Simple variations to make questions feel different
        const variations = [
            question.replace('What is', 'Which of the following is'),
            question.replace('How many', 'What is the number of'),
            question.replace('If', 'Suppose that'),
            question.replace('Find', 'Determine'),
            question.replace('Calculate', 'Compute')
        ];
        
        return variations[Math.floor(Math.random() * variations.length)] || question;
    }

    findNewCorrectIndex(originalOptions, originalCorrect, newOptions) {
        const correctAnswer = originalOptions[originalCorrect];
        return newOptions.findIndex(option => option === correctAnswer);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.hideFeedback();
        this.loadQuestion();
        
        document.getElementById('submit-btn').style.display = 'inline-flex';
        document.getElementById('next-btn').style.display = 'none';
    }

    skipQuestion() {
        this.sessionStats.total++;
        this.sessionStats.incorrect++;
        
        // Save skipped question to history
        const question = this.currentSession[this.currentQuestionIndex];
        this.saveToHistory({
            question: question.question,
            options: question.options,
            userAnswer: null,
            correctAnswer: question.correct,
            isCorrect: false,
            explanation: question.explanation + " (Question skipped)",
            timestamp: new Date().toISOString(),
            type: question.type,
            skipped: true
        });
        
        this.updateDisplay();
        this.nextQuestion();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.skipQuestion();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        this.timeLeft = 120;
        this.updateTimer();
    }

    updateTimer() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    hideFeedback() {
        document.getElementById('feedback-section').style.display = 'none';
        document.getElementById('ai-feedback').style.display = 'none';
    }

    endSession() {
        this.stopTimer();
        alert(`Session Completed!\n\nResults:\n- Correct: ${this.sessionStats.correct}\n- Incorrect: ${this.sessionStats.incorrect}\n- Accuracy: ${this.getAccuracy()}%`);
        this.startNewSession();
    }

    saveToHistory(entry) {
        let history = JSON.parse(localStorage.getItem('wonderlic_history') || '[]');
        history.unshift(entry);
        
        // Mantener solo los últimos 100 registros
        if (history.length > 100) {
            history = history.slice(0, 100);
        }
        
        localStorage.setItem('wonderlic_history', JSON.stringify(history));
    }

    loadStats() {
        const history = JSON.parse(localStorage.getItem('wonderlic_history') || '[]');
        
        let totalCorrect = 0;
        let totalIncorrect = 0;
        
        history.forEach(entry => {
            if (entry.isCorrect) {
                totalCorrect++;
            } else {
                totalIncorrect++;
            }
        });
        
        document.getElementById('correct-count').textContent = totalCorrect;
        document.getElementById('incorrect-count').textContent = totalIncorrect;
        document.getElementById('total-questions').textContent = totalCorrect + totalIncorrect;
        
        const accuracy = totalCorrect + totalIncorrect > 0 ? 
            Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    updateDisplay() {
        this.loadStats();
    }

    updateSessionDisplay() {
        // Esta función se puede usar para mostrar estadísticas de la sesión actual si se desea
    }

    getAccuracy() {
        const total = this.sessionStats.correct + this.sessionStats.incorrect;
        return total > 0 ? Math.round((this.sessionStats.correct / total) * 100) : 0;
    }

    showHistory() {
        const modal = document.getElementById('history-modal');
        modal.style.display = 'block';
        this.renderHistory();
    }

    renderHistory(filter = 'all') {
        const history = JSON.parse(localStorage.getItem('wonderlic_history') || '[]');
        const historyList = document.getElementById('history-list');
        
        let filteredHistory = history;
        if (filter === 'correct') {
            filteredHistory = history.filter(entry => entry.isCorrect);
        } else if (filter === 'incorrect') {
            filteredHistory = history.filter(entry => !entry.isCorrect);
        }
        
        if (filteredHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">No records to show</p>';
            return;
        }
        
        historyList.innerHTML = filteredHistory.map(entry => `
            <div class="history-item ${entry.isCorrect ? 'correct' : 'incorrect'}">
                <div class="history-question">${entry.question}</div>
                <div class="history-details">
                    <div><strong>Date:</strong> ${new Date(entry.timestamp).toLocaleDateString()}</div>
                    <div><strong>Type:</strong> ${entry.type}</div>
                    <div><strong>Result:</strong> ${entry.isCorrect ? 'Correct' : 'Incorrect'}</div>
                </div>
                <div class="history-answer">
                    ${entry.skipped ? 
                        '<strong>Answer:</strong> Question skipped' :
                        `<strong>Your answer:</strong> ${entry.options[entry.userAnswer]}`
                    }
                    <br>
                    <strong>Correct answer:</strong> ${entry.options[entry.correctAnswer]}
                    <br>
                    <strong>Explanation:</strong> ${entry.explanation}
                </div>
            </div>
        `).join('');
    }

    filterHistory(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderHistory(filter);
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
            localStorage.removeItem('wonderlic_history');
            this.updateDisplay();
            alert('Statistics reset successfully.');
        }
    }

    showLearningDashboard() {
        this.renderLearningDashboard();
        document.getElementById('learning-dashboard-modal').style.display = 'block';
    }

    renderLearningDashboard() {
        // Render performance by category
        const performanceGrid = document.getElementById('performance-grid');
        performanceGrid.innerHTML = '';
        
        Object.entries(this.userAnalytics.weakAreas).forEach(([type, stats]) => {
            if (stats.total > 0) {
                const card = document.createElement('div');
                card.className = `performance-card ${this.getPerformanceClass(stats.percentage)}`;
                card.innerHTML = `
                    <h4>${this.capitalizeFirst(type)}</h4>
                    <div class="percentage">${stats.percentage.toFixed(1)}%</div>
                    <div class="stats">${stats.correct}/${stats.total} correct</div>
                `;
                performanceGrid.appendChild(card);
            }
        });
        
        // Render time analysis
        const timeAnalysis = document.getElementById('time-analysis');
        timeAnalysis.innerHTML = '';
        
        Object.entries(this.userAnalytics.timeAnalysis).forEach(([category, stats]) => {
            if (stats.total > 0) {
                const accuracy = (stats.correct / stats.total * 100).toFixed(1);
                const card = document.createElement('div');
                card.className = 'time-card';
                card.innerHTML = `
                    <h4>${this.capitalizeFirst(category)}</h4>
                    <div class="accuracy">${accuracy}%</div>
                    <div class="stats">${stats.total} questions</div>
                `;
                timeAnalysis.appendChild(card);
            }
        });
        
        // Render improvement suggestions
        const suggestionsContainer = document.getElementById('improvement-suggestions');
        suggestionsContainer.innerHTML = '';
        
        if (this.userAnalytics.improvementSuggestions.length === 0) {
            suggestionsContainer.innerHTML = '<p>Great job! No specific improvement areas identified yet.</p>';
        } else {
            this.userAnalytics.improvementSuggestions.slice(0, 5).forEach(suggestion => {
                const item = document.createElement('div');
                item.className = `suggestion-item ${suggestion.priority}`;
                item.textContent = suggestion.message;
                suggestionsContainer.appendChild(item);
            });
        }
        
        // Render recent mistakes
        const mistakesContainer = document.getElementById('recent-mistakes');
        mistakesContainer.innerHTML = '';
        
        if (this.userAnalytics.commonMistakes.length === 0) {
            mistakesContainer.innerHTML = '<p>No recent mistakes to display.</p>';
        } else {
            this.userAnalytics.commonMistakes.slice(-5).reverse().forEach(mistake => {
                const item = document.createElement('div');
                item.className = 'mistake-item';
                item.innerHTML = `
                    <h4>${mistake.question.substring(0, 60)}...</h4>
                    <div class="details">
                        <strong>Your answer:</strong> ${mistake.userAnswer}<br>
                        <strong>Correct:</strong> ${mistake.correctAnswer}<br>
                        <span class="time">Time: ${mistake.timeSpent}s</span>
                    </div>
                `;
                mistakesContainer.appendChild(item);
            });
        }
    }

    getPerformanceClass(percentage) {
        if (percentage >= 80) return 'high';
        if (percentage >= 60) return 'medium';
        return 'low';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showApiModal() {
        document.getElementById('api-modal').style.display = 'block';
        if (this.apiKey) {
            document.getElementById('api-key').value = this.apiKey;
        }
    }

    saveApiKey() {
        const apiKey = document.getElementById('api-key').value.trim();
        if (apiKey) {
            this.apiKey = apiKey;
            localStorage.setItem('kimi_api_key', apiKey);
            this.closeModal('api-modal');
            alert('API Key saved successfully. You can now use AI features.');
        } else {
            alert('Please enter a valid API Key.');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new WonderlicApp();
}); 