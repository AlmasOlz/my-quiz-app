// URL параметрлерін оқу
const urlParams = new URLSearchParams(window.location.search);
const topic = urlParams.get('topic');

let currentQuestions = [];
let quizTitle = "";

// Тест тақырыптарын тексеру
if (allTests[topic]) {
    currentQuestions = allTests[topic];
    if (topic === 'os') quizTitle = "Операциялық жүйелер";
    else if (topic === 'algo') quizTitle = "Алгоритмдеу";
    else if (topic === 'math') quizTitle = "Ықтималдық теориясы";
    else if (topic === 'java') quizTitle = "Java Programming";
} else {
    alert("Тест табылған жоқ!");
    window.location.href = "index.html";
}

// АЙНЫМАЛЫЛАР
let currentQuestionIndex = 0;
let score = 0;
const totalQuestions = currentQuestions.length;
let isMultiSelect = false; // Көп жауапты сұрақ па?

// Элементтер
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const titleEl = document.getElementById('quiz-title');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const questionCount = document.getElementById('question-count');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');
const checkBtn = document.getElementById('check-btn'); // ЖАҢА
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

// СҰРАҚТЫ ЖҮКТЕУ
function loadQuestion() {
    const data = currentQuestions[currentQuestionIndex];

    questionText.innerText = `${currentQuestionIndex + 1}. ${data.question}`;
    questionCount.innerText = `Сұрақ ${currentQuestionIndex + 1} / ${totalQuestions}`;
    
    // Суретті көрсету логикасы
    if (data.img) {
        imgEl.src = data.img;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
        imgEl.src = "";
    }

    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercent}%`;

    optionsList.innerHTML = '';
    nextBtn.style.display = 'none';
    checkBtn.style.display = 'none'; // Тексеру батырмасын жасыру

    // Көп жауапты сұрақты анықтау (Егер correct массив болса - true)
    isMultiSelect = Array.isArray(data.correct);

    // Жауаптарды дайындау
    let answers = data.options.map((opt, index) => {
        // Егер массив болса includes қолданамыз, болмаса ===
        let correctStatus = isMultiSelect ? data.correct.includes(index) : index === data.correct;
        return { text: opt, isCorrect: correctStatus };
    });
    
    answers = shuffleArray(answers);

    // Жауаптарды шығару
    answers.forEach((answerObj) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<span class="circle"></span> ${answerObj.text}`;
        
        // Жауаптың дұрыстығын сақтаймыз
        div.dataset.isCorrect = answerObj.isCorrect;

        // Басу логикасы (Select)
        div.onclick = () => selectOption(div);
        
        optionsList.appendChild(div);
    });

    // Егер көп жауапты болса, "Тексеру" батырмасын шығарамыз
    if (isMultiSelect) {
        checkBtn.style.display = 'block';
    }
}

// НҰСҚАНЫ ТАҢДАУ (Басқан кезде)
function selectOption(selectedDiv) {
    // Егер жауап тексеріліп қойса, ештеңе істемейміз
    if (selectedDiv.classList.contains('disabled')) return;

    if (isMultiSelect) {
        // --- КӨП ЖАУАПТЫ РЕЖИМ ---
        // Жай ғана "selected" класын қосып/аламыз (Toggle)
        selectedDiv.classList.toggle('selected');
        
        // Көк түспен белгілеу (CSS-ке қосымша стиль керек емес, осы жерден береміз)
        if(selectedDiv.classList.contains('selected')) {
            selectedDiv.style.backgroundColor = "#eef2ff";
            selectedDiv.style.borderColor = "#667eea";
            selectedDiv.querySelector('.circle').style.backgroundColor = "#667eea";
        } else {
            selectedDiv.style.backgroundColor = ""; // Қалпына келтіру
            selectedDiv.style.borderColor = "";
            selectedDiv.querySelector('.circle').style.backgroundColor = "";
        }

    } else {
        // --- БІР ЖАУАПТЫ РЕЖИМ (Ескі логика) ---
        checkSingleAnswer(selectedDiv);
    }
}

// БІР ЖАУАПТЫ ТЕКСЕРУ
function checkSingleAnswer(selectedDiv) {
    const options = optionsList.children;
    const isCorrect = selectedDiv.dataset.isCorrect === "true";

    if (isCorrect) score++;

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
    nextBtn.style.display = 'block';
}

// КӨП ЖАУАПТЫ ТЕКСЕРУ (Тексеру батырмасын басқанда)
function checkMultiAnswer() {
    const options = optionsList.children;
    let allCorrectFound = true; // Барлық дұрыс табылды ма?
    let noWrongSelected = true; // Қате таңдалмады ма?

    for (let i = 0; i < options.length; i++) {
        const div = options[i];
        const isSelected = div.classList.contains('selected');
        const isActuallyCorrect = div.dataset.isCorrect === "true";

        div.classList.add('disabled'); // Бұғаттау
        div.style.backgroundColor = ""; // Уақытша түсті алып тастау

        // Визуалды нәтиже
        if (isActuallyCorrect) {
            div.classList.add('correct'); // Дұрысты жасыл қылу
            if (!isSelected) allCorrectFound = false; // Дұрыс жауап таңдалмай қалды
        } 
        
        if (isSelected) {
            if (!isActuallyCorrect) {
                div.classList.add('wrong'); // Қатені таңдап қойды
                noWrongSelected = false;
            }
        }
    }

    // Ұпай беру (Егер барлық дұрыс таңдалып, ЕШҚАНДАЙ қате таңдалмаса ғана)
    if (allCorrectFound && noWrongSelected) {
        score++;
    }

    checkBtn.style.display = 'none';
    nextBtn.style.display = 'block';
}

function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    scoreText.innerText = score;
    totalText.innerText = totalQuestions;

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

loadQuestion();