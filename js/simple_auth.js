// js/simple-auth.js - نظام مبسط يعمل على جميع البيئات
window.SimpleAuth = {
    // بيانات المستخدمين الافتراضية
    users: [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            email: 'admin@autism-platform.edu',
            fullName: 'مدير النظام',
            userType: 'admin',
            phone: '0921234567',
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            username: 'teacher1',
            password: 'teacher123',
            email: 'teacher1@autism-platform.edu',
            fullName: 'المعلم أحمد',
            userType: 'teacher',
            phone: '0912345678',
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            username: 'student1',
            password: 'student123',
            email: 'student1@autism-platform.edu',
            fullName: 'الطالب محمد',
            userType: 'student',
            phone: '0923456789',
            age: '10',
            guardianName: 'أحمد علي',
            isActive: true,
            createdAt: new Date().toISOString()
        }
    ],
    
    // تهيئة النظام
    init: function() {
        console.log('🚀 نظام المصادقة المبسط جاهز');
        
        // تحميل المستخدمين من localStorage إذا موجودين
        const savedUsers = localStorage.getItem('simple_users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }
        
        return Promise.resolve(true);
    },
    
    // تسجيل الدخول
    login: function(username, password) {
        console.log('🔐 محاولة تسجيل دخول:', username);
        
        // البحث عن المستخدم
        const user = this.users.find(u => 
            u.username === username && u.password === password
        );
        
        if (user) {
            // حذف كلمة المرور قبل التخزين
            const userCopy = { ...user };
            delete userCopy.password;
            
            // حفظ الجلسة
            localStorage.setItem('currentUser', JSON.stringify(userCopy));
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('✅ تسجيل دخول ناجح:', username);
            
            return {
                success: true,
                user: userCopy,
                redirect: this.getDashboardPath(user.userType)
            };
        }
        
        console.log('❌ فشل تسجيل الدخول:', username);
        return {
            success: false,
            message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        };
    },
    
    // تسجيل الخروج
    logout: function() {
        const username = this.getCurrentUser()?.username || 'مستخدم';
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        console.log('👋 تم تسجيل الخروج:', username);
        window.location.href = 'index.html';
    },
    
    // التحقق من حالة الدخول
    isLoggedIn: function() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },
    
    // الحصول على المستخدم الحالي
    getCurrentUser: function() {
        try {
            const userStr = localStorage.getItem('currentUser');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },
    
    // إضافة مستخدم جديد
    addUser: function(userData) {
        // توليد معرف فريد
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        // إضافة المستخدم
        this.users.push(newUser);
        
        // حفظ في localStorage
        localStorage.setItem('simple_users', JSON.stringify(this.users));
        
        console.log('➕ تم إضافة مستخدم جديد:', userData.username);
        
        return Promise.resolve(newUser.id);
    },
    
    // الحصول على جميع المستخدمين حسب النوع
    getUsersByType: function(type) {
        const users = this.users.filter(u => u.userType === type);
        // حذف كلمات المرور
        return users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });
    },
    
    // الحصول على جميع الطلاب
    getAllStudents: function() {
        return this.getUsersByType('student');
    },
    
    // الحصول على مسار لوحة التحكم
    getDashboardPath: function(userType) {
        const paths = {
            'admin': 'admin_dashboard.html',
            'teacher': 'teacher_dashboard/index.html',
            'student': 'teacher_dashboard/index.html',
            'parent': 'parent_dashboard.html'
        };
        return paths[userType] || 'dashboard.html';
    },
    
    // تحديث الإحصائيات
    getStats: function() {
        const students = this.getUsersByType('student').length;
        const teachers = this.getUsersByType('teacher').length;
        const parents = this.getUsersByType('parent').length;
        
        return {
            totalUsers: this.users.length,
            totalStudents: students,
            totalTeachers: teachers,
            totalParents: parents
        };
    }
};

// تهيئة تلقائية
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 الصفحة محملة، جاري تهيئة النظام...');
    
    // اختبار بسيط
    setTimeout(() => {
        SimpleAuth.init().then(() => {
            console.log('🎉 النظام المبسط جاهز للاستخدام!');
            
            // إخفاء رسالة الخطأ إذا كانت ظاهرة
            const errorDivs = document.querySelectorAll('[style*="background: #ef476f"], [style*="background:#ef476f"]');
            errorDivs.forEach(el => el.style.display = 'none');
            
            // تمكين أزرار الدخول
            const loginBtn = document.getElementById('loginHeroBtn');
            const registerBtn = document.getElementById('registerHeroBtn');
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            
        }).catch(error => {
            console.error('❌ خطأ في النظام المبسط:', error);
        });
    }, 500);
});