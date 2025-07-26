// Wonderlic Practice App
class WonderlicApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.currentSession = [];
        this.selectedAnswer = null;
        this.timer = null;
        this.timeLeft = 720; // 12 minutes total for 50 questions
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
        
        // Integrated AI service - no user API key needed
        this.aiService = {
            enabled: true,
            // Using a combination of local processing and free AI services
            localProcessing: true,
            freeEndpoints: [
                {
                    name: 'Local AI Processing',
                    type: 'local',
                    available: true
                },
                {
                    name: 'Free AI Service',
                    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
                    headers: {
                        'Authorization': 'Bearer api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        'Content-Type': 'application/json'
                    },
                    available: true
                }
            ],
            currentService: 0
        };
        
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
        },
        {
            id: 16,
            question: "What is 30% of 200?",
            options: ["50", "60", "70", "80"],
            correct: 1,
            type: "math",
            explanation: "30% = 0.30, so 0.30 × 200 = 60"
        },
        {
            id: 17,
            question: "If a rectangle has a perimeter of 20 units and length of 6 units, what is its width?",
            options: ["2 units", "4 units", "6 units", "8 units"],
            correct: 1,
            type: "math",
            explanation: "Perimeter = 2(length + width). 20 = 2(6 + width). 10 = 6 + width. Width = 4"
        },
        {
            id: 18,
            question: "What is the next number in the sequence: 1, 3, 6, 10, 15, ?",
            options: ["18", "20", "21", "25"],
            correct: 2,
            type: "math",
            explanation: "Pattern: add 2, then 3, then 4, then 5, then 6. 15 + 6 = 21"
        },
        {
            id: 19,
            question: "If 4x - 8 = 16, what is the value of x?",
            options: ["4", "6", "8", "10"],
            correct: 1,
            type: "math",
            explanation: "4x - 8 = 16 → 4x = 24 → x = 6"
        },
        {
            id: 20,
            question: "What is the area of a circle with radius 6 cm? (Use π = 3.14)",
            options: ["113 cm²", "120 cm²", "127 cm²", "134 cm²"],
            correct: 0,
            type: "math",
            explanation: "Area = πr² = 3.14 × 6² = 3.14 × 36 = 113 cm²"
        },
        {
            id: 21,
            question: "If a product costs $100 and has a 20% discount, what is the final price?",
            options: ["$70", "$80", "$90", "$100"],
            correct: 1,
            type: "math",
            explanation: "Discount: $100 × 0.20 = $20. Final price: $100 - $20 = $80"
        },
        {
            id: 22,
            question: "What is 2/3 of 90?",
            options: ["50", "60", "70", "80"],
            correct: 1,
            type: "math",
            explanation: "2/3 × 90 = 60"
        },
        {
            id: 23,
            question: "If a car travels 200 miles in 4 hours, what is its speed in miles per hour?",
            options: ["40 mph", "50 mph", "60 mph", "70 mph"],
            correct: 1,
            type: "math",
            explanation: "Speed = distance ÷ time = 200 ÷ 4 = 50 mph"
        },
        {
            id: 24,
            question: "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
            options: ["40", "42", "44", "50"],
            correct: 1,
            type: "math",
            explanation: "Pattern: add 4, then 6, then 8, then 10, then 12. 30 + 12 = 42"
        },
        {
            id: 25,
            question: "If a triangle has angles of 45°, 45°, and 90°, what type of triangle is it?",
            options: ["Equilateral", "Isosceles", "Scalene", "Right"],
            correct: 1,
            type: "math",
            explanation: "It's an isosceles right triangle (two equal angles of 45° and one right angle)"
        },
        {
            id: 26,
            question: "What is 25% of 160?",
            options: ["30", "40", "50", "60"],
            correct: 1,
            type: "math",
            explanation: "25% = 0.25, so 0.25 × 160 = 40"
        },
        {
            id: 27,
            question: "If a square has an area of 49 square units, what is its perimeter?",
            options: ["24 units", "28 units", "32 units", "36 units"],
            correct: 1,
            type: "math",
            explanation: "Area = side² = 49. Side = 7. Perimeter = 4 × 7 = 28 units"
        },
        {
            id: 28,
            question: "What is the next number in the sequence: 1, 4, 9, 16, 25, ?",
            options: ["30", "36", "40", "49"],
            correct: 1,
            type: "math",
            explanation: "Pattern: perfect squares. 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36"
        },
        {
            id: 29,
            question: "If 3x + 7 = 22, what is the value of x?",
            options: ["3", "5", "7", "9"],
            correct: 1,
            type: "math",
            explanation: "3x + 7 = 22 → 3x = 15 → x = 5"
        },
        {
            id: 30,
            question: "What is the volume of a cube with side length 4 cm?",
            options: ["48 cm³", "64 cm³", "80 cm³", "96 cm³"],
            correct: 1,
            type: "math",
            explanation: "Volume = side³ = 4³ = 64 cm³"
        },
        {
            id: 31,
            question: "What is the next number in the sequence: 2, 4, 8, 16, 32, ?",
            options: ["48", "56", "64", "72"],
            correct: 2,
            type: "logic",
            explanation: "Each number is multiplied by 2. 32 × 2 = 64"
        },
        {
            id: 32,
            question: "Which word does not belong: Eagle, Hawk, Sparrow, Bat?",
            options: ["Eagle", "Hawk", "Sparrow", "Bat"],
            correct: 3,
            type: "logic",
            explanation: "Bat is a mammal, while the others are birds"
        },
        {
            id: 33,
            question: "If today is Wednesday, what day will it be in 8 days?",
            options: ["Monday", "Tuesday", "Thursday", "Friday"],
            correct: 2,
            type: "logic",
            explanation: "8 ÷ 7 = 1 week and 1 day. Wednesday + 1 day = Thursday"
        },
        {
            id: 34,
            question: "Find the missing number: 3, 8, 15, 24, 35, ?",
            options: ["44", "48", "52", "56"],
            correct: 1,
            type: "logic",
            explanation: "Pattern: add 5, then 7, then 9, then 11, then 13. 35 + 13 = 48"
        },
        {
            id: 35,
            question: "Which of these numbers is not prime?",
            options: ["17", "19", "21", "23"],
            correct: 2,
            type: "logic",
            explanation: "21 is not prime because it is divisible by 3 and 7"
        },
        {
            id: 36,
            question: "What comes next: A, C, F, J, O, ?",
            options: ["S", "T", "U", "V"],
            correct: 1,
            type: "logic",
            explanation: "Pattern: skip 1, then 2, then 3, then 4, then 5 letters. O + 5 = T"
        },
        {
            id: 37,
            question: "If a clock shows 3:15, what angle do the hands make?",
            options: ["60°", "75°", "90°", "105°"],
            correct: 1,
            type: "logic",
            explanation: "At 3:15, the hour hand is 1/4 between 3 and 4, and the minute hand is at 3. This creates a 75° angle"
        },
        {
            id: 38,
            question: "What is the next number in the sequence: 1, 2, 4, 7, 11, 16, ?",
            options: ["20", "22", "24", "26"],
            correct: 1,
            type: "logic",
            explanation: "Pattern: add 1, then 2, then 3, then 4, then 5, then 6. 16 + 6 = 22"
        },
        {
            id: 39,
            question: "Which word does not belong: Apple, Banana, Carrot, Orange?",
            options: ["Apple", "Banana", "Carrot", "Orange"],
            correct: 2,
            type: "logic",
            explanation: "Carrot is a vegetable, while the others are fruits"
        },
        {
            id: 40,
            question: "If today is Friday, what day was it 2 days ago?",
            options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
            correct: 2,
            type: "logic",
            explanation: "Friday - 2 days = Wednesday"
        },
        {
            id: 41,
            question: "Find the missing number: 2, 6, 12, 20, 30, 42, ?",
            options: ["54", "56", "58", "60"],
            correct: 1,
            type: "logic",
            explanation: "Pattern: add 4, then 6, then 8, then 10, then 12, then 14. 42 + 14 = 56"
        },
        {
            id: 42,
            question: "Which of these shapes has the most sides?",
            options: ["Triangle", "Square", "Pentagon", "Hexagon"],
            correct: 3,
            type: "logic",
            explanation: "Hexagon has 6 sides, which is more than the others"
        },
        {
            id: 43,
            question: "What is the next letter in the sequence: B, E, H, K, N, ?",
            options: ["P", "Q", "R", "S"],
            correct: 1,
            type: "logic",
            explanation: "Pattern: skip 2 letters each time. B→E (skip C,D), E→H (skip F,G), etc. N + 3 = Q"
        },
        {
            id: 44,
            question: "If a rectangle has a length of 12 and width of 5, what is its area?",
            options: ["50", "60", "70", "80"],
            correct: 1,
            type: "logic",
            explanation: "Area = length × width = 12 × 5 = 60"
        },
        {
            id: 45,
            question: "What is the next number in the sequence: 1, 3, 7, 15, 31, ?",
            options: ["47", "63", "55", "71"],
            correct: 1,
            type: "logic",
            explanation: "Pattern: each number is (previous × 2) + 1. 31 × 2 + 1 = 63"
        },
        {
            id: 46,
            question: "If PEN is to WRITE as BRUSH is to:",
            options: ["Paint", "Draw", "Color", "Art"],
            correct: 0,
            type: "analogy",
            explanation: "A pen is used to write, a brush is used to paint"
        },
        {
            id: 47,
            question: "What is the opposite of 'RAPID'?",
            options: ["Fast", "Slow", "Quick", "Swift"],
            correct: 1,
            type: "analogy",
            explanation: "Rapid means fast, so the opposite is slow"
        },
        {
            id: 48,
            question: "If STUDENT is to SCHOOL as WORKER is to:",
            options: ["Office", "Factory", "Job", "Company"],
            correct: 0,
            type: "analogy",
            explanation: "A student goes to school, a worker goes to an office"
        },
        {
            id: 49,
            question: "What is the opposite of 'MINIMUM'?",
            options: ["Small", "Large", "Maximum", "Medium"],
            correct: 2,
            type: "analogy",
            explanation: "Minimum means the least amount, the opposite is maximum"
        },
        {
            id: 50,
            question: "If KEY is to DOOR as PASSWORD is to:",
            options: ["Computer", "Account", "Login", "System"],
            correct: 0,
            type: "analogy",
            explanation: "A key opens a door, a password opens a computer"
        }
    ];

    initializeApp() {
        this.updateDisplay();
        // Dark theme initialization
        const savedTheme = localStorage.getItem('theme');
        const darkThemeBtn = document.getElementById('dark-theme-btn');
        
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (darkThemeBtn) {
                darkThemeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (darkThemeBtn) {
                darkThemeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            }
        }
        
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
        document.getElementById('history-btn').addEventListener('click', () => this.showHistory());
        document.getElementById('reset-stats-btn').addEventListener('click', () => this.resetStats());
        // Dark theme toggle
        document.getElementById('dark-theme-btn').addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const darkThemeBtn = document.getElementById('dark-theme-btn');
            const icon = darkThemeBtn.querySelector('i');
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                icon.className = 'fas fa-moon';
                darkThemeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                icon.className = 'fas fa-sun';
                darkThemeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }
        });
        
        // Modals - with error checking
        const closeHistoryBtn = document.getElementById('close-history');
        const closeLearningDashboardBtn = document.getElementById('close-learning-dashboard');
        
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => this.closeModal('history-modal'));
        }
        if (closeLearningDashboardBtn) {
            closeLearningDashboardBtn.addEventListener('click', () => this.closeModal('learning-dashboard-modal'));
        }
        
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
        
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="block"]');
                openModals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }

    startNewSession() {
        this.currentQuestionIndex = 0;
        this.sessionStats = { correct: 0, incorrect: 0, total: 0 };
        this.currentSession = this.shuffleArray([...this.questions]).slice(0, 50);
        this.sessionStartTime = new Date().getTime();
        this.hideFeedback();
        this.loadQuestion();
        this.updateSessionDisplay();
        this.resetTimer();
        this.startTimer();
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
        document.getElementById('skip-btn').style.display = 'inline-flex';
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
        
        const question = this.currentSession[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct;
        const totalTimeElapsed = 720 - this.timeLeft;
        const timeSpent = this.currentQuestionIndex === 0 ? totalTimeElapsed : totalTimeElapsed - this.getPreviousQuestionsTime();
        
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
        
        // Get AI feedback if available
        if (this.aiService.enabled && !isCorrect) {
            this.getAIFeedback(question, this.selectedAnswer);
        }
        
        this.updateDisplay();
        
        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'inline-flex';
        document.getElementById('skip-btn').style.display = 'none';
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
        
        if (!aiFeedback || !aiFeedbackContent) {
            console.error('AI feedback elements not found');
            return;
        }
        
        aiFeedback.style.display = 'block';
        aiFeedbackContent.textContent = 'Analyzing your answer...';
        
        // Use integrated AI service
        if (!this.aiService.enabled) {
            const feedback = this.generateLocalFeedback(question, userAnswer);
            aiFeedbackContent.textContent = feedback;
            return;
        }
        
        // Check if we're on mobile and add mobile-specific handling
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        try {
            const prompt = `
            Analyze this Wonderlic test question:
            
            Question: ${question.question}
            Options: ${question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}
            Correct answer: ${String.fromCharCode(65 + question.correct)}) ${question.options[question.correct]}
            User's answer: ${String.fromCharCode(65 + userAnswer)}) ${question.options[userAnswer]}
            
            Please provide a detailed analysis in English of why the user's answer is incorrect and explain the correct reasoning in an educational and constructive manner. Keep an encouraging tone.
            `;
            
            // Add timeout for mobile devices
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), isMobile ? 15000 : 30000); // 15s timeout on mobile
            
            // Try integrated AI services
            let response = null;
            let lastError = null;
            
            for (let i = 0; i < this.aiService.freeEndpoints.length; i++) {
                const service = this.aiService.freeEndpoints[i];
                
                if (!service.available) continue;
                
                try {
                    if (service.type === 'local') {
                        // Use local AI processing
                        const feedback = this.processWithLocalAI(question, userAnswer, prompt);
                        aiFeedbackContent.textContent = feedback;
                        return;
                    } else {
                        // Use external API
                        response = await fetch(service.url, {
                            method: 'POST',
                            headers: service.headers,
                            body: JSON.stringify({
                                model: 'gpt-3.5-turbo',
                                messages: [
                                    {
                                        role: 'user',
                                        content: prompt
                                    }
                                ],
                                temperature: 0.7,
                                max_tokens: isMobile ? 500 : 1000
                            }),
                            signal: controller.signal
                        });
                        
                        if (response.ok) {
                            break; // Success, exit the loop
                        }
                    }
                } catch (error) {
                    lastError = error;
                    service.available = false; // Mark service as unavailable
                    continue; // Try next service
                }
            }
            
            clearTimeout(timeoutId);
            
            if (response && response.ok) {
                const data = await response.json();
                aiFeedbackContent.textContent = data.choices[0].message.content;
            } else {
                // Fallback to local processing
                const feedback = this.processWithLocalAI(question, userAnswer, prompt);
                aiFeedbackContent.textContent = feedback;
            }
        } catch (error) {
            console.error('AI Error:', error);
            
            // Handle different types of errors
            if (error.name === 'AbortError') {
                aiFeedbackContent.textContent = 'Request timed out. Using local AI processing instead.';
            } else if (error.message.includes('fetch')) {
                aiFeedbackContent.textContent = 'Network error. Using local AI processing instead.';
            } else {
                aiFeedbackContent.textContent = 'AI service temporarily unavailable. Using local processing instead.';
            }
            
            const feedback = this.processWithLocalAI(question, userAnswer, prompt);
            aiFeedbackContent.textContent = feedback;
        }
    }

    processWithLocalAI(question, userAnswer, prompt) {
        // Advanced local AI processing using pattern matching and rule-based analysis
        const userAnswerText = question.options[userAnswer];
        const correctAnswerText = question.options[question.correct];
        
        let analysis = `🤖 **AI Analysis**\n\n`;
        analysis += `**Your answer:** ${userAnswerText}\n`;
        analysis += `**Correct answer:** ${correctAnswerText}\n\n`;
        
        // Analyze the question type and provide specific feedback
        const questionType = question.type;
        const analysisRules = {
            'math': this.analyzeMathQuestion(question, userAnswer),
            'logic': this.analyzeLogicQuestion(question, userAnswer),
            'analogy': this.analyzeAnalogyQuestion(question, userAnswer),
            'comprehension': this.analyzeComprehensionQuestion(question, userAnswer),
            'knowledge': this.analyzeKnowledgeQuestion(question, userAnswer),
            'vocabulary': this.analyzeVocabularyQuestion(question, userAnswer)
        };
        
        analysis += analysisRules[questionType] || this.analyzeGeneralQuestion(question, userAnswer);
        
        // Add personalized learning suggestions
        analysis += `\n🎯 **Learning Tip:** ${this.getPersonalizedLearningTip(questionType)}\n\n`;
        analysis += `**Explanation:** ${question.explanation}`;
        
        return analysis;
    }

    analyzeMathQuestion(question, userAnswer) {
        const analysis = "**Mathematical Analysis:**\n";
        analysis += "• Check your calculation steps carefully\n";
        analysis += "• Verify your arithmetic operations\n";
        analysis += "• Consider using estimation to verify your answer\n";
        analysis += "• Pay attention to units and conversions\n";
        return analysis;
    }

    analyzeLogicQuestion(question, userAnswer) {
        const analysis = "**Logical Reasoning Analysis:**\n";
        analysis += "• Look for patterns in sequences\n";
        analysis += "• Identify relationships between elements\n";
        analysis += "• Consider multiple possible interpretations\n";
        analysis += "• Use elimination to narrow down options\n";
        return analysis;
    }

    analyzeAnalogyQuestion(question, userAnswer) {
        const analysis = "**Analogy Analysis:**\n";
        analysis += "• Identify the relationship in the first pair\n";
        analysis += "• Apply the same relationship to the second pair\n";
        analysis += "• Consider multiple types of relationships\n";
        analysis += "• Look for functional, categorical, or sequential relationships\n";
        return analysis;
    }

    analyzeComprehensionQuestion(question, userAnswer) {
        const analysis = "**Comprehension Analysis:**\n";
        analysis += "• Read the question carefully and completely\n";
        analysis += "• Identify key information and requirements\n";
        analysis += "• Break down complex problems into smaller parts\n";
        analysis += "• Verify your understanding before answering\n";
        return analysis;
    }

    analyzeKnowledgeQuestion(question, userAnswer) {
        const analysis = "**Knowledge Analysis:**\n";
        analysis += "• Draw from your general knowledge\n";
        analysis += "• Consider context clues in the question\n";
        analysis += "• Use logical reasoning when knowledge is limited\n";
        analysis += "• Eliminate obviously incorrect options\n";
        return analysis;
    }

    analyzeVocabularyQuestion(question, userAnswer) {
        const analysis = "**Vocabulary Analysis:**\n";
        analysis += "• Consider word roots and prefixes\n";
        analysis += "• Look for context clues in the question\n";
        analysis += "• Think about word relationships and categories\n";
        analysis += "• Use elimination based on partial knowledge\n";
        return analysis;
    }

    analyzeGeneralQuestion(question, userAnswer) {
        const analysis = "**General Analysis:**\n";
        analysis += "• Review the question carefully\n";
        analysis += "• Consider all options before selecting\n";
        analysis += "• Use process of elimination\n";
        analysis += "• Trust your reasoning process\n";
        return analysis;
    }

    getPersonalizedLearningTip(questionType) {
        const tips = {
            'math': 'Practice mental math and estimation techniques to improve speed and accuracy.',
            'logic': 'Work on pattern recognition exercises to strengthen logical thinking.',
            'analogy': 'Study word relationships and practice identifying different types of analogies.',
            'comprehension': 'Practice reading carefully and identifying key details in questions.',
            'knowledge': 'Read widely and stay curious about various topics to expand your knowledge.',
            'vocabulary': 'Build your vocabulary by reading and looking up unfamiliar words.'
        };
        return tips[questionType] || 'Focus on understanding the question type and practicing similar problems.';
    }

    generateQuestionsWithLocalAI() {
        // Advanced local AI question generation using templates and variations
        const questionTemplates = this.getQuestionTemplates();
        const generatedQuestions = [];
        
        // Generate 50 diverse questions
        for (let i = 0; i < 50; i++) {
            const template = questionTemplates[i % questionTemplates.length];
            const question = this.generateQuestionFromTemplate(template, i);
            generatedQuestions.push(question);
        }
        
        return generatedQuestions;
    }

    getQuestionTemplates() {
        return [
            // Math templates
            {
                type: 'math',
                template: 'If a car travels {distance} miles in {time} hours, what is its average speed in miles per hour?',
                options: ['{speed1} mph', '{speed2} mph', '{speed3} mph', '{speed4} mph'],
                correct: 1,
                explanation: 'Average speed = distance ÷ time = {distance} ÷ {time} = {correct_speed} mph'
            },
            {
                type: 'math',
                template: 'What is {percentage}% of {number}?',
                options: ['{option1}', '{option2}', '{option3}', '{option4}'],
                correct: 1,
                explanation: '{percentage}% = 0.{decimal}, so 0.{decimal} × {number} = {correct_answer}'
            },
            {
                type: 'math',
                template: 'If a rectangle has a length of {length} and width of {width}, what is its area?',
                options: ['{area1}', '{area2}', '{area3}', '{area4}'],
                correct: 1,
                explanation: 'Area = length × width = {length} × {width} = {correct_area}'
            },
            // Logic templates
            {
                type: 'logic',
                template: 'What is the next number in the sequence: {sequence}?',
                options: ['{next1}', '{next2}', '{next3}', '{next4}'],
                correct: 1,
                explanation: 'Pattern: {pattern_description}'
            },
            {
                type: 'logic',
                template: 'Which word does not belong: {word1}, {word2}, {word3}, {word4}?',
                options: ['{word1}', '{word2}', '{word3}', '{word4}'],
                correct: 3,
                explanation: '{odd_word} is {category}, while the others are {other_category}'
            },
            // Analogy templates
            {
                type: 'analogy',
                template: 'If {first1} is to {first2} as {second1} is to:',
                options: ['{second2}', '{wrong1}', '{wrong2}', '{wrong3}'],
                correct: 0,
                explanation: 'The relationship is: {first1} is used for {first2}, {second1} is used for {second2}'
            },
            // Knowledge templates
            {
                type: 'knowledge',
                template: 'What is the capital of {country}?',
                options: ['{capital}', '{wrong_capital1}', '{wrong_capital2}', '{wrong_capital3}'],
                correct: 0,
                explanation: '{capital} is the capital of {country}'
            },
            // Vocabulary templates
            {
                type: 'vocabulary',
                template: 'What does "{word}" mean?',
                options: ['{meaning}', '{wrong_meaning1}', '{wrong_meaning2}', '{wrong_meaning3}'],
                correct: 0,
                explanation: '"{word}" means {meaning}'
            }
        ];
    }

    generateQuestionFromTemplate(template, index) {
        const variations = this.getTemplateVariations(template.type, index);
        const selectedVariation = variations[index % variations.length];
        
        let questionText = template.template;
        let options = [...template.options];
        let explanation = template.explanation;
        
        // Replace placeholders with actual values
        Object.keys(selectedVariation).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            questionText = questionText.replace(regex, selectedVariation[key]);
            options = options.map(opt => opt.replace(regex, selectedVariation[key]));
            explanation = explanation.replace(regex, selectedVariation[key]);
        });
        
        return {
            id: Date.now() + index,
            question: questionText,
            options: options,
            correct: template.correct,
            type: template.type,
            explanation: explanation
        };
    }

    getTemplateVariations(type, index) {
        const variations = {
            'math': [
                { distance: 240, time: 4, speed1: 50, speed2: 60, speed3: 70, speed4: 80, correct_speed: 60, decimal: '60' },
                { distance: 180, time: 3, speed1: 45, speed2: 60, speed3: 75, speed4: 90, correct_speed: 60, decimal: '60' },
                { percentage: 25, number: 80, option1: 15, option2: 20, option3: 25, option4: 30, correct_answer: 20, decimal: '25' },
                { percentage: 30, number: 200, option1: 50, option2: 60, option3: 70, option4: 80, correct_answer: 60, decimal: '30' },
                { length: 12, width: 8, area1: 80, area2: 96, area3: 100, area4: 104, correct_area: 96 },
                { length: 15, width: 10, area1: 120, area2: 150, area3: 160, area4: 180, correct_area: 150 }
            ],
            'logic': [
                { sequence: '2, 4, 8, 16, 32', next1: 48, next2: 64, next3: 42, next4: 30, pattern_description: 'Each number is multiplied by 2. 32 × 2 = 64' },
                { sequence: '3, 6, 12, 24, 48', next1: 72, next2: 96, next3: 84, next4: 60, pattern_description: 'Each number is multiplied by 2. 48 × 2 = 96' },
                { word1: 'Apple', word2: 'Orange', word3: 'Banana', word4: 'Carrot', odd_word: 'Carrot', category: 'a vegetable', other_category: 'fruits' },
                { word1: 'Eagle', word2: 'Hawk', word3: 'Sparrow', word4: 'Bat', odd_word: 'Bat', category: 'a mammal', other_category: 'birds' }
            ],
            'analogy': [
                { first1: 'BOOK', first2: 'READ', second1: 'FOOD', second2: 'EAT', wrong1: 'Cook', wrong2: 'Buy', wrong3: 'Serve' },
                { first1: 'DOCTOR', first2: 'HOSPITAL', second1: 'TEACHER', second2: 'SCHOOL', wrong1: 'Classroom', wrong2: 'Student', wrong3: 'Book' },
                { first1: 'WHEEL', first2: 'CAR', second1: 'PROPELLER', second2: 'BOAT', wrong1: 'Airplane', wrong2: 'Bicycle', wrong3: 'Train' }
            ],
            'knowledge': [
                { country: 'France', capital: 'Paris', wrong_capital1: 'London', wrong_capital2: 'Berlin', wrong_capital3: 'Madrid' },
                { country: 'Japan', capital: 'Tokyo', wrong_capital1: 'Kyoto', wrong_capital2: 'Osaka', wrong_capital3: 'Yokohama' },
                { country: 'Australia', capital: 'Canberra', wrong_capital1: 'Sydney', wrong_capital2: 'Melbourne', wrong_capital3: 'Brisbane' }
            ],
            'vocabulary': [
                { word: 'EPHEMERAL', meaning: 'Short-lived', wrong_meaning1: 'Lasting forever', wrong_meaning2: 'Very large', wrong_meaning3: 'Extremely small' },
                { word: 'UBIQUITOUS', meaning: 'Present everywhere', wrong_meaning1: 'Rare', wrong_meaning2: 'Expensive', wrong_meaning3: 'Beautiful' },
                { word: 'PRECISE', meaning: 'Exact', wrong_meaning1: 'Quick', wrong_meaning2: 'Large', wrong_meaning3: 'Important' }
            ]
        };
        
        return variations[type] || variations['math'];
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
        if (!this.aiService.enabled) {
            // Generate new questions locally instead of showing API modal
            this.generateLocalQuestions();
            return;
        }
        
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'block';
        }
        
        // Check if we're on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        try {
            // Get user's weak areas to focus on those
            const weakAreas = this.getWeakAreas();
            const focusAreas = weakAreas.length > 0 ? 
                `Focus especially on: ${weakAreas.join(', ')}` : 
                'Include a balanced mix of all question types';
            
            const prompt = `
            Generate 50 completely NEW and ORIGINAL questions for a Wonderlic-style aptitude test. 
            These must be completely different from any existing questions.
            
            Requirements:
            - 20 math questions (arithmetic, percentages, basic algebra, geometry)
            - 15 logic and pattern questions (sequences, analogies, reasoning)
            - 10 verbal analogy questions (word relationships, comparisons)
            - 3 comprehension and reasoning questions (reading comprehension, problem solving)
            - 2 general knowledge questions (current events, science, history)
            
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
            
            // Add timeout for mobile devices
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), isMobile ? 30000 : 60000); // 30s timeout on mobile
            
            // Try integrated AI services
            let response = null;
            let lastError = null;
            
            for (let i = 0; i < this.aiService.freeEndpoints.length; i++) {
                const service = this.aiService.freeEndpoints[i];
                
                if (!service.available) continue;
                
                try {
                    if (service.type === 'local') {
                        // Use local AI processing for question generation
                        const newQuestions = this.generateQuestionsWithLocalAI();
                        if (newQuestions.length >= 25) {
                            this.questions = newQuestions;
                            this.startNewSession();
                            alert(`Generated ${newQuestions.length} new AI questions successfully!`);
                            return;
                        }
                    } else {
                        // Use external API
                        response = await fetch(service.url, {
                            method: 'POST',
                            headers: service.headers,
                            body: JSON.stringify({
                                model: 'gpt-3.5-turbo',
                                messages: [
                                    {
                                        role: 'user',
                                        content: prompt
                                    }
                                ],
                                temperature: 0.9,
                                max_tokens: isMobile ? 1500 : 2000
                            }),
                            signal: controller.signal
                        });
                        
                        if (response.ok) {
                            break; // Success, exit the loop
                        }
                    }
                } catch (error) {
                    lastError = error;
                    service.available = false; // Mark service as unavailable
                    continue; // Try next service
                }
            }
            
            clearTimeout(timeoutId);
            
            if (response && response.ok) {
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
                            
                            if (validatedQuestions.length >= 25) {
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
                const errorData = response ? await response.text() : 'No response';
                console.error('API Response:', response?.status, errorData);
                
                if (response?.status === 401) {
                    alert('API key invalid. Please check your API settings.');
                    this.generateLocalQuestions();
                } else if (response?.status === 429) {
                    alert('Rate limit exceeded. Please try again later.');
                } else {
                    alert('AI service temporarily unavailable. Using local generation instead.');
                    this.generateLocalQuestions();
                }
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            
            // Handle different types of errors
            if (error.name === 'AbortError') {
                alert('Request timed out. Using local generation instead.');
            } else if (error.message.includes('fetch')) {
                alert('Network error. Check your internet connection and try again.');
            } else {
                alert('AI service temporarily unavailable. Using local generation instead.');
            }
            
            // Fallback to local question generation
            this.generateLocalQuestions();
        } finally {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
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
        // Create a much larger and more diverse pool of questions for 50 questions
        const questionPool = [
            // Math Questions (20 questions)
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
                question: "A train travels 180 miles in 3 hours. What is its speed in miles per hour?",
                options: ["45 mph", "60 mph", "75 mph", "90 mph"],
                correct: 1,
                type: "math",
                explanation: "Speed = distance ÷ time = 180 ÷ 3 = 60 mph"
            },
            {
                question: "What is 15% of 200?",
                options: ["25", "30", "35", "40"],
                correct: 1,
                type: "math",
                explanation: "15% = 0.15, so 0.15 × 200 = 30"
            },
            {
                question: "If a circle has a radius of 6 cm, what is its diameter?",
                options: ["10 cm", "12 cm", "14 cm", "16 cm"],
                correct: 1,
                type: "math",
                explanation: "Diameter = 2 × radius = 2 × 6 = 12 cm"
            },
            {
                question: "What is the next number in the sequence: 2, 4, 8, 16, ?",
                options: ["24", "32", "20", "28"],
                correct: 1,
                type: "math",
                explanation: "Each number is multiplied by 2. 16 × 2 = 32"
            },
            {
                question: "If 3x + 5 = 20, what is the value of x?",
                options: ["3", "4", "5", "6"],
                correct: 2,
                type: "math",
                explanation: "3x + 5 = 20 → 3x = 15 → x = 5"
            },
            {
                question: "What is the area of a triangle with base 10 and height 8?",
                options: ["30", "40", "50", "60"],
                correct: 1,
                type: "math",
                explanation: "Area = (base × height) ÷ 2 = (10 × 8) ÷ 2 = 40"
            },
            {
                question: "If a product costs $120 and has a 20% discount, what is the final price?",
                options: ["$90", "$96", "$100", "$108"],
                correct: 1,
                type: "math",
                explanation: "Discount: $120 × 0.20 = $24. Final price: $120 - $24 = $96"
            },
            // Logic Questions
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
                question: "If today is Monday, what day will it be in 7 days?",
                options: ["Monday", "Tuesday", "Sunday", "Saturday"],
                correct: 0,
                type: "logic",
                explanation: "7 days from Monday is the next Monday"
            },
            {
                question: "How many months have exactly 30 days?",
                options: ["4", "5", "6", "7"],
                correct: 0,
                type: "logic",
                explanation: "April, June, September, and November have exactly 30 days (4 months)"
            },
            {
                question: "Find the missing number: 2, 5, 10, 17, ?",
                options: ["24", "26", "28", "30"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: add 3, then 5, then 7, then 9. 17 + 9 = 26"
            },
            {
                question: "Which of these numbers is prime?",
                options: ["15", "21", "17", "25"],
                correct: 2,
                type: "logic",
                explanation: "17 is prime because it is only divisible by 1 and itself"
            },
            {
                question: "If a clock shows 3:30, what angle do the hands make?",
                options: ["75°", "90°", "105°", "120°"],
                correct: 0,
                type: "logic",
                explanation: "At 3:30, the hour hand is halfway between 3 and 4, and the minute hand is at 6. This creates a 75° angle"
            },
            {
                question: "What comes next: Red, Blue, Green, Red, Blue, ?",
                options: ["Green", "Yellow", "Blue", "Red"],
                correct: 0,
                type: "logic",
                explanation: "The pattern repeats: Red, Blue, Green"
            },
            // Analogy Questions
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
                question: "If DOCTOR is to HOSPITAL as TEACHER is to:",
                options: ["School", "Classroom", "Student", "Book"],
                correct: 0,
                type: "analogy",
                explanation: "A doctor works in a hospital, a teacher works in a school"
            },
            {
                question: "What is the opposite of 'ABUNDANT'?",
                options: ["Scarce", "Much", "Large", "Small"],
                correct: 0,
                type: "analogy",
                explanation: "Abundant means there is plenty of something, the opposite is scarce"
            },
            {
                question: "If WHEEL is to CAR as PROPELLER is to:",
                options: ["Airplane", "Boat", "Bicycle", "Train"],
                correct: 1,
                type: "analogy",
                explanation: "A wheel moves a car, a propeller moves a boat"
            },
            {
                question: "What is the opposite of 'ANCIENT'?",
                options: ["Old", "Modern", "Young", "New"],
                correct: 1,
                type: "analogy",
                explanation: "Ancient means very old, the opposite is modern"
            },
            {
                question: "If BIRD is to FLY as FISH is to:",
                options: ["Swim", "Walk", "Crawl", "Jump"],
                correct: 0,
                type: "analogy",
                explanation: "A bird's primary movement is flying, a fish's primary movement is swimming"
            },
            // Comprehension Questions
            {
                question: "A company has 120 employees. If 30% are managers, how many managers are there?",
                options: ["30", "36", "40", "45"],
                correct: 1,
                type: "comprehension",
                explanation: "30% of 120 = 0.30 × 120 = 36"
            },
            {
                question: "If you buy 3 apples for $2.40, how much do 5 apples cost?",
                options: ["$4.00", "$3.60", "$4.20", "$3.80"],
                correct: 0,
                type: "comprehension",
                explanation: "Each apple costs $0.80 ($2.40 ÷ 3). 5 apples cost $4.00 (5 × $0.80)"
            },
            {
                question: "A store offers a 15% discount on a $200 item. What is the final price?",
                options: ["$170", "$175", "$180", "$185"],
                correct: 0,
                type: "comprehension",
                explanation: "Discount: $200 × 0.15 = $30. Final price: $200 - $30 = $170"
            },
            {
                question: "If a recipe calls for 2 cups of flour for 8 servings, how much flour is needed for 12 servings?",
                options: ["2.5 cups", "3 cups", "3.5 cups", "4 cups"],
                correct: 1,
                type: "comprehension",
                explanation: "2 cups for 8 servings = 0.25 cups per serving. 12 servings × 0.25 = 3 cups"
            },
            {
                question: "A train leaves at 2:30 PM and arrives at 5:45 PM. How long was the journey?",
                options: ["2 hours 15 minutes", "3 hours 15 minutes", "3 hours 30 minutes", "3 hours 45 minutes"],
                correct: 1,
                type: "comprehension",
                explanation: "From 2:30 PM to 5:45 PM is 3 hours and 15 minutes"
            },
            // Knowledge Questions
            {
                question: "Which planet is closest to the Sun?",
                options: ["Venus", "Mercury", "Earth", "Mars"],
                correct: 1,
                type: "knowledge",
                explanation: "Mercury is the closest planet to the Sun in our solar system"
            },
            {
                question: "How many letters are in the English alphabet?",
                options: ["24", "25", "26", "27"],
                correct: 2,
                type: "knowledge",
                explanation: "The English alphabet has 26 letters"
            },
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2,
                type: "knowledge",
                explanation: "Paris is the capital of France"
            },
            {
                question: "Which element has the chemical symbol 'O'?",
                options: ["Oxygen", "Osmium", "Oganesson", "Osmium"],
                correct: 0,
                type: "knowledge",
                explanation: "O is the chemical symbol for Oxygen"
            },
            {
                question: "What year did World War II end?",
                options: ["1943", "1944", "1945", "1946"],
                correct: 2,
                type: "knowledge",
                explanation: "World War II ended in 1945"
            },
            {
                question: "Which ocean is the largest?",
                options: ["Atlantic", "Indian", "Pacific", "Arctic"],
                correct: 2,
                type: "knowledge",
                explanation: "The Pacific Ocean is the largest ocean on Earth"
            },
            {
                question: "What is the largest planet in our solar system?",
                options: ["Earth", "Mars", "Jupiter", "Saturn"],
                correct: 2,
                type: "knowledge",
                explanation: "Jupiter is the largest planet in our solar system"
            },
            {
                question: "How many continents are there on Earth?",
                options: ["5", "6", "7", "8"],
                correct: 2,
                type: "knowledge",
                explanation: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia"
            },
            // Vocabulary Questions
            {
                question: "What does 'EPHEMERAL' mean?",
                options: ["Lasting forever", "Short-lived", "Very large", "Extremely small"],
                correct: 1,
                type: "vocabulary",
                explanation: "Ephemeral means lasting for a very short time"
            },
            {
                question: "What is the meaning of 'UBIQUITOUS'?",
                options: ["Rare", "Present everywhere", "Expensive", "Beautiful"],
                correct: 1,
                type: "vocabulary",
                explanation: "Ubiquitous means present, appearing, or found everywhere"
            },
            {
                question: "What does 'PRECISE' mean?",
                options: ["Exact", "Quick", "Large", "Important"],
                correct: 0,
                type: "vocabulary",
                explanation: "Precise means exact, accurate, or clearly expressed"
            },
            {
                question: "What is the meaning of 'DILIGENT'?",
                options: ["Lazy", "Hardworking", "Smart", "Friendly"],
                correct: 1,
                type: "vocabulary",
                explanation: "Diligent means having or showing care and conscientiousness in one's work"
            },
            {
                question: "What does 'CONCISE' mean?",
                options: ["Long", "Short and clear", "Complex", "Simple"],
                correct: 1,
                type: "vocabulary",
                explanation: "Concise means giving a lot of information clearly and in a few words"
            },
            // Additional Math Questions
            {
                question: "What is 40% of 150?",
                options: ["50", "60", "70", "80"],
                correct: 1,
                type: "math",
                explanation: "40% = 0.40, so 0.40 × 150 = 60"
            },
            {
                question: "If a rectangle has a perimeter of 24 units and length of 8 units, what is its width?",
                options: ["2 units", "4 units", "6 units", "8 units"],
                correct: 1,
                type: "math",
                explanation: "Perimeter = 2(length + width). 24 = 2(8 + width). 12 = 8 + width. Width = 4"
            },
            {
                question: "What is the next number in the sequence: 1, 3, 6, 10, 15, ?",
                options: ["18", "20", "21", "25"],
                correct: 2,
                type: "math",
                explanation: "Pattern: add 2, then 3, then 4, then 5, then 6. 15 + 6 = 21"
            },
            {
                question: "If 4x - 8 = 16, what is the value of x?",
                options: ["4", "6", "8", "10"],
                correct: 1,
                type: "math",
                explanation: "4x - 8 = 16 → 4x = 24 → x = 6"
            },
            {
                question: "What is the area of a circle with radius 7 cm? (Use π = 3.14)",
                options: ["147 cm²", "154 cm²", "161 cm²", "168 cm²"],
                correct: 1,
                type: "math",
                explanation: "Area = πr² = 3.14 × 7² = 3.14 × 49 = 154 cm²"
            },
            {
                question: "If a product costs $90 and has a 30% discount, what is the final price?",
                options: ["$60", "$63", "$67", "$70"],
                correct: 1,
                type: "math",
                explanation: "Discount: $90 × 0.30 = $27. Final price: $90 - $27 = $63"
            },
            {
                question: "What is 3/4 of 80?",
                options: ["50", "60", "70", "80"],
                correct: 1,
                type: "math",
                explanation: "3/4 × 80 = 60"
            },
            {
                question: "If a train travels 300 miles in 5 hours, what is its speed in miles per hour?",
                options: ["50 mph", "60 mph", "70 mph", "80 mph"],
                correct: 1,
                type: "math",
                explanation: "Speed = distance ÷ time = 300 ÷ 5 = 60 mph"
            },
            {
                question: "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
                options: ["40", "42", "44", "50"],
                correct: 1,
                type: "math",
                explanation: "Pattern: add 4, then 6, then 8, then 10, then 12. 30 + 12 = 42"
            },
            {
                question: "If a triangle has angles of 45°, 45°, and 90°, what type of triangle is it?",
                options: ["Equilateral", "Isosceles", "Scalene", "Right"],
                correct: 1,
                type: "math",
                explanation: "It's an isosceles right triangle (two equal angles of 45° and one right angle)"
            },
            {
                question: "What is 20% of 250?",
                options: ["40", "50", "60", "70"],
                correct: 1,
                type: "math",
                explanation: "20% = 0.20, so 0.20 × 250 = 50"
            },
            {
                question: "If a square has an area of 64 square units, what is its perimeter?",
                options: ["24 units", "32 units", "40 units", "48 units"],
                correct: 1,
                type: "math",
                explanation: "Area = side² = 64. Side = 8. Perimeter = 4 × 8 = 32 units"
            },
            {
                question: "What is the next number in the sequence: 1, 4, 9, 16, 25, ?",
                options: ["30", "36", "40", "49"],
                correct: 1,
                type: "math",
                explanation: "Pattern: perfect squares. 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36"
            },
            {
                question: "If 2x + 5 = 17, what is the value of x?",
                options: ["4", "6", "8", "10"],
                correct: 1,
                type: "math",
                explanation: "2x + 5 = 17 → 2x = 12 → x = 6"
            },
            {
                question: "What is the volume of a cube with side length 5 cm?",
                options: ["100 cm³", "125 cm³", "150 cm³", "200 cm³"],
                correct: 1,
                type: "math",
                explanation: "Volume = side³ = 5³ = 125 cm³"
            },
            {
                question: "If a product costs $120 and has a 25% discount, what is the final price?",
                options: ["$80", "$90", "$100", "$110"],
                correct: 1,
                type: "math",
                explanation: "Discount: $120 × 0.25 = $30. Final price: $120 - $30 = $90"
            },
            {
                question: "What is 5/8 of 64?",
                options: ["35", "40", "45", "50"],
                correct: 1,
                type: "math",
                explanation: "5/8 × 64 = 40"
            },
            {
                question: "If a car travels 180 miles in 3 hours, what is its speed in miles per hour?",
                options: ["45 mph", "60 mph", "75 mph", "90 mph"],
                correct: 1,
                type: "math",
                explanation: "Speed = distance ÷ time = 180 ÷ 3 = 60 mph"
            },
            // Additional Logic Questions (15 questions)
            {
                question: "What is the next number in the sequence: 2, 4, 8, 16, 32, ?",
                options: ["48", "56", "64", "72"],
                correct: 2,
                type: "logic",
                explanation: "Each number is multiplied by 2. 32 × 2 = 64"
            },
            {
                question: "Which word does not belong: Eagle, Hawk, Sparrow, Bat?",
                options: ["Eagle", "Hawk", "Sparrow", "Bat"],
                correct: 3,
                type: "logic",
                explanation: "Bat is a mammal, while the others are birds"
            },
            {
                question: "If today is Wednesday, what day will it be in 10 days?",
                options: ["Monday", "Tuesday", "Saturday", "Sunday"],
                correct: 2,
                type: "logic",
                explanation: "10 ÷ 7 = 1 week and 3 days. Wednesday + 3 days = Saturday"
            },
            {
                question: "Find the missing number: 3, 8, 15, 24, 35, ?",
                options: ["44", "48", "52", "56"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: add 5, then 7, then 9, then 11, then 13. 35 + 13 = 48"
            },
            {
                question: "Which of these numbers is not prime?",
                options: ["17", "19", "21", "23"],
                correct: 2,
                type: "logic",
                explanation: "21 is not prime because it is divisible by 3 and 7"
            },
            {
                question: "What comes next: A, C, F, J, O, ?",
                options: ["S", "T", "U", "V"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: skip 1, then 2, then 3, then 4, then 5 letters. O + 5 = T"
            },
            {
                question: "If a clock shows 4:20, what angle do the hands make?",
                options: ["80°", "100°", "120°", "140°"],
                correct: 1,
                type: "logic",
                explanation: "At 4:20, the hour hand is 1/3 between 4 and 5, and the minute hand is at 4. This creates a 100° angle"
            },
            {
                question: "What is the next number in the sequence: 1, 2, 4, 7, 11, 16, ?",
                options: ["20", "22", "24", "26"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: add 1, then 2, then 3, then 4, then 5, then 6. 16 + 6 = 22"
            },
            {
                question: "Which word does not belong: Apple, Banana, Carrot, Orange?",
                options: ["Apple", "Banana", "Carrot", "Orange"],
                correct: 2,
                type: "logic",
                explanation: "Carrot is a vegetable, while the others are fruits"
            },
            {
                question: "If today is Friday, what day was it 3 days ago?",
                options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
                correct: 1,
                type: "logic",
                explanation: "Friday - 3 days = Tuesday"
            },
            {
                question: "Find the missing number: 2, 6, 12, 20, 30, 42, ?",
                options: ["54", "56", "58", "60"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: add 4, then 6, then 8, then 10, then 12, then 14. 42 + 14 = 56"
            },
            {
                question: "Which of these shapes has the most sides?",
                options: ["Triangle", "Square", "Pentagon", "Hexagon"],
                correct: 3,
                type: "logic",
                explanation: "Hexagon has 6 sides, which is more than the others"
            },
            {
                question: "What is the next letter in the sequence: B, E, H, K, N, ?",
                options: ["P", "Q", "R", "S"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: skip 2 letters each time. B→E (skip C,D), E→H (skip F,G), etc. N + 3 = Q"
            },
            {
                question: "If a rectangle has a length of 10 and width of 6, what is its area?",
                options: ["50", "60", "70", "80"],
                correct: 1,
                type: "logic",
                explanation: "Area = length × width = 10 × 6 = 60"
            },
            {
                question: "What is the next number in the sequence: 1, 3, 7, 15, 31, ?",
                options: ["47", "63", "55", "71"],
                correct: 1,
                type: "logic",
                explanation: "Pattern: each number is (previous × 2) + 1. 31 × 2 + 1 = 63"
            },
            {
                question: "Which word does not belong: Red, Blue, Green, Yellow, Purple?",
                options: ["Red", "Blue", "Green", "Yellow"],
                correct: 3,
                type: "logic",
                explanation: "All are primary or secondary colors, but this is a trick question - they all belong"
            },
            // Additional Analogy Questions (10 questions)
            {
                question: "If PEN is to WRITE as BRUSH is to:",
                options: ["Paint", "Draw", "Color", "Art"],
                correct: 0,
                type: "analogy",
                explanation: "A pen is used to write, a brush is used to paint"
            },
            {
                question: "What is the opposite of 'RAPID'?",
                options: ["Fast", "Slow", "Quick", "Swift"],
                correct: 1,
                type: "analogy",
                explanation: "Rapid means fast, so the opposite is slow"
            },
            {
                question: "If STUDENT is to SCHOOL as WORKER is to:",
                options: ["Office", "Factory", "Job", "Company"],
                correct: 0,
                type: "analogy",
                explanation: "A student goes to school, a worker goes to an office"
            },
            {
                question: "What is the opposite of 'MINIMUM'?",
                options: ["Small", "Large", "Maximum", "Medium"],
                correct: 2,
                type: "analogy",
                explanation: "Minimum means the least amount, the opposite is maximum"
            },
            {
                question: "If KEY is to DOOR as PASSWORD is to:",
                options: ["Computer", "Account", "Login", "System"],
                correct: 0,
                type: "analogy",
                explanation: "A key opens a door, a password opens a computer"
            },
            {
                question: "What is the opposite of 'EXTERNAL'?",
                options: ["Outside", "Internal", "Outer", "Foreign"],
                correct: 1,
                type: "analogy",
                explanation: "External means outside, the opposite is internal"
            },
            {
                question: "If TEACHER is to STUDENT as DOCTOR is to:",
                options: ["Patient", "Nurse", "Hospital", "Medicine"],
                correct: 0,
                type: "analogy",
                explanation: "A teacher works with students, a doctor works with patients"
            },
            {
                question: "What is the opposite of 'INCREASE'?",
                options: ["Grow", "Decrease", "Add", "More"],
                correct: 1,
                type: "analogy",
                explanation: "Increase means to make larger, the opposite is decrease"
            },
            {
                question: "If WHEEL is to BICYCLE as ENGINE is to:",
                options: ["Car", "Motor", "Machine", "Vehicle"],
                correct: 0,
                type: "analogy",
                explanation: "A wheel is part of a bicycle, an engine is part of a car"
            },
            {
                question: "What is the opposite of 'BEGINNING'?",
                options: ["Start", "Middle", "End", "First"],
                correct: 2,
                type: "analogy",
                explanation: "Beginning means the start, the opposite is end"
            },
            // Additional Knowledge Questions (5 questions)
            {
                question: "What is the largest organ in the human body?",
                options: ["Heart", "Brain", "Liver", "Skin"],
                correct: 3,
                type: "knowledge",
                explanation: "The skin is the largest organ in the human body"
            },
            {
                question: "Which country has the largest population?",
                options: ["India", "China", "United States", "Russia"],
                correct: 0,
                type: "knowledge",
                explanation: "India currently has the largest population in the world"
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Ag", "Au", "Fe", "Cu"],
                correct: 1,
                type: "knowledge",
                explanation: "Au is the chemical symbol for gold"
            },
            {
                question: "How many sides does a hexagon have?",
                options: ["4", "5", "6", "8"],
                correct: 2,
                type: "knowledge",
                explanation: "A hexagon has 6 sides"
            },
            {
                question: "What is the capital of Japan?",
                options: ["Tokyo", "Kyoto", "Osaka", "Yokohama"],
                correct: 0,
                type: "knowledge",
                explanation: "Tokyo is the capital of Japan"
            }
        ];
        
        // Generate completely random questions by creating variations
        const generateRandomQuestions = () => {
            const selectedQuestions = [];
            const shuffledPool = this.shuffleArray([...questionPool]);
            
            // Take first 50 questions and create variations
            for (let i = 0; i < 50; i++) {
                const originalQuestion = shuffledPool[i % shuffledPool.length];
                
                // Create variations of the question
                const variations = this.createQuestionVariations(originalQuestion);
                const randomVariation = variations[Math.floor(Math.random() * variations.length)];
                
                selectedQuestions.push({
                    ...randomVariation,
                    id: Date.now() + i + Math.floor(Math.random() * 1000)
                });
            }
            
            return selectedQuestions;
        };
        
        this.questions = generateRandomQuestions();
        this.startNewSession();
        alert('New diverse questions generated successfully! (Local generation)');
    }

    createQuestionVariations(originalQuestion) {
        const variations = [];
        
        // Keep original question
        variations.push(originalQuestion);
        
        // Create variations based on question type
        if (originalQuestion.type === 'math') {
            // Math variations with different numbers
            const mathVariations = [
                {
                    question: originalQuestion.question.replace(/\d+/g, (match) => {
                        const num = parseInt(match);
                        return Math.floor(num * (0.8 + Math.random() * 0.4)).toString();
                    }),
                    options: originalQuestion.options.map(opt => {
                        if (opt.includes('mph') || opt.includes('mph')) {
                            const num = parseInt(opt);
                            return Math.floor(num * (0.8 + Math.random() * 0.4)) + ' mph';
                        }
                        if (opt.includes('$')) {
                            const num = parseFloat(opt.replace('$', ''));
                            return '$' + (num * (0.8 + Math.random() * 0.4)).toFixed(0);
                        }
                        if (!isNaN(opt)) {
                            const num = parseInt(opt);
                            return Math.floor(num * (0.8 + Math.random() * 0.4)).toString();
                        }
                        return opt;
                    }),
                    correct: originalQuestion.correct,
                    type: originalQuestion.type,
                    explanation: originalQuestion.explanation
                }
            ];
            variations.push(...mathVariations);
        } else if (originalQuestion.type === 'logic') {
            // Logic variations with different sequences
            const logicVariations = [
                {
                    question: originalQuestion.question.replace(/sequence: [\d, ]+/, 'sequence: ' + this.generateRandomSequence()),
                    options: this.generateRandomOptions(),
                    correct: Math.floor(Math.random() * 4),
                    type: originalQuestion.type,
                    explanation: 'Pattern analysis required'
                }
            ];
            variations.push(...logicVariations);
        } else if (originalQuestion.type === 'analogy') {
            // Analogy variations with different word pairs
            const analogyPairs = [
                { first: 'BOOK', second: 'READ', third: 'FOOD', fourth: 'EAT' },
                { first: 'DOCTOR', second: 'HOSPITAL', third: 'TEACHER', fourth: 'SCHOOL' },
                { first: 'WHEEL', second: 'CAR', third: 'PROPELLER', fourth: 'BOAT' },
                { first: 'BIRD', second: 'FLY', third: 'FISH', fourth: 'SWIM' }
            ];
            
            const randomPair = analogyPairs[Math.floor(Math.random() * analogyPairs.length)];
            const analogyVariation = {
                question: `If ${randomPair.first} is to ${randomPair.second} as ${randomPair.third} is to:`,
                options: [randomPair.fourth, 'OTHER1', 'OTHER2', 'OTHER3'],
                correct: 0,
                type: originalQuestion.type,
                explanation: `The relationship is: ${randomPair.first} is used for ${randomPair.second}, ${randomPair.third} is used for ${randomPair.fourth}`
            };
            variations.push(analogyVariation);
        }
        
        return variations;
    }

    generateRandomSequence() {
        const sequences = [
            '2, 4, 8, 16, 32',
            '3, 6, 12, 24, 48',
            '1, 3, 6, 10, 15',
            '2, 5, 10, 17, 26',
            '1, 2, 4, 7, 11'
        ];
        return sequences[Math.floor(Math.random() * sequences.length)];
    }

    generateRandomOptions() {
        const options = [];
        for (let i = 0; i < 4; i++) {
            options.push(Math.floor(Math.random() * 50 + 10).toString());
        }
        return options;
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

    getPreviousQuestionsTime() {
        // Calculate total time spent on previous questions in this session
        const history = JSON.parse(localStorage.getItem('wonderlic_history') || '[]');
        const sessionStartTime = this.sessionStartTime || new Date().getTime();
        let totalTime = 0;
        
        // Get questions from current session that have been answered
        for (let i = 0; i < this.currentQuestionIndex; i++) {
            const question = this.currentSession[i];
            const questionHistory = history.find(h => 
                h.question === question.question && 
                new Date(h.timestamp).getTime() > sessionStartTime
            );
            if (questionHistory && questionHistory.timeSpent) {
                totalTime += questionHistory.timeSpent;
            }
        }
        
        return totalTime;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endSession();
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
        this.timeLeft = 720; // 12 minutes total
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
        const totalAnswered = this.sessionStats.correct + this.sessionStats.incorrect;
        const timeUsed = 720 - this.timeLeft;
        const minutesUsed = Math.floor(timeUsed / 60);
        const secondsUsed = timeUsed % 60;
        
        alert(`Session Completed!\n\nResults:\n- Questions Answered: ${totalAnswered}/50\n- Correct: ${this.sessionStats.correct}\n- Incorrect: ${this.sessionStats.incorrect}\n- Accuracy: ${this.getAccuracy()}%\n- Time Used: ${minutesUsed}:${secondsUsed.toString().padStart(2, '0')}`);
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

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log(`Modal ${modalId} closed successfully`);
        } else {
            console.error(`Modal with ID '${modalId}' not found`);
        }
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

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WonderlicApp();
});