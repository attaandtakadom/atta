
// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    // تحديث الوقت والتاريخ
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // تهيئة البيانات
    initializeDashboard();
    
    // إضافة تفاعلية
    setupEventListeners();
    
    // تحميل البيانات من localStorage أو API
    loadTeacherData();
    
    // تحميل البيانات من ملف JSON (بديل لقاعدة البيانات)
    loadJSONData();
});

// تحديث الوقت والتاريخ
function updateDateTime() {
    const now = new Date();
    
    // الوقت
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const timeString = now.toLocaleTimeString('ar-SA', timeOptions);
    document.getElementById('current-time').textContent = timeString;
    
    // التاريخ
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const dateString = now.toLocaleDateString('ar-SA', dateOptions);
    document.getElementById('current-date').textContent = dateString;
    
    // تحديث آخر تحديث
    document.getElementById('last-update').textContent = now.toLocaleDateString('ar-SA');
    
    // تحية المعلم حسب الوقت
    updateGreeting(now);
}

// تحديث التحية حسب الوقت
function updateGreeting(now) {
    const hour = now.getHours();
    let greeting = 'مرحباً';
    
    if (hour >= 5 && hour < 12) {
        greeting = 'صباح الخير';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'مساء الخير';
    } else {
        greeting = 'مساء الخير';
    }
    
    const teacherName = localStorage.getItem('teacherName') || 'أحمد';
    document.getElementById('greeting-name').textContent = teacherName;
}

// تهيئة البيانات
function initializeDashboard() {
    // بيانات افتراضية
    const defaultData = {
        teacherName: 'أحمد محمد',
        totalStudents: 42,
        todaySessions: 5,
        pendingAssignments: 18,
        attendanceRate: 94
    };
    
    // تطبيق البيانات
    document.getElementById('teacher-name').textContent = defaultData.teacherName;
    document.getElementById('total-students').textContent = defaultData.totalStudents;
    document.getElementById('today-sessions').textContent = defaultData.todaySessions;
    document.getElementById('pending-assignments').textContent = defaultData.pendingAssignments;
    document.getElementById('attendance-rate').textContent = defaultData.attendanceRate + '%';
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // تفعيل/تعطيل القائمة الجانبية على الأجهزة الصغيرة
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
    
    // النقر على عناصر القائمة
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.classList.contains('logout-btn')) {
                e.preventDefault();
                
                // إزالة النشاط من جميع العناصر
                document.querySelectorAll('.menu-item').forEach(i => {
                    i.classList.remove('active');
                });
                
                // إضافة النشاط للعنصر المحدد
                this.classList.add('active');
                
                // عرض محتوى الصفحة المحددة
                const pageId = this.getAttribute('data-page');
                if (pageId) {
                    loadPageContent(pageId);
                }
            }
        });
    });
    
    // النقر على المواد الدراسية
    document.querySelectorAll('.subject-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            filterSubjects(subject);
        });
    });
    
    // تصفية المواد الدراسية
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة النشاط من جميع الأزرار
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // إضافة النشاط للزر المحدد
            this.classList.add('active');
            
            // تصفية المواد حسب المرحلة
            const stage = this.textContent;
            filterByStage(stage);
        });
    });
    
    // بدء التدريس
    document.querySelectorAll('.start-lesson').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectCard = this.closest('.subject-card');
            const subject = subjectCard.getAttribute('data-subject');
            startLesson(subject);
        });
    });
    
    // عرض التفاصيل
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectCard = this.closest('.subject-card');
            const subject = subjectCard.getAttribute('data-subject');
            showSubjectDetails(subject);
        });
    });
    
    // الانضمام للجلسات
    document.querySelectorAll('.join-session').forEach(btn => {
        btn.addEventListener('click', function() {
            const sessionCard = this.closest('.session-card');
            joinSession(sessionCard);
        });
    });
    
    // الإجراءات السريعة
    document.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', function() {
            const actionType = this.querySelector('span').textContent;
            performQuickAction(actionType);
        });
    });
    
    // زر الإضافة السريعة
    document.querySelector('.quick-add-btn').addEventListener('click', function() {
        showQuickAddMenu();
    });
    
    // زر الإشعارات
    document.querySelector('.notification-btn').addEventListener('click', function() {
        showNotifications();
    });
    
    // زر تسجيل الخروج
    document.querySelector('.logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logoutTeacher();
    });
}

// تحميل بيانات المعلم
function loadTeacherData() {
    // جلب البيانات من localStorage
    const savedData = localStorage.getItem('teacherDashboardData');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // تطبيق البيانات المحفوظة
            if (data.teacherName) {
                document.getElementById('teacher-name').textContent = data.teacherName;
                localStorage.setItem('teacherName', data.teacherName);
            }
            
            if (data.totalStudents) {
                document.getElementById('total-students').textContent = data.totalStudents;
            }
            
            // ... تطبيق باقي البيانات
        } catch (error) {
            console.error('Error loading teacher data:', error);
        }
    }
}

// تحميل البيانات من ملف JSON
function loadJSONData() {
    // ملف JSON وهمي للبيانات
    const mockData = {
        teacher: {
            name: "أحمد محمد",
            subjects: ["arabic", "math", "science", "islamic", "english", "social"],
            stats: {
                students: 42,
                sessions: 5,
                assignments: 18,
                attendance: 94
            }
        },
        sessions: [
            { time: "09:00", subject: "اللغة العربية", grade: "الصف الأول" },
            { time: "10:30", subject: "الرياضيات", grade: "الصف الثالث" },
            { time: "01:00", subject: "العلوم", grade: "الصف الثاني" }
        ],
        activities: [
            { type: "assignment", message: "تم تسليم واجب الرياضيات", time: "منذ 10 دقائق" },
            { type: "warning", message: "3 طلاب لم يسلموا واجب اللغة العربية", time: "منذ ساعة" },
            { type: "info", message: "جلسة جديدة مجدولة للعلوم", time: "منذ 3 ساعات" }
        ]
    };
    
    // حفظ البيانات في localStorage
    localStorage.setItem('teacherDashboardData', JSON.stringify(mockData));
}

// تصفية المواد الدراسية
function filterSubjects(subjectType) {
    const allSubjects = document.querySelectorAll('.subject-card');
    
    if (subjectType === 'all') {
        // عرض جميع المواد
        allSubjects.forEach(subject => {
            subject.style.display = 'block';
        });
    } else {
        // عرض المواد المحددة فقط
        allSubjects.forEach(subject => {
            if (subject.getAttribute('data-subject') === subjectType) {
                subject.style.display = 'block';
            } else {
                subject.style.display = 'none';
            }
        });
    }
    
    // إضافة تأثير
    highlightActiveFilter(subjectType);
}

// تصفية حسب المرحلة
function filterByStage(stage) {
    console.log(`تصفية المواد حسب المرحلة: ${stage}`);
    // يمكن إضافة منطق التصفية هنا حسب المرحلة الدراسية
}

// بدء درس
function startLesson(subject) {
    const subjectNames = {
        arabic: "اللغة العربية",
        math: "الرياضيات",
        science: "العلوم",
        islamic: "التربية الإسلامية",
        english: "اللغة الإنجليزية",
        social: "الاجتماعيات"
    };
    
    const subjectName = subjectNames[subject] || subject;
    
    // تسجيل النشاط
    logActivity(`بدأ تدريس مادة ${subjectName}`);
    
    // عرض رسالة تأكيد
    Swal.fire({
        title: 'بدء التدريس',
        html: `هل تريد بدء درس <b>${subjectName}</b>؟`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، ابدأ',
        cancelButtonText: 'لاحقاً',
        confirmButtonColor: '#4361ee'
    }).then((result) => {
        if (result.isConfirmed) {
            // الانتقال لصفحة التدريس
            window.location.href = `teach.html?subject=${subject}`;
        }
    });
}

// عرض تفاصيل المادة
function showSubjectDetails(subject) {
    // يمكن تحميل تفاصيل المادة من ملف JSON أو API
    const subjectDetails = {
        arabic: {
            description: "مادة اللغة العربية تشمل القراءة، الكتابة، القواعد، والإملاء",
            programs: 4,
            students: 23,
            progress: 85
        }
        // ... إضافة تفاصيل المواد الأخرى
    };
    
    const details = subjectDetails[subject];
    
    if (details) {
        Swal.fire({
            title: `تفاصيل ${subjectNames[subject] || subject}`,
            html: `
                <div style="text-align: right;">
                    <p><strong>الوصف:</strong> ${details.description}</p>
                    <p><strong>عدد البرامج:</strong> ${details.programs}</p>
                    <p><strong>عدد الطلاب:</strong> ${details.students}</p>
                    <p><strong>معدل الإنجاز:</strong> ${details.progress}%</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#4361ee'
        });
    }
}

// الانضمام للجلسة
function joinSession(sessionCard) {
    const sessionTitle = sessionCard.querySelector('h4').textContent;
    
    Swal.fire({
        title: 'الانضمام للجلسة',
        html: `هل تريد الانضمام إلى جلسة <b>${sessionTitle}</b>؟`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'انضم الآن',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#43a047'
    }).then((result) => {
        if (result.isConfirmed) {
            // محاكاة الاتصال بالجلسة
            Swal.fire({
                title: 'جاري الاتصال...',
                text: 'يرجى الانتظار قليلاً',
                icon: 'info',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // بعد الاتصال
                Swal.fire({
                    title: 'تم الاتصال!',
                    text: 'أنت الآن في جلسة التعلم',
                    icon: 'success',
                    confirmButtonText: 'حسناً'
                });
                
                // تسجيل النشاط
                logActivity(`انضم لجلسة ${sessionTitle}`);
            });
        }
    });
}

// تنفيذ إجراء سريع
function performQuickAction(actionType) {
    const actions = {
        'إضافة طالب': addNewStudent,
        'إنشاء درس': createNewLesson,
        'واجب جديد': createAssignment,
        'تقرير أداء': generateReport,
        'تحليل النتائج': analyzeResults,
        'الرسائل': openMessages
    };
    
    if (actions[actionType]) {
        actions[actionType]();
    }
}

// إضافة طالب جديد
function addNewStudent() {
    Swal.fire({
        title: 'إضافة طالب جديد',
        html: `
            <input id="swal-input1" class="swal2-input" placeholder="اسم الطالب">
            <input id="swal-input2" class="swal2-input" placeholder="الصف">
            <input id="swal-input3" class="swal2-input" placeholder="البريد الإلكتروني">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'إضافة',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
            return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value,
                document.getElementById('swal-input3').value
            ];
        }
    }).then((result) => {
        if (result.isConfirmed && result.value[0]) {
            // زيادة عدد الطلاب
            const currentStudents = parseInt(document.getElementById('total-students').textContent);
            document.getElementById('total-students').textContent = currentStudents + 1;
            
            // عرض رسالة نجاح
            Swal.fire(
                'تمت الإضافة!',
                `تم إضافة الطالب ${result.value[0]} بنجاح`,
                'success'
            );
            
            // تسجيل النشاط
            logActivity(`أضاف طالب جديد: ${result.value[0]}`);
        }
    });
}

// إنشاء درس جديد
function createNewLesson() {
    Swal.fire({
        title: 'إنشاء درس جديد',
        html: `
            <select id="swal-subject" class="swal2-input">
                <option value="">اختر المادة</option>
                <option value="arabic">اللغة العربية</option>
                <option value="math">الرياضيات</option>
                <option value="science">العلوم</option>
                <option value="islamic">التربية الإسلامية</option>
            </select>
            <input id="swal-title" class="swal2-input" placeholder="عنوان الدرس">
            <textarea id="swal-description" class="swal2-input" placeholder="وصف الدرس" rows="3"></textarea>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'إنشاء',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'تم الإنشاء!',
                'تم إنشاء الدرس بنجاح',
                'success'
            );
            
            logActivity('أنشأ درس جديد');
        }
    });
}

// إنشاء واجب
function createAssignment() {
    Swal.fire({
        title: 'واجب جديد',
        text: 'سيتم إنشاء واجب جديد للطلاب',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'متابعة',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            // زيادة عدد الواجبات المعلقة
            const currentAssignments = parseInt(document.getElementById('pending-assignments').textContent);
            document.getElementById('pending-assignments').textContent = currentAssignments + 1;
            
            Swal.fire(
                'تم الإنشاء!',
                'تم إنشاء الواجب بنجاح',
                'success'
            );
            
            logActivity('أنشأ واجب جديد');
        }
    });
}

// توليد تقرير
function generateReport() {
    Swal.fire({
        title: 'توليد تقرير',
        text: 'جاري إنشاء تقرير الأداء...',
        icon: 'info',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        Swal.fire({
            title: 'التقرير جاهز!',
            html: 'تم إنشاء تقرير الأداء بنجاح.<br><br>يمكنك <a href="#" style="color: #4361ee;">تنزيله الآن</a>',
            icon: 'success',
            confirmButtonText: 'حسناً'
        });
        
        logActivity('أنشأ تقرير أداء');
    });
}

// تحليل النتائج
function analyzeResults() {
    Swal.fire({
        title: 'تحليل النتائج',
        html: `
            <div style="text-align: center; margin: 20px 0;">
                <canvas id="resultsChart" width="300" height="200"></canvas>
            </div>
            <p>جاري تحليل نتائج الطلاب...</p>
        `,
        icon: 'info',
        showConfirmButton: true,
        confirmButtonText: 'حسناً',
        didOpen: () => {
            // رسم مخطط وهمي
            const ctx = document.getElementById('resultsChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['عربية', 'رياضيات', 'علوم', 'إسلامية'],
                    datasets: [{
                        label: 'معدل النجاح',
                        data: [85, 78, 92, 88],
                        backgroundColor: ['#4361ee', '#f72585', '#4cc9f0', '#43a047']
                    }]
                },
                options: {
                    responsive: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    });
}

// فتح الرسائل
function openMessages() {
    Swal.fire({
        title: 'الرسائل',
        html: `
            <div style="text-align: right; max-height: 300px; overflow-y: auto;">
                <div class="message-item">
                    <strong>وليد أحمد (ولي أمر)</strong>
                    <p>هل يمكن تحديد موعد إضافي للرياضيات؟</p>
                    <small>منذ ساعتين</small>
                </div>
                <div class="message-item">
                    <strong>إدارة المدرسة</strong>
                    <p>اجتماع المعلمين غداً الساعة 10 صباحاً</p>
                    <small>منذ 5 ساعات</small>
                </div>
                <div class="message-item">
                    <strong>سارة محمد (طالبة)</strong>
                    <p>لم أفهم تمرين صفحة 45 في العلوم</p>
                    <small>منذ يوم</small>
                </div>
            </div>
        `,
        width: 600,
        showCancelButton: true,
        confirmButtonText: 'رد على الجميع',
        cancelButtonText: 'إغلاق'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'رد جماعي',
                input: 'textarea',
                inputPlaceholder: 'اكتب رسالتك هنا...',
                showCancelButton: true,
                confirmButtonText: 'إرسال',
                cancelButtonText: 'إلغاء'
            }).then((sendResult) => {
                if (sendResult.isConfirmed && sendResult.value) {
                    Swal.fire('تم الإرسال!', 'تم إرسال ردك بنجاح', 'success');
                    logActivity('أرسل رداً جماعياً على الرسائل');
                }
            });
        }
    });
}

// عرض قائمة الإضافة السريعة
function showQuickAddMenu() {
    Swal.fire({
        title: 'إضافة سريعة',
        html: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
                <button class="quick-add-option" onclick="addNewStudent()">
                    <i class="fas fa-user-plus"></i><br>طالب
                </button>
                <button class="quick-add-option" onclick="createNewLesson()">
                    <i class="fas fa-book-medical"></i><br>درس
                </button>
                <button class="quick-add-option" onclick="createAssignment()">
                    <i class="fas fa-tasks"></i><br>واجب
                </button>
                <button class="quick-add-option" onclick="generateReport()">
                    <i class="fas fa-file-pdf"></i><br>تقرير
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true
    });
}

// عرض الإشعارات
function showNotifications() {
    // مسح العد
    document.querySelector('.notification-count').textContent = '0';
    
    Swal.fire({
        title: 'الإشعارات',
        html: `
            <div style="text-align: right;">
                <div class="notification-item unread">
                    <strong>موعد جلسة</strong>
                    <p>جلسة اللغة العربية تبدأ بعد 15 دقيقة</p>
                    <small>منذ 5 دقائق</small>
                </div>
                <div class="notification-item unread">
                    <strong>تسليم واجب</strong>
                    <p>5 طلاب سلموا واجب الرياضيات</p>
                    <small>منذ ساعة</small>
                </div>
                <div class="notification-item">
                    <strong>رسالة جديدة</strong>
                    <p>لديك رسالة من ولي أمر الطالب علي</p>
                    <small>منذ 3 ساعات</small>
                </div>
            </div>
        `,
        width: 500,
        showConfirmButton: false,
        showCloseButton: true
    });
}

// تسجيل نشاط
function logActivity(message) {
    const activities = JSON.parse(localStorage.getItem('teacherActivities') || '[]');
    activities.unshift({
        message: message,
        timestamp: new Date().toISOString(),
        timeAgo: 'الآن'
    });
    
    // حفظ آخر 50 نشاط فقط
    if (activities.length > 50) {
        activities.pop();
    }
    
    localStorage.setItem('teacherActivities', JSON.stringify(activities));
    
    // تحديث عرض الأنشطة
    updateActivitiesDisplay(activities.slice(0, 3));
}

// تحديث عرض الأنشطة
function updateActivitiesDisplay(activities) {
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        timeline.innerHTML = activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-icon info">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="timeline-content">
                    <p>${activity.message}</p>
                    <span class="timeline-time">${activity.timeAgo}</span>
                </div>
            </div>
        `).join('');
    }
}

// تسجيل خروج المعلم
function logoutTeacher() {
    Swal.fire({
        title: 'تسجيل الخروج',
        text: 'هل أنت متأكد من تسجيل الخروج؟',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، سجل خروج',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#ef476f'
    }).then((result) => {
        if (result.isConfirmed) {
            // مسح بيانات الجلسة
            localStorage.removeItem('teacherSession');
            
            // إضافة رسالة الانتظار
            Swal.fire({
                title: 'جاري تسجيل الخروج...',
                text: 'يرجى الانتظار',
                icon: 'info',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // التوجيه لصفحة تسجيل الدخول
                window.location.href = 'login.html';
            });
        }
    });
}

// إبراز عامل التصفية النشط
function highlightActiveFilter(subjectType) {
    document.querySelectorAll('.subject-tag').forEach(tag => {
        tag.style.background = '#e9ecef';
        tag.style.color = '#212529';
    });
    
    const activeTag = document.querySelector(`.subject-tag[data-subject="${subjectType}"]`);
    if (activeTag) {
        activeTag.style.background = '#4361ee';
        activeTag.style.color = 'white';
    }
}

// تحميل محتوى الصفحة
function loadPageContent(pageId) {
    const content = {
        'dashboard': 'لوحة التحكم',
        'students': 'إدارة الطلاب',
        'sessions': 'الجلسات',
        'subjects': 'المواد الدراسية',
        'reports': 'التقارير',
        'analytics': 'الإحصائيات',
        'settings': 'الإعدادات'
    };
    
    if (content[pageId]) {
        // تحديث عنوان الصفحة
        document.querySelector('.breadcrumb h1').innerHTML = `
            ${content[pageId]} <span id="greeting-name">👨‍🏫</span>
        `;
        
        // تسجيل النشاط
        logActivity(`انتقل إلى صفحة ${content[pageId]}`);
    }
}

// تهيئة Chart.js إذا كان مستخدم
if (typeof Chart !== 'undefined') {
    window.addEventListener('load', function() {
        // يمكن إضافة مخططات إضافية هنا
    });
}