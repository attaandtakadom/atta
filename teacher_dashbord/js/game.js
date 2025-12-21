// programs/js/game.js

// بيانات الحروف العربية
const arabicLetters = [
    {
        id: 1,
        letter: "أ",
        name: "الألف",
        pronunciation: "أَلِف",
        sound: "alif.mp3",
        images: ["Apple.png", "airplane.jpg", "ant.jpg"],
        words: ["تفاحة", "طائرة", "نملة"]
    },
    {
        id: 2,
        letter: "ب",
        name: "الباء",
        pronunciation: "بَاء",
        sound: "baa.mp3",
        images: ["ball.jpg", "house.jpg", "cat.jpg"],
        words: ["كرة", "بيت", "قطة"]
    },
    {
        id: 3,
        letter: "ت",
        name: "التاء",
        pronunciation: "تَاء",
        sound: "taa.mp3",
        images: ["table.jpg", "window.jpg", "bird.jpg"],
        words: ["طاولة", "نافذة", "عصفور"]
    },
    {
        id: 4,
        letter: "ث",
        name: "الثاء",
        pronunciation: "ثَاء",
        sound: "tha.mp3",
        images: ["carrot.jpg", "sun.jpg", "moon.jpg"],
        words: ["جزر", "شمس", "قمر"]
    },
    {
        id: 5,
        letter: "ج",
        name: "الجيم",
        pronunciation: "جِيم",
        sound: "jeem.mp3",
        images: ["giraffe.jpg", "mountain.jpg", "rose.jpg"],
        words: ["زرافة", "جبل", "وردة"]
    },
    {
        id: 6,
        letter: "ح",
        name: "الحاء",
        pronunciation: "حَاء",
        sound: "haa.mp3",
        images: ["bear.jpg", "bee.jpg", "fish.jpg"],
        words: ["دب", "نحلة", "سمكة"]
    },
    {
        id: 7,
        letter: "خ",
        name: "الخاء",
        pronunciation: "خَاء",
        sound: "khaa.mp3",
        images: ["brother.jpg", "eggplant.jpg", "book.jpg"],
        words: ["أخ", "باذنجان", "كتاب"]
    },
    {
        id: 8,
        letter: "د",
        name: "الدال",
        pronunciation: "دَال",
        sound: "dal.mp3",
        images: ["dolphin.jpg", "duck.jpg", "doctor.jpg"],
        words: ["دلفين", "بطة", "دكتور"]
    },


    {
        letter: "أ",
        name: "الألف",
        images: ["apple.png"], // تأكد أن هذا الملف موجود في مجلد programs/images/
        words: ["تفاحة"],
        // ... بقية البيانات
    }
];







// متغيرات اللعبة
let currentLetterIndex = 0;
let score = 0;
let totalQuestions = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let gameActive = true;
let soundEnabled = true;
let musicEnabled = true;

// عناصر DOM
const currentLetterElement = document.getElementById('current-letter');
const letterNameElement = document.getElementById('letter-name');
const letterPronunciationElement = document.getElementById('letter-pronunciation');
const imageElement = document.getElementById('letter-image');
const optionsContainer = document.getElementById('options-container');
const questionElement = document.getElementById('question-text');
const feedbackElement = document.getElementById('feedback');
const progressFillElement = document.getElementById('progress-fill');
const scoreElement = document.getElementById('score-value');
const correctCountElement = document.getElementById('correct-count');
const wrongCountElement = document.getElementById('wrong-count');
const lettersCountElement = document.getElementById('letters-count');
const playSoundBtn = document.getElementById('play-sound');
const nextLetterBtn = document.getElementById('next-letter');
const repeatExerciseBtn = document.getElementById('repeat-exercise');
const toggleSoundBtn = document.getElementById('toggle-sound');
const toggleMusicBtn = document.getElementById('toggle-music');
const certificateModal = document.getElementById('certificate-modal');
const finalScoreElement = document.getElementById('final-score');
const downloadCertificateBtn = document.getElementById('download-certificate');
const shareCertificateBtn = document.getElementById('share-certificate');
const closeModalBtn = document.getElementById('close-modal');

// تهيئة اللعبة
function initGame() {
    loadLetter(0);
    updateStats();
    updateProgress();
}

// تحميل حرف جديد
function loadLetter(index) {
    if (index >= arabicLetters.length) {
        showCertificate();
        return;
    }
    
    currentLetterIndex = index;
    const letter = arabicLetters[index];
    
    // تحديث عرض الحرف
    currentLetterElement.textContent = letter.letter;
    letterNameElement.textContent = letter.name;
    letterPronunciationElement.textContent = letter.pronunciation;
    
    // تحميل الصورة
    const randomImageIndex = Math.floor(Math.random() * letter.images.length);
    imageElement.src = `programs/images/${letter.images[randomImageIndex]}`;
    imageElement.alt = letter.words[randomImageIndex];
    
    // إعداد السؤال
    questionElement.textContent = `اختر الحرف الذي تبدأ به كلمة "${letter.words[randomImageIndex]}"`;
    
    // توليد الخيارات
    generateOptions(letter);
    
    // إعداد صوت الحرف
    playSoundBtn.onclick = () => playLetterSound(letter.sound);
    
    // إعادة تعيين التغذية الراجعة
    feedbackElement.style.display = 'none';
    feedbackElement.className = 'feedback';
    
    // تحديث التقدم
    updateProgress();
}

// توليد الخيارات
function generateOptions(correctLetter) {
    optionsContainer.innerHTML = '';
    
    // إنشاء مصفوفة من الحروف العشوائية
    let options = [correctLetter.letter];
    
    // إضافة 3 حروف عشوائية أخرى
    while (options.length < 4) {
        const randomLetter = arabicLetters[Math.floor(Math.random() * arabicLetters.length)].letter;
        if (!options.includes(randomLetter)) {
            options.push(randomLetter);
        }
    }
    
    // خلط الخيارات
    options = shuffleArray(options);
    
    // إنشاء أزرار الخيارات
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(option, correctLetter.letter);
        optionsContainer.appendChild(button);
    });
}

// التحقق من الإجابة
function checkAnswer(selectedLetter, correctLetter) {
    if (!gameActive) return;
    
    totalQuestions++;
    const options = document.querySelectorAll('.option-btn');
    
    // إظهار الإجابة الصحيحة والخاطئة
    options.forEach(btn => {
        if (btn.textContent === correctLetter) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedLetter && selectedLetter !== correctLetter) {
            btn.classList.add('wrong');
        }
        btn.disabled = true;
    });
    
    // التحقق من الإجابة
    if (selectedLetter === correctLetter) {
        // إجابة صحيحة
        score += 10;
        correctAnswers++;
        showFeedback('صح! أحسنت! 🎉', 'correct');
        playSound('correct.mp3');
        
        // تأثير للزر الصحيح
        const correctBtn = Array.from(options).find(btn => btn.textContent === correctLetter);
        correctBtn.classList.add('correct-animation');
    } else {
        // إجابة خاطئة
        score = Math.max(0, score - 5);
        wrongAnswers++;
        showFeedback('خطأ! حاول مرة أخرى ❌', 'wrong');
        playSound('wrong.mp3');
    }
    
    gameActive = false;
    updateStats();
}

// عرض التغذية الراجعة
function showFeedback(message, type) {
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    feedbackElement.style.display = 'block';
}

// تشغيل صوت الحرف
function playLetterSound(soundFile) {
    if (!soundEnabled) return;
    playSound(soundFile);
}

// تشغيل أي صوت
function playSound(soundFile) {
    if (!soundEnabled) return;
    
    const audio = new Audio(`programs/sounds/${soundFile}`);
    audio.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
}

// التالي
nextLetterBtn.onclick = () => {
    if (currentLetterIndex < arabicLetters.length - 1) {
        currentLetterIndex++;
        gameActive = true;
        loadLetter(currentLetterIndex);
    } else {
        showCertificate();
    }
};

// تكرار التمرين
repeatExerciseBtn.onclick = () => {
    gameActive = true;
    loadLetter(currentLetterIndex);
};

// تبديل الصوت
toggleSoundBtn.onclick = () => {
    soundEnabled = !soundEnabled;
    toggleSoundBtn.classList.toggle('active', soundEnabled);
    toggleSoundBtn.innerHTML = soundEnabled ? 
        '<i class="fas fa-volume-up"></i>' : 
        '<i class="fas fa-volume-mute"></i>';
};

// تبديل الموسيقى
toggleMusicBtn.onclick = () => {
    musicEnabled = !musicEnabled;
    toggleMusicBtn.classList.toggle('active', musicEnabled);
    toggleMusicBtn.innerHTML = musicEnabled ? 
        '<i class="fas fa-music"></i>' : 
        '<i class="fas fa-music-slash"></i>';
};

// تحديث الإحصائيات
function updateStats() {
    scoreElement.textContent = score;
    correctCountElement.textContent = correctAnswers;
    wrongCountElement.textContent = wrongAnswers;
    lettersCountElement.textContent = `${currentLetterIndex + 1}/${arabicLetters.length}`;
}

// تحديث شريط التقدم
function updateProgress() {
    const progress = ((currentLetterIndex + 1) / arabicLetters.length) * 100;
    progressFillElement.style.width = `${progress}%`;
}

// عرض الشهادة
function showCertificate() {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    finalScoreElement.textContent = `${percentage}%`;
    
    // تحديد مستوى الإنجاز
    let achievement = '';
    if (percentage >= 90) {
        achievement = 'ممتاز 🏆';
    } else if (percentage >= 75) {
        achievement = 'جيد جداً ⭐';
    } else if (percentage >= 60) {
        achievement = 'جيد 👍';
    } else {
        achievement = 'يحتاج تحسين 📚';
    }
    
    document.getElementById('achievement-level').textContent = achievement;
    certificateModal.style.display = 'flex';
}

// إغلاق الشهادة
closeModalBtn.onclick = () => {
    certificateModal.style.display = 'none';
};

// تنزيل الشهادة
downloadCertificateBtn.onclick = () => {
    alert('جارٍ تنزيل الشهادة...');
    // هنا يمكن إضافة كود لتنزيل الشهادة كصورة
};

// مشاركة الشهادة
shareCertificateBtn.onclick = () => {
    if (navigator.share) {
        navigator.share({
            title: 'شهادة تميز في تعلم الحروف العربية',
            text: `حصلت على ${finalScoreElement.textContent} في برنامج تعلم الحروف العربية!`,
            url: window.location.href
        });
    } else {
        alert('يمكنك مشاركة الشهادة عبر التقاط صورة للشاشة! 📱');
    }
};

// وظائف مساعدة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// بدء اللعبة عند تحميل الصفحة
window.onload = initGame;

// إضافة تأثيرات للصور عند التمرير
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        if (gameActive) {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        }
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
});

// إضافة مؤثرات صوتية إضافية
function playBackgroundMusic() {
    if (musicEnabled) {
        const music = new Audio('programs/sounds/background.mp3');
        music.loop = true;
        music.volume = 0.3;
        music.play().catch(e => console.log('لا يمكن تشغيل الموسيقى'));
    }
}

// بدء تشغيل الموسيقى بعد تفاعل المستخدم
document.addEventListener('click', function initMusic() {
    if (musicEnabled) {
        playBackgroundMusic();
    }
    document.removeEventListener('click', initMusic);
});