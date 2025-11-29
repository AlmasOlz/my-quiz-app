// URL параметрлерін оқу
const urlParams = new URLSearchParams(window.location.search);
const topic = urlParams.get('topic');

let currentQuestions = [];
let quizTitle = "";

if (allTests[topic]) {
    currentQuestions = allTests[topic];
    if (topic === 'os') quizTitle = "Операциялық жүйелер";
    else if (topic === 'algo') quizTitle = "Алгоритмдеу";
} else {
    alert("Тест табылған жоқ!");
    window.location.href = "index.html";
}

// АЙНЫМАЛЫЛАР
let currentQuestionIndex = 0;
let score = 0; // ҰПАЙ САНАҒЫШ (Счетчик баллов)
const totalQuestions = currentQuestions.length;

// Элементтер
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const titleEl = document.getElementById('quiz-title');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const questionCount = document.getElementById('question-count');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');
const imgEl = document.getElementById('question-img');
// Нәтиже элементтері
const scoreText = document.getElementById('score-text');
const totalText = document.getElementById('total-text');
const feedbackText = document.getElementById('feedback-text');

titleEl.innerText = quizTitle;

// Араластыру функциясы
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Сұрақты жүктеу
function loadQuestion() {
    const data = currentQuestions[currentQuestionIndex];

    questionText.innerText = `${currentQuestionIndex + 1}. ${data.question}`;
    questionCount.innerText = `Сұрақ ${currentQuestionIndex + 1} / ${totalQuestions}`;
    
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercent}%`;

    optionsList.innerHTML = '';
    nextBtn.style.display = 'none';

    // Жауаптарды дайындау
    let answers = data.options.map((opt, index) => {
        return { text: opt, isCorrect: index === data.correct };
    });
    answers = shuffleArray(answers);
if (data.img) {
        imgEl.src = data.img;       // Сурет жолын қоямыз
        imgEl.style.display = 'block'; // Суретті көрсетеміз
    } else {
        imgEl.style.display = 'none';  // Сурет жоқ болса жасырамыз
        imgEl.src = "";
    }
    // Жауаптарды шығару
    answers.forEach((answerObj) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<span class="circle"></span> ${answerObj.text}`;
        div.dataset.isCorrect = answerObj.isCorrect;
        div.onclick = () => checkAnswer(div);
        optionsList.appendChild(div);
    });
}

// Тексеру
function checkAnswer(selectedDiv) {
    const options = optionsList.children;
    const isCorrect = selectedDiv.dataset.isCorrect === "true";
    
    // Егер дұрыс болса, ұпай қосамыз
    if (isCorrect) {
        score++; 
    }

    // Барлығын блоктау
    for (let i = 0; i < options.length; i++) {
        options[i].classList.add('disabled');
        if (options[i].dataset.isCorrect === "true") {
            options[i].classList.add('correct');
        }
    }

    if (isCorrect) {
        selectedDiv.classList.add('correct');
    } else {
        selectedDiv.classList.add('wrong');
    }

    nextBtn.style.display = 'inline-block';
}

// Келесі сұрақ немесе Нәтиже
function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showResults(); // Тест бітті, нәтижені көрсет
    }
}

// НӘТИЖЕНІ КӨРСЕТУ ФУНКЦИЯСЫ
function showResults() {
    // 1. Тест экранын жасырамыз
    quizScreen.style.display = 'none';
    
    // 2. Нәтиже экранын ашамыз
    resultScreen.style.display = 'block';

    // 3. Ұпайды жазамыз
    scoreText.innerText = score;
    totalText.innerText = totalQuestions;

    // 4. Пайыз бойынша пікір айту (Feedback)
    const percentage = (score / totalQuestions) * 100;
    
    if (percentage === 100) {
        feedbackText.innerText = "Керемет! Барлығы дұрыс! 🥇";
        feedbackText.style.color = "green";
    } else if (percentage >= 70) {
        feedbackText.innerText = "Жақсы нәтиже! 👍";
        feedbackText.style.color = "blue";
    } else {
        feedbackText.innerText = "Тағы да дайындалу керек. 📚";
        feedbackText.style.color = "orange";
    }
}

// Бастау
loadQuestion();