const urlParams = new URLSearchParams(window.location.search);
const topic = urlParams.get('topic');

let currentQuestions = [];
let quizTitle = "";

// Тақырыптарды тексеру және орнату
if (allTests[topic]) {
    currentQuestions = allTests[topic];
    if (topic === 'os') quizTitle = "Операциялық жүйелер";
    else if (topic === 'algo') quizTitle = "Алгоритмдеу";
    else if (topic === 'math') quizTitle = "Ықтималдық теориясы";
    else if (topic === 'java') quizTitle = "Java Programming";
    else if (topic === 'sysadmin') quizTitle = "Сис. Админ";
    else quizTitle = "Тест";
} else {
    alert("Тест табылған жоқ!");
    window.location.href = "index.html";
}

// АЙНЫМАЛЫЛАР
let currentQuestionIndex = 0;
let score = 0;
const totalQuestions = currentQuestions.length;
let isMultiSelect = false;

// ТАРИХ (Жауаптарды сақтау үшін массив)
// Бұл артқа қайтқанда алдыңғы жауаптарды сақтап тұру үшін керек
let userHistory = new Array(totalQuestions).fill(null);

// Элементтерді алу
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const titleEl = document.getElementById('quiz-title');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const questionCount = document.getElementById('question-count');
const progressBar = document.getElementById('progress-bar');
const imgEl = document.getElementById('question-img');
const jumpInput = document.getElementById('jump-input');

// Батырмалар
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const checkBtn = document.getElementById('check-btn');

const scoreText = document.getElementById('score-text');
const totalText = document.getElementById('total-text');
const feedbackText = document.getElementById('feedback-text');

// Тақырыпты қою
titleEl.innerText = quizTitle;

// Араластыру функциясы (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// СҰРАҚТЫ ЖҮКТЕУ ФУНКЦИЯСЫ
function loadQuestion() {
    const data = currentQuestions[currentQuestionIndex];

    // Сұрақ мәтінін және нөмірін жаңарту
    questionText.innerText = `${currentQuestionIndex + 1}. ${data.question}`;
    questionCount.innerText = `Сұрақ ${currentQuestionIndex + 1} / ${totalQuestions}`;
    
    // Негізгі сұрақ суретін көрсету (егер болса)
    if (data.img) {
        imgEl.src = data.img;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
        imgEl.src = "";
    }

    // Прогресс барды жаңарту
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Жауаптар тізімін тазалау
    optionsList.innerHTML = '';
    
    // Батырмаларды көрсету/жасыру логикасы
    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none'; // 1-ші сұрақта "Артқа" жоқ
    nextBtn.style.display = 'none';
    checkBtn.style.display = 'none';

    // Көп жауапты ма екенін тексеру (егер correct массив болса)
    isMultiSelect = Array.isArray(data.correct);

    // --- ЖАУАПТАРДЫ ДАЙЫНДАУ ---
    // Егер бұл сұраққа бірінші рет кіріп тұрсақ, жауаптарды араластырамыз
    if (!data.shuffledOptions) {
        let answers = data.options.map((opt, index) => {
            // Жаңа формат (сурет бар ма?) немесе ескі формат (тек мәтін) тексеру
            let text = typeof opt === 'object' ? opt.text : opt;
            let img = typeof opt === 'object' ? opt.img : null;
            
            // Дұрыс жауап па?
            let correctStatus = isMultiSelect ? data.correct.includes(index) : index === data.correct;
            
            return { 
                text: text, 
                img: img, // Сурет жолы
                originalIndex: index, 
                isCorrect: correctStatus 
            };
        });
        data.shuffledOptions = shuffleArray(answers);
    }

    // --- ЖАУАПТАРДЫ ЭКРАНҒА ШЫҒАРУ ---
    data.shuffledOptions.forEach((answerObj, uiIndex) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        
        // Ішкі HTML құрастыру
        let contentHtml = '<span class="circle"></span> ';
        
        // Егер вариантта сурет болса - қосамыз
        if (answerObj.img) {
            contentHtml += `<img src="${answerObj.img}" class="option-img" alt="Formula">`;
        }
        
        // Егер вариантта мәтін болса - қосамыз
        if (answerObj.text) {
            contentHtml += `<span>${answerObj.text}</span>`;
        }

        div.innerHTML = contentHtml;
        
        // Мета деректерді элементке сақтау (тексеру үшін керек)
        div.dataset.isCorrect = answerObj.isCorrect;
        div.dataset.uiIndex = uiIndex;

        // Басу оқиғасын тіркеу
        div.onclick = () => selectOption(div, uiIndex);
        optionsList.appendChild(div);
    });

    // --- ТАРИХТЫ ТЕКСЕРУ ---
    // Егер қолданушы бұл сұраққа бұрын жауап беріп қойған болса, күйін қалпына келтіру
    const history = userHistory[currentQuestionIndex];
    if (history && history.answered) {
        restoreState(history);
    } else {
        // Жауап берілмесе және бұл көп жауапты сұрақ болса -> "Тексеру" батырмасын көрсету
        if (isMultiSelect) checkBtn.style.display = 'block';
    }
}

// ТАРИХТАН ҚАЛПЫНА КЕЛТІРУ ФУНКЦИЯСЫ
function restoreState(history) {
    const options = optionsList.children;
    for (let i = 0; i < options.length; i++) {
        const div = options[i];
        div.classList.add('disabled'); // Қайта бастырмаймыз

        // Таңдалған жауаптарды бояу
        if (history.selectedIndices.includes(i)) {
            if (div.dataset.isCorrect === "true") div.classList.add('correct');
            else div.classList.add('wrong');
        }
        // Дұрыс жауапты әрқашан жасыл қылып көрсету
        if (div.dataset.isCorrect === "true") div.classList.add('correct');
    }
    nextBtn.style.display = 'block'; // Келесіге өтуге рұқсат
    checkBtn.style.display = 'none';
}

// НҰСҚАНЫ ТАҢДАУ (БАСУ)
function selectOption(selectedDiv, uiIndex) {
    // Егер бұғатталған болса, ештеңе істемейміз
    if (selectedDiv.classList.contains('disabled')) return;

    if (isMultiSelect) {
        // --- КӨП ЖАУАПТЫ РЕЖИМ ---
        selectedDiv.classList.toggle('selected');
        
        // Көк түспен белгілеу (уақытша)
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
        // --- БІР ЖАУАПТЫ РЕЖИМ (Бірден тексереді) ---
        checkSingleAnswer(selectedDiv, uiIndex);
    }
}

// БІР ЖАУАПТЫ ТЕКСЕРУ
function checkSingleAnswer(selectedDiv, uiIndex) {
    const isCorrect = selectedDiv.dataset.isCorrect === "true";
    if (isCorrect) score++;

    // Тарихқа жазу
    userHistory[currentQuestionIndex] = { answered: true, selectedIndices: [uiIndex] };

    const options = optionsList.children;
    for (let i = 0; i < options.length; i++) {
        options[i].classList.add('disabled');
        // Дұрыс жауапты көрсету
        if (options[i].dataset.isCorrect === "true") options[i].classList.add('correct');
    }

    // Таңдаған жауапты бояу
    if (isCorrect) selectedDiv.classList.add('correct');
    else selectedDiv.classList.add('wrong');

    nextBtn.style.display = 'block';
}

// КӨП ЖАУАПТЫ ТЕКСЕРУ (Түйме басқанда)
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

        // Бұғаттау және уақытша түстерді тазалау
        div.classList.add('disabled');
        div.style.backgroundColor = "";
        div.style.borderColor = "";
        div.querySelector('.circle').style.backgroundColor = "";

        // Тексеру және бояу
        if (isActuallyCorrect) {
            div.classList.add('correct');
            if (!isSelected) allCorrectFound = false;
        }
        if (isSelected && !isActuallyCorrect) {
            div.classList.add('wrong');
            noWrongSelected = false;
        }
    }

    // Егер бәрі дұрыс болса ұпай қосу
    if (allCorrectFound && noWrongSelected) score++;

    // Тарихқа жазу
    userHistory[currentQuestionIndex] = { answered: true, selectedIndices: selectedIndices };
    
    checkBtn.style.display = 'none';
    nextBtn.style.display = 'block';
}

// КЕЛЕСІ СҰРАҚҚА ӨТУ
function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showResults();
    }
}

// АЛДЫҢҒЫ СҰРАҚҚА ӨТУ
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// СҰРАҚҚА СЕКІРУ (JUMP)
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

// Enter басқанда секіру
jumpInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") jumpToQuestion();
});

// НӘТИЖЕ ЭКРАНЫН КӨРСЕТУ
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

// Бағдарламаны іске қосу
loadQuestion();