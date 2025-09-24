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
        startTime: null,
        endTime: null,

        // Configurações
        questionsToShow: 5,

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
            console.log('startQuiz() chamado'); // Debug
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
            console.log('Quiz iniciado com', this.quizQuestions.length, 'perguntas');
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

            // Verificar se está correto
            const question = this.quizQuestions[this.currentQuestion];
            if (answerIndex === question.correctAnswer) {
                this.score++;
            }

            this.answers.push({
                questionId: question.id,
                question: question.question,
                selectedAnswer: answerIndex,
                correctAnswer: question.correctAnswer,
                correct: answerIndex === question.correctAnswer,
                explanation: question.explanation
            });
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
        }
    }
}