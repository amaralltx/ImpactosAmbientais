// Quiz Functionality - Alpine.js Data
function quizData() {
    return {
        // Estado do quiz
        quizStarted: false,
        quizCompleted: false,
        showingQuizHistory: false,

        // Perguntas e respostas
        quizQuestions: [], // Será preenchido ao iniciar
        currentQuestion: 0,
        selectedAnswer: null,
        questionAnswered: false,

        // Resultados
        answers: [],
        score: 0,
        quizScore: 0,
        startTime: null,
        endTime: null,

        // Configurações
        questionsToShow: 5,

        // Configurações do quiz
        quizSettings: {
            timerMode: false,
            showFeedback: true
        },

        // Timer
        questionTimeLeft: 0,
        questionTimeLimit: 60,

        // Inicializar quiz
        init() {
            console.log('Quiz inicializado');
            // Garantir que temos acesso ao número total de questões na tela inicial
            this.quizQuestions = quizQuestions || [];
        },

        // Getter para número total de questões disponíveis
        get totalQuestionsAvailable() {
            return quizQuestions ? quizQuestions.length : 0;
        },

        // Iniciar quiz
        startQuiz() {
            this.quizStarted = true;
            this.quizCompleted = false;
            this.showingQuizHistory = false;
            this.currentQuestion = 0;
            this.selectedAnswer = null;
            this.questionAnswered = false;
            this.answers = [];
            this.score = 0;
            this.startTime = new Date();

            // Embaralhar perguntas e selecionar apenas algumas
            this.quizQuestions = this.shuffleArray([...quizQuestions]).slice(0, this.questionsToShow);
        },

        // Embaralhar array
        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        // Selecionar resposta
        selectAnswer(answerIndex) {
            if (this.questionAnswered) return;

            this.selectedAnswer = answerIndex;
            this.questionAnswered = true;
            this.answers[this.currentQuestion] = answerIndex;

            // Verificar se está correto
            const question = this.quizQuestions[this.currentQuestion];
            if (answerIndex === question.correctAnswer) {
                this.score++;
            }
        },

        // Próxima pergunta
        nextQuestion() {
            if (this.currentQuestion < this.quizQuestions.length - 1) {
                this.currentQuestion++;
                this.selectedAnswer = null;
                this.questionAnswered = false;
            } else {
                this.completeQuiz();
            }
        },

        // Completar quiz
        completeQuiz() {
            this.endTime = new Date();
            this.quizCompleted = true;
            this.saveQuizResult();
        },

        // Calcular porcentagem
        get scorePercentage() {
            return Math.round((this.score / this.quizQuestions.length) * 100);
        },

        // Tempo gasto
        get timeSpent() {
            if (!this.startTime || !this.endTime) return 0;
            return Math.round((this.endTime - this.startTime) / 1000);
        },

        // Formatar tempo
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}m ${secs}s`;
        },

        // Classe da resposta
        getAnswerClass(answerIndex) {
            if (!this.questionAnswered) return '';

            const question = this.quizQuestions[this.currentQuestion];
            if (answerIndex === question.correctAnswer) {
                return 'correct-answer';
            } else if (answerIndex === this.selectedAnswer && answerIndex !== question.correctAnswer) {
                return 'wrong-answer';
            }
            return 'disabled-answer';
        },

        // Salvar resultado do quiz
        saveQuizResult() {
            const result = {
                id: Date.now(),
                date: new Date().toLocaleString('pt-BR'),
                score: this.score,
                total: this.quizQuestions.length,
                percentage: this.scorePercentage,
                timeSpent: this.timeSpent,
                answers: this.answers
            };

            let history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
            history.unshift(result);

            // Manter apenas os últimos 10 resultados
            if (history.length > 10) {
                history = history.slice(0, 10);
            }

            localStorage.setItem('quizHistory', JSON.stringify(history));
        },

        // Carregar histórico
        loadQuizHistory() {
            return JSON.parse(localStorage.getItem('quizHistory') || '[]');
        },

        // Verificar se tem histórico
        hasQuizHistory() {
            return this.loadQuizHistory().length > 0;
        },

        // Mostrar histórico
        showQuizHistory() {
            this.showingQuizHistory = true;
            this.quizCompleted = false;
        },

        // Limpar histórico
        clearQuizHistory() {
            if (confirm('Tem certeza que deseja limpar todo o histórico de quiz?')) {
                localStorage.removeItem('quizHistory');
                this.showingQuizHistory = false;
            }
        },

        // Reiniciar quiz
        restartQuiz() {
            this.quizStarted = false;
            this.quizCompleted = false;
            this.showingQuizHistory = false;
        },

        // Funções adicionais para compatibilidade com HTML
        getQuizAttempts() {
            return this.loadQuizHistory().length;
        },

        getBestScore() {
            const history = this.loadQuizHistory();
            if (history.length === 0) return 0;
            return Math.max(...history.map(result => result.percentage));
        },

        // Verificar se a resposta está correta
        isAnswerCorrect(questionIndex) {
            return this.answers[questionIndex] === this.quizQuestions[questionIndex]?.correctAnswer;
        },

        // Pular questão
        skipQuestion() {
            this.answers[this.currentQuestion] = null;
            this.questionAnswered = true;
        },

        // Próxima questão
        nextQuestion() {
            if (this.currentQuestion < this.quizQuestions.length - 1) {
                this.currentQuestion++;
                this.selectedAnswer = null;
                this.questionAnswered = false;
            } else {
                this.finishQuiz();
            }
        },

        // Verificar se pode prosseguir
        canProceedToNext() {
            return this.questionAnswered || this.answers[this.currentQuestion] !== undefined;
        },

        // Finalizar quiz
        finishQuiz() {
            this.endTime = new Date();
            this.quizCompleted = true;
            this.quizStarted = false;

            // Calcular score
            this.quizScore = this.answers.filter((answer, index) =>
                answer === this.quizQuestions[index]?.correctAnswer
            ).length;

            // Salvar no histórico
            this.saveQuizResult();
        },

        // Salvar resultado
        saveQuizResult() {
            const result = {
                timestamp: new Date().toISOString(),
                score: this.quizScore,
                total: this.quizQuestions.length,
                percentage: Math.round((this.quizScore / this.quizQuestions.length) * 100),
                timeSpent: this.endTime - this.startTime
            };

            const history = this.loadQuizHistory();
            history.push(result);
            localStorage.setItem('quizHistory', JSON.stringify(history));
        },

        // Funções de pontuação e classificação
        getScoreEmoji() {
            const percentage = (this.quizScore / this.quizQuestions.length) * 100;
            if (percentage >= 90) return '🏆';
            if (percentage >= 80) return '🥇';
            if (percentage >= 70) return '🥈';
            if (percentage >= 60) return '🥉';
            return '📚';
        },

        getScoreGrade() {
            const percentage = (this.quizScore / this.quizQuestions.length) * 100;
            if (percentage >= 90) return 'Excelente';
            if (percentage >= 80) return 'Muito Bom';
            if (percentage >= 70) return 'Bom';
            if (percentage >= 60) return 'Regular';
            return 'Precisa Melhorar';
        },

        // Funções de histórico
        getAverageScore() {
            const history = this.loadQuizHistory();
            if (history.length === 0) return 0;
            const sum = history.reduce((acc, result) => acc + result.percentage, 0);
            return Math.round(sum / history.length);
        },

        getSkippedCount() {
            return this.answers.filter(answer => answer === null).length;
        },

        hasQuizHistory() {
            return this.loadQuizHistory().length > 0;
        }
    }
}