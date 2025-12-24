const urlParams = new URLSearchParams(window.location.search);
const topic = urlParams.get('topic');

let currentQuestions = [];
let quizTitle = "";

// 1. Араластыру функциясы
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 2. Сұрақтарды жүктеу және Тақырыпты анықтау
if (allTests[topic]) {
    // Сұрақтарды көшіріп аламыз
    currentQuestions = [...allTests[topic]]; 

    // --- Frontend Mix (Random) ---
    if (topic === 'frontall') {
        shuffleArray(currentQuestions); 
        quizTitle = "Frontend: Full Mix (Random)";
    } 
    // --- Java Mix (Random) ---
    else if (topic === 'javarandom') {
        shuffleArray(currentQuestions); // <--- Қате түзелді: currentQuestions (s бар)
        quizTitle = "Java: Full Random Test"; // <--- Тақырып түзелді
    }
    else if (topic === 'javabook') {
        shuffleArray(currentQuestions); // <--- Қате түзелді: currentQuestions (s бар)
        quizTitle = "Java:  Random Test"; // <--- Тақырып түзелді
    }
    else if (topic === 'sysadminRandom') {
        shuffleArray(currentQuestions); // <--- Қате түзелді: currentQuestions (s бар)
        quizTitle = "Системный програмирование:  Random Test"; // <--- Тақырып түзелді
    }
    else if (topic === 'ssysadmin') {
        shuffleArray(currentQuestions); // <--- Қате түзелді: currentQuestions (s бар)
        quizTitle = "Системный програмирование:  Random Test"; // <--- Тақырып түзелді
    }
    else if (topic === 'mathall') {
       
        quizTitle = "math all";
    }
     else if (topic === 'javatest') {
       
        quizTitle = "java жиналған тест";
    }
     else if (topic === 'javat') {
       
        quizTitle = "java біз жасаған + ағай берген";
    }
     else if (topic === 'javate') {
        shuffleArray(currentQuestions); // <--- Қате түзелді: currentQuestions (s бар)
       quizTitle = "java біз жасаған + ағай берген";
    }

    // --- Басқа тақырыптар ---
    else if (topic === 'os') quizTitle = "Операциялық жүйелер";
    else if (topic === 'algo') quizTitle = "Алгоритмдеу";
    else if (topic === 'math') quizTitle = "Ықтималдық теориясы";
    else if (topic === 'java') quizTitle = "Java Programming";
    else if (topic === 'sysadmin') quizTitle = "Сис. Админ";
    else if (topic === 'mathrk') quizTitle = "Математика (РК)";
    else if (topic === 'front') quizTitle = "Frontend: HTML";
    else if (topic === 'frontcss') quizTitle = "Frontend: CSS";
    else if (topic === 'frontjs') quizTitle = "Frontend: JavaScript";
    else if (topic === 'frontjsdom') quizTitle = "Frontend: JS DOM";
    else if (topic === 'fronthttp') quizTitle = "Frontend: HTTP/API";
    else if (topic === 'frontnode') quizTitle = "Frontend: Backend Basics";
    else if (topic === 'frontbe') quizTitle = "Frontend: Backend Advanced";
    else if (topic === 'frontgeneral') quizTitle = "Frontend: General Questions";
    else quizTitle = "Тест";

} else {
    alert("Тест табылған жоқ!");
    window.location.href = "index.html";
}

// ... (Қалған код сол қалпында, өзгертпей-ақ қойыңыз) ...
// АЙНЫМАЛЫЛАР
let currentQuestionIndex = 0;
let score = 0;
const totalQuestions = currentQuestions.length;
let isMultiSelect = false;

// ТАРИХ
let userHistory = new Array(totalQuestions).fill(null);

// ЭЛЕМЕНТТЕРДІ АЛУ
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const titleEl = document.getElementById('quiz-title');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const questionCount = document.getElementById('question-count');
const progressBar = document.getElementById('progress-bar');
const imgEl = document.getElementById('question-img');
const jumpInput = document.getElementById('jump-input');

// БАТЫРМАЛАР
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const checkBtn = document.getElementById('check-btn');

const scoreText = document.getElementById('score-text');
const totalText = document.getElementById('total-text');
const feedbackText = document.getElementById('feedback-text');

// Тақырыпты экранға шығару
titleEl.innerText = quizTitle;

// СҰРАҚТЫ ЖҮКТЕУ ФУНКЦИЯСЫ
function loadQuestion() {
    const data = currentQuestions[currentQuestionIndex];

    questionText.innerText = `${currentQuestionIndex + 1}. ${data.question}`;
    questionCount.innerText = `Сұрақ ${currentQuestionIndex + 1} / ${totalQuestions}`;
    
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
    
    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = 'none';
    checkBtn.style.display = 'none';

    isMultiSelect = Array.isArray(data.correct);

    if (!data.shuffledOptions) {
        let answers = data.options.map((opt, index) => {
            let text = typeof opt === 'object' ? opt.text : opt;
            let img = typeof opt === 'object' ? opt.img : null;
            
            let correctStatus = isMultiSelect ? data.correct.includes(index) : index === data.correct;
            
            return { 
                text: text, 
                img: img,
                originalIndex: index, 
                isCorrect: correctStatus 
            };
        });
        data.shuffledOptions = shuffleArray(answers);
    }

    data.shuffledOptions.forEach((answerObj, uiIndex) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        
        let contentHtml = '<span class="circle"></span> ';
        if (answerObj.img) {
            contentHtml += `<img src="${answerObj.img}" class="option-img" alt="Image">`;
        }
        if (answerObj.text) {
            contentHtml += `<span>${answerObj.text}</span>`;
        }

        div.innerHTML = contentHtml;
        div.dataset.isCorrect = answerObj.isCorrect;
        div.dataset.uiIndex = uiIndex;

        div.onclick = () => selectOption(div, uiIndex);
        optionsList.appendChild(div);
    });

    const history = userHistory[currentQuestionIndex];
    if (history && history.answered) {
        restoreState(history);
    } else {
        if (isMultiSelect) checkBtn.style.display = 'block';
    }
}

function restoreState(history) {
    const options = optionsList.children;
    for (let i = 0; i < options.length; i++) {
        const div = options[i];
        div.classList.add('disabled');
        if (history.selectedIndices.includes(i)) {
            if (div.dataset.isCorrect === "true") div.classList.add('correct');
            else div.classList.add('wrong');
        }
        if (div.dataset.isCorrect === "true") div.classList.add('correct');
    }
    nextBtn.style.display = 'block';
    checkBtn.style.display = 'none';
}

function selectOption(selectedDiv, uiIndex) {
    if (selectedDiv.classList.contains('disabled')) return;

    if (isMultiSelect) {
        selectedDiv.classList.toggle('selected');
        if(selectedDiv.classList.contains('selected')) {
            selectedDiv.style.backgroundColor = "#eef2ff";
            selectedDiv.style.borderColor = "#667eea";
            selectedDiv.querySelector('.circle').style.backgroundColor = "#667eea";
        } else {
            selectedDiv.style.backgroundColor = "";
            selectedDiv.style.borderColor = "";
            selectedDiv.querySelector('.circle').style.backgroundColor = "";
        }
    } else {
        checkSingleAnswer(selectedDiv, uiIndex);
    }
}

function checkSingleAnswer(selectedDiv, uiIndex) {
    const isCorrect = selectedDiv.dataset.isCorrect === "true";
    if (isCorrect) score++;

    userHistory[currentQuestionIndex] = { answered: true, selectedIndices: [uiIndex] };

    const options = optionsList.children;
    for (let i = 0; i < options.length; i++) {
        options[i].classList.add('disabled');
        if (options[i].dataset.isCorrect === "true") options[i].classList.add('correct');
    }

    if (isCorrect) selectedDiv.classList.add('correct');
    else selectedDiv.classList.add('wrong');

    nextBtn.style.display = 'block';
}

function checkMultiAnswer() {
    const options = optionsList.children;
    let allCorrectFound = true;
    let noWrongSelected = true;
    let selectedIndices = [];

    for (let i = 0; i < options.length; i++) {
        const div = options[i];
        const isSelected = div.classList.contains('selected');
        const isActuallyCorrect = div.dataset.isCorrect === "true";

        if (isSelected) selectedIndices.push(i);

        div.classList.add('disabled');
        div.style.backgroundColor = "";
        div.style.borderColor = "";
        div.querySelector('.circle').style.backgroundColor = "";

        if (isActuallyCorrect) {
            div.classList.add('correct');
            if (!isSelected) allCorrectFound = false;
        }
        if (isSelected && !isActuallyCorrect) {
            div.classList.add('wrong');
            noWrongSelected = false;
        }
    }

    if (allCorrectFound && noWrongSelected) score++;

    userHistory[currentQuestionIndex] = { answered: true, selectedIndices: selectedIndices };
    
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

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function jumpToQuestion() {
    const val = parseInt(jumpInput.value);
    if (val >= 1 && val <= totalQuestions) {
        currentQuestionIndex = val - 1;
        loadQuestion();
        jumpInput.value = "";
    } else {
        alert("Дұрыс сан енгізіңіз (1-" + totalQuestions + ")");
    }
}

jumpInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") jumpToQuestion();
});

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