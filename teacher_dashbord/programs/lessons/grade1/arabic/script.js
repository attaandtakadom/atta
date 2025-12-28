// بيانات الحروف العربية
const arabicLetters = [
    {
        id: 'alif',
        name: 'ألف',
        example: 'أَسد',
        image: 'images/alif.jpg',
        sound: 'sound-alif'
    },
    {
        id: 'baa',
        name: 'باء',
        example: 'بَطَّة',
        image: 'images/baa.jpg',
        sound: 'sound-baa'
    },
    {
        id: 'ta',
        name: 'تاء',
        example: 'تِمساح',
        image: 'images/ta.jpg',
        sound: 'sound-ta'
    },
    {
        id: 'tha',
        name: 'ثاء',
        example: 'ثَعلب',
        image: 'images/tha.jpg',
        sound: 'sound-tha'
    },
    {
        id: 'jeem',
        name: 'جيم',
        example: 'جَمَل',
        image: 'images/jeem.jpg',
        sound: 'sound-jeem'
    },
    {
        id: 'haa',
        name: 'حاء',
        example: 'حَصان',
        image: 'images/haa.jpg',
        sound: 'sound-haa'
    }
];

// المتغيرات العامة
let currentLetterIndex = 0;
const totalLetters = arabicLetters.length;

// عناصر DOM
const letterImageElement = document.getElementById('letter-image');
const letterNameElement = document.getElementById('letter-name');
const letterExampleElement = document.getElementById('letter-example');
const playButtonElement = document.getElementById('play-button');
const prevButtonElement = document.getElementById('prev-button');
const nextButtonElement = document.getElementById('next-button');
const positiveFeedbackElement = document.getElementById('positive-feedback');
const currentLetterNumberElement = document.getElementById('current-letter-number');
const totalLettersElement = document.getElementById('total-letters');
const lettersGridElement = document.getElementById('letters-grid');
const positiveSoundElement = document.getElementById('positive-sound');

// تهيئة البرنامج عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين العدد الإجمالي للحروف
    totalLettersElement.textContent = totalLetters;
    
    // عرض أول حرف
    updateLetterCard();
    
    // إنشاء قائمة الحروف
    createLettersMenu();
    
    // إضافة مستمعي الأحداث
    setupEventListeners();
});

// تحديث بطاقة الحرف
function updateLetterCard() {
    const currentLetter = arabicLetters[currentLetterIndex];
    
    // تحديث الصورة
    letterImageElement.src = currentLetter.image;
    letterImageElement.alt = `صورة الحرف ${currentLetter.name}`;
    
    // تحديث النصوص
    letterNameElement.textContent = currentLetter.name;
    letterExampleElement.textContent = currentLetter.example;
    
    // تحديث رقم الحرف الحالي
    currentLetterNumberElement.textContent = currentLetterIndex + 1;
    
    // تحديث القائمة النشطة
    updateActiveLetterInMenu();
}

// إنشاء قائمة الحروف
function createLettersMenu() {
    arabicLetters.forEach((letter, index) => {
        const letterOption = document.createElement('div');
        letterOption.className = 'letter-option';
        if (index === currentLetterIndex) {
            letterOption.classList.add('active');
        }
        letterOption.textContent = letter.name;
        letterOption.dataset.index = index;
        
        // عند النقر على الحرف من القائمة
        letterOption.addEventListener('click', function() {
            currentLetterIndex = parseInt(this.dataset.index);
            updateLetterCard();
            showPositiveFeedback();
        });
        
        lettersGridElement.appendChild(letterOption);
    });
}

// تحديث الحرف النشط في القائمة
function updateActiveLetterInMenu() {
    const letterOptions = document.querySelectorAll('.letter-option');
    letterOptions.forEach((option, index) => {
        if (index === currentLetterIndex) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // زر تشغيل الصوت
    playButtonElement.addEventListener('click', playCurrentLetterSound);
    
    // زر الحرف السابق
    prevButtonElement.addEventListener('click', function() {
        if (currentLetterIndex > 0) {
            currentLetterIndex--;
            updateLetterCard();
            showPositiveFeedback();
        }
    });
    
    // زر الحرف التالي
    nextButtonElement.addEventListener('click', function() {
        if (currentLetterIndex < totalLetters - 1) {
            currentLetterIndex++;
            updateLetterCard();
            showPositiveFeedback();
        }
    });
    
    // إضافة اختصارات لوحة المفاتيح للأطفال الأكبر سناً
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowRight':
                if (currentLetterIndex > 0) {
                    currentLetterIndex--;
                    updateLetterCard();
                    showPositiveFeedback();
                }
                break;
            case 'ArrowLeft':
                if (currentLetterIndex < totalLetters - 1) {
                    currentLetterIndex++;
                    updateLetterCard();
                    showPositiveFeedback();
                }
                break;
            case ' ':
            case 'Enter':
                playCurrentLetterSound();
                event.preventDefault();
                break;
        }
    });
}

// تشغيل صوت الحرف الحالي
function playCurrentLetterSound() {
    const currentLetter = arabicLetters[currentLetterIndex];
    const soundElement = document.getElementById(currentLetter.sound);
    
    if (soundElement) {
        // إعادة تعيين الصوت لبدء التشغيل من البداية
        soundElement.currentTime = 0;
        
        // تشغيل الصوت
        soundElement.play().catch(error => {
            console.error("خطأ في تشغيل الصوت:", error);
            alert("تعذر تشغيل الصوت. يرجى التحقق من الملفات الصوتية.");
        });
        
        // عرض رد الفعل الإيجابي
        showPositiveFeedback();
        
        // تشغيل صوت التعزيز الإيجابي
        setTimeout(() => {
            positiveSoundElement.currentTime = 0;
            positiveSoundElement.play();
        }, 300);
    } else {
        console.error(`عنصر الصوت ${currentLetter.sound} غير موجود`);
    }
}

// عرض رد الفعل الإيجابي
function showPositiveFeedback() {
    // إظهار التأثير الإيجابي
    positiveFeedbackElement.classList.add('active');
    
    // إخفاء التأثير بعد 1.5 ثانية
    setTimeout(() => {
        positiveFeedbackElement.classList.remove('active');
    }, 1500);
}

// دالة لتحميل الصور مسبقاً لضمان سرعة العرض
function preloadImages() {
    arabicLetters.forEach(letter => {
        const img = new Image();
        img.src = letter.image;
    });
}

// تحميل الصور مسبقاً
preloadImages();