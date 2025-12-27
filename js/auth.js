// js/auth.js - نظام المصادقة المعدل
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
    }
    
    async init() {
        try {
            console.log('جاري تهيئة نظام المصادقة...');
            
            // تهيئة قاعدة البيانات
            await AutismPlatformDB.init();
            console.log('تم تهيئة قاعدة البيانات');
            
            // تحميل الجلسة
            this.loadSession();
            
            this.isInitialized = true;
            console.log('تم تهيئة نظام المصادقة بنجاح');
            
        } catch (error) {
            console.error('فشل تهيئة نظام المصادقة:', error);
            this.showGlobalError('حدث خطأ في تهيئة النظام. يرجى تحديث الصفحة.');
        }
    }
    
    // تحميل جلسة المستخدم من localStorage
    loadSession() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('تم تحميل جلسة المستخدم:', this.currentUser.username);
                return true;
            }
            return false;
        } catch (error) {
            console.error('خطأ في تحميل الجلسة:', error);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');
            return false;
        }
    }
    
    // حفظ جلسة المستخدم
    saveSession(user) {
        try {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', user.userType);
            console.log('تم حفظ جلسة المستخدم:', user.username);
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الجلسة:', error);
            return false;
        }
    }
    
    // تسجيل الدخول
    async login(username, password) {
        try {
            console.log('محاولة تسجيل دخول:', username);
            
            // التحقق من التهيئة
            if (!this.isInitialized) {
                await this.init();
            }
            
            // التحقق من البيانات
            if (!username || !password) {
                return {
                    success: false,
                    message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
                };
            }
            
            // المصادقة
            const result = await AutismPlatformDB.authenticate(username, password);
            
            if (result.success) {
                if (this.saveSession(result.user)) {
                    console.log('تم تسجيل الدخول بنجاح:', result.user.username);
                    return {
                        success: true,
                        redirect: result.redirect,
                        user: result.user
                    };
                } else {
                    return {
                        success: false,
                        message: 'حدث خطأ في حفظ الجلسة'
                    };
                }
            } else {
                console.log('فشل تسجيل الدخول:', result.message);
                return result;
            }
            
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            return {
                success: false,
                message: 'حدث خطأ في النظام. حاول مرة أخرى.'
            };
        }
    }
    
    // تسجيل الخروج
    logout() {
        try {
            const username = this.currentUser?.username || 'مستخدم';
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');
            console.log('تم تسجيل الخروج:', username);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            window.location.href = 'index.html';
        }
    }
    
    // التحقق من حالة تسجيل الدخول
    isLoggedIn() {
        return !!this.currentUser && localStorage.getItem('isLoggedIn') === 'true';
    }
    
    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }
    
    // التحقق من الصلاحيات
    hasPermission(requiredType) {
        if (!this.isLoggedIn()) return false;
        
        const userType = this.currentUser.userType;
        
        // المدير لديه جميع الصلاحيات
        if (userType === AutismPlatformDB.USER_TYPES.ADMIN) {
            return true;
        }
        
        // التحقق من الصلاحية المطلوبة
        return userType === requiredType;
    }
    
    // إعادة التوجيه إذا لم يكن مسجل الدخول
    requireAuth(redirectTo = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }
    
    // إعادة التوجيه إذا لم يكن لديه الصلاحية
    requirePermission(requiredType, redirectTo = 'index.html') {
        if (!this.hasPermission(requiredType)) {
            alert('ليس لديك الصلاحية للوصول إلى هذه الصفحة');
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
    
    // عرض خطأ عام
    showGlobalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ef476f;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 9999;
            font-family: 'Cairo', sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        errorDiv.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentNode.parentNode.remove()" 
                        style="background: none; border: 1px solid white; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    ✕
                </button>
            </div>
        `;
        document.body.prepend(errorDiv);
    }
}

// إنشاء نسخة واحدة من نظام المصادقة
window.Auth = new AuthSystem();

// تهيئة تلقائية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        Auth.init().catch(error => {
            console.error('فشل التهيئة التلقائية:', error);
        });
    }, 100);
});