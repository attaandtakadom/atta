// js/database.js - نظام قاعدة البيانات المعدل
let db;
const DB_NAME = 'AutismPlatformDB';
const DB_VERSION = 2; // زد الرقم لإصلاح المشاكل

// أنواع المستخدمين
const USER_TYPES = {
    ADMIN: 'admin',
    TEACHER: 'teacher', 
    STUDENT: 'student',
    PARENT: 'parent'
};

// تهيئة قاعدة البيانات
function initDatabase() {
    return new Promise((resolve, reject) => {
        // حذف قاعدة البيانات القديمة إذا كان هناك مشكلة
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        
        deleteRequest.onsuccess = () => {
            console.log('تم حذف قاعدة البيانات القديمة');
            createNewDatabase(resolve, reject);
        };
        
        deleteRequest.onerror = (event) => {
            console.log('محاولة إنشاء قاعدة بيانات جديدة');
            createNewDatabase(resolve, reject);
        };
    });
}

function createNewDatabase(resolve, reject) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
        console.error('فشل فتح قاعدة البيانات:', event.target.error);
        reject(new Error('لا يمكن فتح قاعدة البيانات. قد يكون المتصفح لا يدعم IndexedDB.'));
    };
    
    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('تم فتح قاعدة البيانات بنجاح');
        
        // إضافة معالج للأخطاء العامة
        db.onerror = (event) => {
            console.error('خطأ في قاعدة البيانات:', event.target.error);
        };
        
        // إنشاء المدير الافتراضي إذا لم يكن موجود
        createDefaultAdminIfNeeded();
        
        resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
        console.log('ترقية قاعدة البيانات إلى الإصدار:', DB_VERSION);
        db = event.target.result;
        
        // حذف جميع المخازن القديمة
        const storeNames = db.objectStoreNames;
        for (let i = 0; i < storeNames.length; i++) {
            db.deleteObjectStore(storeNames[i]);
        }
        
        // إنشاء مخزن للمستخدمين
        const usersStore = db.createObjectStore('users', { 
            keyPath: 'id', 
            autoIncrement: true 
        });
        usersStore.createIndex('username', 'username', { unique: true });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('userType', 'userType', { unique: false });
        
        console.log('تم إنشاء مخزن المستخدمين');
    };
}

// إنشاء مدير افتراضي
async function createDefaultAdminIfNeeded() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير مهيأة'));
            return;
        }
        
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('userType');
        
        const request = index.getAll(USER_TYPES.ADMIN);
        
        request.onsuccess = (event) => {
            const admins = event.target.result;
            
            if (admins.length === 0) {
                // لا يوجد مديرين، إنشاء مدير افتراضي
                const adminTransaction = db.transaction(['users'], 'readwrite');
                const adminStore = adminTransaction.objectStore('users');
                
                const adminUser = {
                    username: 'admin',
                    password: 'YWRtaW4xMjM=', // base64 لـ "admin123"
                    email: 'admin@autism-platform.edu',
                    fullName: 'مدير النظام',
                    userType: USER_TYPES.ADMIN,
                    phone: '0921234567',
                    createdAt: new Date().toISOString(),
                    isActive: true
                };
                
                const addRequest = adminStore.add(adminUser);
                
                addRequest.onsuccess = () => {
                    console.log('تم إنشاء حساب المدير الافتراضي');
                    resolve(true);
                };
                
                addRequest.onerror = (error) => {
                    console.error('خطأ في إنشاء المدير:', error);
                    reject(error);
                };
            } else {
                console.log('يوجد بالفعل مديرين في النظام:', admins.length);
                resolve(false);
            }
        };
        
        request.onerror = (error) => {
            console.error('خطأ في التحقق من المديرين:', error);
            reject(error);
        };
    });
}

// تشفير كلمة المرور (بسيط للاختبار)
function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password + 'SALT')));
}

// إضافة مستخدم جديد
function addUser(userData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير مهيأة'));
            return;
        }
        
        try {
            const transaction = db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            // تشفير كلمة المرور
            userData.password = hashPassword(userData.password);
            userData.createdAt = new Date().toISOString();
            userData.isActive = true;
            
            // التأكد من وجود معرف فريد
            userData.id = Date.now() + Math.random().toString(36).substr(2, 9);
            
            const request = store.add(userData);
            
            request.onsuccess = () => {
                console.log('تم إضافة المستخدم:', userData.username);
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('فشل إضافة المستخدم:', event.target.error);
                
                let errorMessage = 'حدث خطأ في إضافة المستخدم';
                if (event.target.error.name === 'ConstraintError') {
                    errorMessage = 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل';
                }
                
                reject(new Error(errorMessage));
            };
            
            transaction.oncomplete = () => {
                console.log('تم اكتمال عملية إضافة المستخدم');
            };
            
            transaction.onerror = (event) => {
                console.error('خطأ في العملية:', event.target.error);
                reject(event.target.error);
            };
            
        } catch (error) {
            console.error('خطأ في addUser:', error);
            reject(error);
        }
    });
}

// التحقق من بيانات تسجيل الدخول
function authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير مهيأة'));
            return;
        }
        
        try {
            const transaction = db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('username');
            
            const request = index.get(username);
            
            request.onsuccess = (event) => {
                const user = event.target.result;
                
                if (!user) {
                    resolve({ 
                        success: false, 
                        message: 'اسم المستخدم غير موجود' 
                    });
                    return;
                }
                
                if (!user.isActive) {
                    resolve({ 
                        success: false, 
                        message: 'الحساب غير مفعل' 
                    });
                    return;
                }
                
                // التحقق من كلمة المرور
                const hashedPassword = hashPassword(password);
                if (user.password === hashedPassword) {
                    // إخفاء كلمة المرور قبل إرجاع البيانات
                    const userCopy = { ...user };
                    delete userCopy.password;
                    
                    resolve({ 
                        success: true, 
                        user: userCopy,
                        redirect: getDashboardPath(user.userType)
                    });
                } else {
                    resolve({ 
                        success: false, 
                        message: 'كلمة المرور غير صحيحة' 
                    });
                }
            };
            
            request.onerror = (event) => {
                console.error('خطأ في البحث عن المستخدم:', event.target.error);
                reject(event.target.error);
            };
            
        } catch (error) {
            console.error('خطأ في authenticateUser:', error);
            reject(error);
        }
    });
}

// الحصول على مسار لوحة التحكم
function getDashboardPath(userType) {
    switch(userType) {
        case USER_TYPES.ADMIN:
            return 'admin_dashboard.html';
        case USER_TYPES.TEACHER:
        case USER_TYPES.STUDENT:
            return 'teacher_dashboard/index.html';
        case USER_TYPES.PARENT:
            return 'parent_dashboard.html';
        default:
            return 'dashboard.html';
    }
}

// الحصول على جميع المستخدمين حسب النوع
function getUsersByType(userType) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير مهيأة'));
            return;
        }
        
        try {
            const transaction = db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('userType');
            
            const request = index.getAll(userType);
            
            request.onsuccess = (event) => {
                const users = event.target.result.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });
                resolve(users);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
            
        } catch (error) {
            console.error('خطأ في getUsersByType:', error);
            reject(error);
        }
    });
}

// إضافة طالب جديد
function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير مهيأة'));
            return;
        }
        
        try {
            const transaction = db.transaction(['users'], 'readwrite');
            const usersStore = transaction.objectStore('users');
            
            // إنشاء بيانات الطالب
            const studentId = 'STU' + Date.now();
            
            // إنشاء حساب مستخدم للطالب
            const studentUser = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                username: studentData.username || studentId.toLowerCase(),
                password: hashPassword(studentData.password || 'student123'),
                email: studentData.email || `${studentId}@autism-platform.edu`,
                fullName: studentData.fullName,
                userType: USER_TYPES.STUDENT,
                studentId: studentId,
                phone: studentData.phone || '',
                age: studentData.age || '',
                guardianName: studentData.guardianName || '',
                notes: studentData.notes || '',
                createdAt: new Date().toISOString(),
                isActive: true
            };
            
            // إضافة حساب المستخدم
            const userRequest = usersStore.add(studentUser);
            
            userRequest.onsuccess = () => {
                console.log('تم إضافة الطالب:', studentData.fullName);
                resolve({ 
                    studentId: studentId,
                    username: studentUser.username,
                    password: studentData.password || 'student123'
                });
            };
            
            userRequest.onerror = (event) => {
                console.error('فشل إضافة حساب الطالب:', event.target.error);
                reject(event.target.error);
            };
            
        } catch (error) {
            console.error('خطأ في addStudent:', error);
            reject(error);
        }
    });
}

// الحصول على جميع الطلاب
function getAllStudents() {
    return getUsersByType(USER_TYPES.STUDENT);
}

// الحصول على جميع المستخدمين
function getAllUsers() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير مهيأة'));
            return;
        }
        
        try {
            const transaction = db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                const users = event.target.result.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });
                resolve(users);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
            
        } catch (error) {
            console.error('خطأ في getAllUsers:', error);
            reject(error);
        }
    });
}

// تصدير الدوال للاستخدام
window.AutismPlatformDB = {
    init: initDatabase,
    addUser: addUser,
    authenticate: authenticateUser,
    getUsersByType: getUsersByType,
    getAllUsers: getAllUsers,
    addStudent: addStudent,
    getAllStudents: getAllStudents,
    USER_TYPES: USER_TYPES,
    hashPassword: hashPassword // للاختبار فقط
};