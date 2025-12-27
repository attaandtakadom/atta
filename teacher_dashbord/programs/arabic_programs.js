// arabic_programs.js
const arabicPrograms = {
    // برامج الصف الأول - الحروف الهجائية
    grade1: {
        hijaiyah: {
            title: "برنامج الحروف الهجائية",
            description: "تعليم الحروف العربية مع النطق الصحيح والكتابة",
            totalLessons: 28,
            completedLessons: 18,
            progress: 65,
            status: "active",
            lessons: [
                {
                    id: 1,
                    letter: "أ",
                    name: "الألف",
                    video: "alif.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "ألف ممدودة"
                },
                {
                    id: 2,
                    letter: "ب",
                    name: "الباء",
                    video: "baa.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "باء"
                },
                {
                    id: 3,
                    letter: "ت",
                    name: "التاء",
                    video: "taa.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "تاء"
                },
                {
                    id: 4,
                    letter: "ث",
                    name: "الثاء",
                    video: "tha.mp4",
                    exercises: 5,
                    completed: false,
                    pronunciation: "ثاء مثلث"
                },
                {
                    id: 5,
                    letter: "ج",
                    name: "الجيم",
                    video: "jeem.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "جيم"
                },
                {
                    id: 6,
                    letter: "ح",
                    name: "الحاء",
                    video: "haa.mp4",
                    exercises: 5,
                    completed: false,
                    pronunciation: "حاء مهملة"
                },
                {
                    id: 7,
                    letter: "خ",
                    name: "الخاء",
                    video: "khaa.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "خاء معجمة"
                },
                {
                    id: 8,
                    letter: "د",
                    name: "الدال",
                    video: "dal.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "دال مهملة"
                },
                {
                    id: 9,
                    letter: "ذ",
                    name: "الذال",
                    video: "thal.mp4",
                    exercises: 5,
                    completed: false,
                    pronunciation: "ذال معجمة"
                },
                {
                    id: 10,
                    letter: "ر",
                    name: "الراء",
                    video: "raa.mp4",
                    exercises: 5,
                    completed: true,
                    pronunciation: "راء مهملة"
                }
            ],
            activities: [
                { type: "تعرف", count: 10, icon: "fa-eye" },
                { type: "نطق", count: 8, icon: "fa-microphone" },
                { type: "كتابة", count: 6, icon: "fa-pen" },
                { type: "اختبار", count: 4, icon: "fa-clipboard-check" }
            ]
        },
        reading: {
            title: "القراءة البسيطة",
            description: "قراءة كلمات وجمل قصيرة",
            progress: 70,
            status: "active"
        },
        writing: {
            title: "كتابة الحروف",
            description: "تدريب على كتابة الحروف بشكل صحيح",
            progress: 85,
            status: "active"
        }
    },
    
    // برامج الصف الثاني
    grade2: {
        sentences: {
            title: "الجمل القصيرة",
            description: "تكوين جمل بسيطة من كلمات مألوفة",
            progress: 78,
            status: "active"
        },
        dictation: {
            title: "الإملاء البسيط",
            description: "كتابة كلمات وجمل قصيرة بإملاء صحيح",
            progress: 82,
            status: "active"
        }
    },
    
    // برامج الصف الثالث
    grade3: {
        comprehension: {
            title: "الفهم القرائي",
            description: "فهم النصوص البسيطة والإجابة على الأسئلة",
            progress: 75,
            status: "active"
        },
        expression: {
            title: "التعبير الكتابي",
            description: "كتابة فقرات قصيرة عن مواضيع بسيطة",
            progress: 68,
            status: "active"
        }
    },
    
    // برامج الصف الرابع
    grade4: {
        texts: {
            title: "النصوص الأدبية",
            description: "قراءة نصوص أدبية بسيطة",
            progress: 72,
            status: "active"
        },
        composition: {
            title: "الإنشاء",
            description: "كتابة موضوعات تعبيرية",
            progress: 65,
            status: "active"
        }
    },
    
    // برامج الصف الخامس
    grade5: {
        grammar: {
            title: "النحو والصرف",
            description: "قواعد اللغة العربية الأساسية",
            progress: 70,
            status: "active"
        },
        literature: {
            title: "الأدب والبلاغة",
            description: "مفاهيم أدبية بسيطة",
            progress: 58,
            status: "pending"
        }
    }
};

// الدوال المساعدة
function getProgram(grade, programName) {
    return arabicPrograms[grade]?.[programName] || null;
}

function getStudentProgress(studentId, grade, programName) {
    // في تطبيق حقيقي، هذا سيأتي من قاعدة البيانات
    return {
        studentId: studentId,
        progress: Math.floor(Math.random() * 100),
        lastActivity: new Date().toLocaleDateString('ar-SA'),
        completedLessons: Math.floor(Math.random() * 28)
    };
}

function startLesson(lessonId, studentId) {
    console.log(`بدء الدرس ${lessonId} للطالب ${studentId}`);
    // في تطبيق حقيقي، سيتم توجيه إلى صفحة الدرس
    return {
        success: true,
        lessonUrl: `lessons/hijaiyah/${lessonId}.html`,
        message: "جارٍ تحميل الدرس..."
    };
}