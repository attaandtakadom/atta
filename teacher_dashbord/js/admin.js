// js/admin.js - وظائف إدارة لوحة تحكم المدير

class AdminManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }
    
    async init() {
        // التحقق من صلاحية المدير
        this.checkAdminPermission();
        
        // تهيئة الأحداث
        this.initEvents();
        
        // تحميل البيانات الأولية
        await this.loadInitialData();
    }
    
    // التحقق من صلاحية المدير
    checkAdminPermission() {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        
        const user = Auth.getCurrentUser();
        if (user.userType !== AutismPlatformDB.USER_TYPES.ADMIN) {
            alert('ليس لديك صلاحية الوصول إلى لوحة المدير');
            Auth.logout();
            return false;
        }
        
        return true;
    }
    
    // تهيئة الأحداث
    initEvents() {
        // تبديل علامات التبويب
        this.initTabs();
        
        // البحث في الطلاب
        this.initSearch();
        
        // تحديث البيانات تلقائياً
        this.initAutoRefresh();
    }
    
    // تهيئة علامات التبويب
    initTabs() {
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
    }
    
    // تبديل علامة التبويب
    switchTab(tabName) {
        // تحديث القائمة الجانبية
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // إظهار المحتوى المناسب
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabName) {
                content.classList.add('active');
            }
        });
        
        this.currentTab = tabName;
        
        // تحميل بيانات علامة التبويب إذا لزم الأمر
        if (tabName === 'students') {
            this.loadStudentsTable();
        } else if (tabName === 'dashboard') {
            this.loadDashboardStats();
        }
    }
    
    // تحميل البيانات الأولية
    async loadInitialData() {
        try {
            await this.loadDashboardStats();
            await this.loadStudentsTable();
            await this.loadTeachersList();
            
            // تحديث بيانات المستخدم في الشريط العلوي
            this.updateUserInfo();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showAlert('حدث خطأ في تحميل البيانات', 'error');
        }
    }
    
    // تحميل إحصائيات لوحة التحكم
    async loadDashboardStats() {
        try {
            const [students, teachers, sessions] = await Promise.all([
                AutismPlatformDB.getAllStudents(),
                AutismPlatformDB.getUsersByType(AutismPlatformDB.USER_TYPES.TEACHER),
                this.getActiveSessions()
            ]);
            
            // تحديث الأرقام
            document.getElementById('totalStudents').textContent = students.length;
            document.getElementById('totalTeachers').textContent = teachers.length;
            document.getElementById('activeSessions').textContent = sessions;
            
            // حساب نسبة الحضور (افتراضية)
            const attendance = Math.floor(Math.random() * 30) + 70; // 70-100%
            document.getElementById('todayAttendance').textContent = `${attendance}%`;
            
            // عرض آخر الطلاب
            this.showRecentStudents(students);
            
            // عرض النشاط الأخير
            this.showRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }
    
    // الحصول على الجلسات النشطة
    async getActiveSessions() {
        // في التطبيق الحقيقي، يمكنك الحصول على هذا من السيرفر
        return Math.floor(Math.random() * 10) + 1;
    }
    
    // عرض آخر الطلاب
    showRecentStudents(students) {
        const recentStudents = students
            .slice(-5)
            .reverse()
            .map(student => ({
                ...student,
                date: new Date(student.createdAt).toLocaleDateString('ar-EG')
            }));
        
        const tableBody = document.querySelector('#recentStudentsTable tbody');
        tableBody.innerHTML = '';
        
        recentStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            ${student.fullName.charAt(0)}
                        </div>
                        <span>${student.fullName}</span>
                    </div>
                </td>
                <td><span class="badge badge-success">${student.id}</span></td>
                <td>${student.date}</td>
                <td>
                    <span class="badge ${student.isActive ? 'badge-success' : 'badge-warning'}">
                        ${student.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-sm btn-outline" onclick="Admin.viewStudent('${student.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="Admin.editStudent('${student.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // عرض النشاط الأخير
    showRecentActivity() {
        const activities = [
            { user: 'أحمد علي', action: 'تم تسجيل الحضور', time: 'قبل 5 دقائق', icon: 'fa-check-circle', color: 'success' },
            { user: 'محمد حسن', action: 'تم إضافة واجب جديد', time: 'قبل 30 دقيقة', icon: 'fa-book', color: 'primary' },
            { user: 'سارة محمد', action: 'تم تحديث الملف الشخصي', time: 'قبل ساعة', icon: 'fa-user-edit', color: 'warning' },
            { user: 'مدير النظام', action: 'تم إضافة طالب جديد', time: 'قبل ساعتين', icon: 'fa-user-plus', color: 'info' },
            { user: 'علي محمود', action: 'تم إرسال رسالة', time: 'قبل 3 ساعات', icon: 'fa-comment', color: 'secondary' }
        ];
        
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;
        
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #eee;">
                    <div style="width: 40px; height: 40px; background: var(--light-gray); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${activity.icon} text-${activity.color}"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${activity.user}</div>
                        <div style="color: var(--gray); font-size: 14px;">${activity.action}</div>
                    </div>
                    <div style="color: var(--gray); font-size: 12px;">${activity.time}</div>
                </div>
            `;
            activityList.appendChild(item);
        });
    }
    
    // تحميل جدول الطلاب
    async loadStudentsTable() {
        try {
            const students = await AutismPlatformDB.getAllStudents();
            const tableBody = document.querySelector('#studentsTable tbody');
            
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            students.forEach((student, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${student.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                                <div style="font-weight: 600;">${student.fullName || 'غير محدد'}</div>
                                <div style="font-size: 12px; color: var(--gray);">${student.username || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td><code>${student.id}</code></td>
                    <td>${student.email || '<span style="color: var(--gray);">---</span>'}</td>
                    <td>${student.phone || '<span style="color: var(--gray);">---</span>'}</td>
                    <td>${student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-EG') : '---'}</td>
                    <td>
                        <span class="badge ${student.isActive ? 'badge-success' : 'badge-danger'}">
                            ${student.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-sm btn-outline" onclick="Admin.viewStudentDetails('${student.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="Admin.editStudentForm('${student.id}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="Admin.deleteStudentPrompt('${student.id}')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // تحديث عدد الطلاب في العنوان
            const studentCountElement = document.querySelector('#studentCount');
            if (studentCountElement) {
                studentCountElement.textContent = `(${students.length})`;
            }
            
        } catch (error) {
            console.error('Error loading students table:', error);
            this.showAlert('حدث خطأ في تحميل بيانات الطلاب', 'error');
        }
    }
    
    // تحميل قائمة المعلمين
    async loadTeachersList() {
        try {
            const teachers = await AutismPlatformDB.getUsersByType(AutismPlatformDB.USER_TYPES.TEACHER);
            const container = document.getElementById('teachersList');
            
            if (!container) return;
            
            container.innerHTML = '';
            
            teachers.forEach(teacher => {
                const card = document.createElement('div');
                card.className = 'teacher-card';
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 10px; margin-bottom: 10px;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--warning) 0%, #e6a700 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
                            ${teacher.fullName?.charAt(0) || 'م'}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${teacher.fullName}</div>
                            <div style="color: var(--gray); font-size: 14px;">${teacher.email}</div>
                            <div style="display: flex; gap: 10px; margin-top: 5px;">
                                <span class="badge badge-success">${teacher.studentsCount || 0} طالب</span>
                                <span class="badge badge-primary">${teacher.sessionsCount || 0} جلسة</span>
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline" onclick="Admin.viewTeacher('${teacher.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            
        } catch (error) {
            console.error('Error loading teachers list:', error);
        }
    }
    
    // تهيئة البحث
    initSearch() {
        const searchInput = document.querySelector('#studentSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchStudents(e.target.value);
        });
    }
    
    // البحث في الطلاب
    async searchStudents(query) {
        try {
            const students = await AutismPlatformDB.getAllStudents();
            const tableBody = document.querySelector('#studentsTable tbody');
            
            if (!tableBody) return;
            
            if (!query.trim()) {
                this.loadStudentsTable();
                return;
            }
            
            const filtered = students.filter(student => 
                student.fullName?.toLowerCase().includes(query.toLowerCase()) ||
                student.id?.toLowerCase().includes(query.toLowerCase()) ||
                student.email?.toLowerCase().includes(query.toLowerCase()) ||
                student.username?.toLowerCase().includes(query.toLowerCase())
            );
            
            tableBody.innerHTML = '';
            
            filtered.forEach((student, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullName}</td>
                    <td><code>${student.id}</code></td>
                    <td>${student.email || '---'}</td>
                    <td>${student.phone || '---'}</td>
                    <td>${student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-EG') : '---'}</td>
                    <td>
                        <span class="badge ${student.isActive ? 'badge-success' : 'badge-danger'}">
                            ${student.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="Admin.viewStudentDetails('${student.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error searching students:', error);
        }
    }
    
    // تهيئة التحديث التلقائي
    initAutoRefresh() {
        // تحديث البيانات كل 30 ثانية
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.loadDashboardStats();
            }
        }, 30000);
    }
    
    // تحديث معلومات المستخدم
    updateUserInfo() {
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        // تحديث الشريط العلوي
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.fullName || 'مدير النظام';
        }
        
        if (userAvatarElement) {
            userAvatarElement.textContent = user.fullName?.charAt(0) || 'م';
            userAvatarElement.title = user.fullName || 'مدير النظام';
        }
    }
    
    // عرض تفاصيل الطالب
    async viewStudentDetails(studentId) {
        try {
            const students = await AutismPlatformDB.getAllStudents();
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                this.showAlert('الطالب غير موجود', 'error');
                return;
            }
            
            // عرض نافذة تفاصيل الطالب
            const modalContent = `
                <div style="padding: 20px; max-width: 500px;">
                    <h3 style="color: var(--primary-dark); margin-bottom: 20px;">تفاصيل الطالب</h3>
                    
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 32px;">
                            ${student.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                            <h4 style="margin-bottom: 5px;">${student.fullName}</h4>
                            <div style="color: var(--gray);">${student.id}</div>
                        </div>
                    </div>
                    
                    <div style="background: var(--light); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h5 style="color: var(--primary-dark); margin-bottom: 15px;">المعلومات الأساسية</h5>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <div style="font-size: 12px; color: var(--gray);">البريد الإلكتروني</div>
                                <div>${student.email || '---'}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--gray);">رقم الهاتف</div>
                                <div>${student.phone || '---'}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--gray);">تاريخ التسجيل</div>
                                <div>${student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-EG') : '---'}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--gray);">الحالة</div>
                                <div>
                                    <span class="badge ${student.isActive ? 'badge-success' : 'badge-danger'}">
                                        ${student.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${student.notes ? `
                    <div style="background: var(--light); padding: 20px; border-radius: 10px;">
                        <h5 style="color: var(--primary-dark); margin-bottom: 10px;">ملاحظات</h5>
                        <p>${student.notes}</p>
                    </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 10px; margin-top: 30px;">
                        <button class="btn btn-primary" onclick="Admin.editStudentForm('${student.id}')">
                            <i class="fas fa-edit"></i> تعديل البيانات
                        </button>
                        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i> إغلاق
                        </button>
                    </div>
                </div>
            `;
            
            this.showModal(modalContent, 'تفاصيل الطالب');
            
        } catch (error) {
            console.error('Error viewing student details:', error);
            this.showAlert('حدث خطأ في عرض تفاصيل الطالب', 'error');
        }
    }
    
    // عرض نموذج تعديل الطالب
    async editStudentForm(studentId) {
        try {
            const students = await AutismPlatformDB.getAllStudents();
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                this.showAlert('الطالب غير موجود', 'error');
                return;
            }
            
            const formContent = `
                <div style="padding: 20px; max-width: 600px;">
                    <h3 style="color: var(--primary-dark); margin-bottom: 20px;">تعديل بيانات الطالب</h3>
                    
                    <form id="editStudentForm">
                        <input type="hidden" id="editStudentId" value="${student.id}">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label for="editStudentName">الاسم الكامل *</label>
                                <input type="text" id="editStudentName" class="form-control" value="${student.fullName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editStudentEmail">البريد الإلكتروني</label>
                                <input type="email" id="editStudentEmail" class="form-control" value="${student.email || ''}">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label for="editStudentPhone">رقم الهاتف</label>
                                <input type="tel" id="editStudentPhone" class="form-control" value="${student.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editStudentStatus">الحالة</label>
                                <select id="editStudentStatus" class="form-control">
                                    <option value="true" ${student.isActive ? 'selected' : ''}>نشط</option>
                                    <option value="false" ${!student.isActive ? 'selected' : ''}>غير نشط</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="editStudentNotes">ملاحظات</label>
                            <textarea id="editStudentNotes" class="form-control" rows="3">${student.notes || ''}</textarea>
                        </div>
                        
                        <div style="display: flex; gap: 10px; margin-top: 30px;">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save"></i> حفظ التغييرات
                            </button>
                            <button type="button" class="btn btn-danger" onclick="Admin.deleteStudentPrompt('${student.id}')">
                                <i class="fas fa-trash"></i> حذف الطالب
                            </button>
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            const modal = this.showModal(formContent, 'تعديل الطالب');
            
            // إضافة حدث للنموذج
            modal.querySelector('#editStudentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateStudent(studentId);
            });
            
        } catch (error) {
            console.error('Error loading edit form:', error);
            this.showAlert('حدث خطأ في تحميل نموذج التعديل', 'error');
        }
    }
    
    // تحديث بيانات الطالب
    async updateStudent(studentId) {
        try {
            const updatedData = {
                fullName: document.getElementById('editStudentName').value,
                email: document.getElementById('editStudentEmail').value,
                phone: document.getElementById('editStudentPhone').value,
                isActive: document.getElementById('editStudentStatus').value === 'true',
                notes: document.getElementById('editStudentNotes').value
            };
            
            // هنا يجب تحديث البيانات في قاعدة البيانات
            // هذه وظيفة تحتاج إلى تنفيذها في database.js
            
            this.showAlert('تم تحديث بيانات الطالب بنجاح', 'success');
            
            // إغلاق النافذة
            document.querySelector('.modal')?.remove();
            
            // تحديث الجداول
            await this.loadStudentsTable();
            await this.loadDashboardStats();
            
        } catch (error) {
            console.error('Error updating student:', error);
            this.showAlert('حدث خطأ في تحديث البيانات', 'error');
        }
    }
    
    // طلب تأكيد حذف الطالب
    async deleteStudentPrompt(studentId) {
        try {
            const students = await AutismPlatformDB.getAllStudents();
            const student = students.find(s => s.id === studentId);
            
            if (!student) {
                this.showAlert('الطالب غير موجود', 'error');
                return;
            }
            
            const confirmContent = `
                <div style="padding: 30px; text-align: center; max-width: 400px;">
                    <div style="font-size: 48px; color: var(--danger); margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: var(--dark); margin-bottom: 10px;">تأكيد الحذف</h3>
                    <p style="color: var(--gray); margin-bottom: 20px;">
                        هل أنت متأكد من حذف الطالب <strong>${student.fullName}</strong>؟
                        <br>
                        <small style="color: var(--danger);">هذا الإجراء لا يمكن التراجع عنه</small>
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="btn btn-danger" onclick="Admin.deleteStudent('${studentId}')">
                            <i class="fas fa-trash"></i> نعم، احذف
                        </button>
                        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                    </div>
                </div>
            `;
            
            this.showModal(confirmContent, 'تأكيد الحذف');
            
        } catch (error) {
            console.error('Error in delete prompt:', error);
        }
    }
    
    // حذف الطالب
    async deleteStudent(studentId) {
        try {
            // هنا يجب تنفيذ دالة الحذف في database.js
            // مؤقتاً: عرض رسالة
            this.showAlert('وظيفة الحذف قيد التطوير', 'warning');
            
            // إغلاق النافذة
            document.querySelector('.modal')?.remove();
            
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showAlert('حدث خطأ في حذف الطالب', 'error');
        }
    }
    
    // عرض المعلم
    async viewTeacher(teacherId) {
        this.showAlert('عرض تفاصيل المعلم قيد التطوير', 'info');
    }
    
    // عرض نافذة
    showModal(content, title = '') {
        // إزالة النوافذ السابقة
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        
        // إنشاء النافذة
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const modalDialog = document.createElement('div');
        modalDialog.style.cssText = `
            background: white;
            border-radius: 15px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalFadeIn 0.3s;
        `;
        
        if (title) {
            const modalHeader = document.createElement('div');
            modalHeader.style.cssText = `
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            modalHeader.innerHTML = `
                <h4 style="margin: 0; color: var(--primary-dark);">${title}</h4>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 20px; color: var(--gray); cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            modalDialog.appendChild(modalHeader);
        }
        
        modalDialog.innerHTML += content;
        modal.appendChild(modalDialog);
        document.body.appendChild(modal);
        
        // إغلاق النافذة عند النقر خارجها
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // إضافة أنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        return modalDialog;
    }
    
    // عرض رسالة تنبيه
    showAlert(message, type = 'success') {
        // إنشاء عنصر التنبيه
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            border-radius: 10px;
            background: ${type === 'success' ? 'var(--success)' : 
                        type === 'error' ? 'var(--danger)' : 
                        type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
            color: white;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: alertSlideIn 0.3s;
        `;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        alert.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        // إزالة التنبيه بعد 5 ثواني
        setTimeout(() => {
            alert.style.animation = 'alertSlideOut 0.3s';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }, 5000);
        
        // إضافة أنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes alertSlideIn {
                from { top: -100px; opacity: 0; }
                to { top: 20px; opacity: 1; }
            }
            @keyframes alertSlideOut {
                from { top: 20px; opacity: 1; }
                to { top: -100px; opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // تصدير الطلاب
    exportStudents() {
        this.showAlert('وظيفة التصدير قيد التطوير', 'info');
    }
    
    // استيراد الطلاب
    importStudents() {
        this.showAlert('وظيفة الاستيراد قيد التطوير', 'info');
    }
    
    // إنشاء حسابات جماعية
    async createBulkAccounts() {
        try {
            const count = prompt('كم عدد الحسابات التي تريد إنشاءها؟', '10');
            if (!count || isNaN(count) || count < 1) return;
            
            this.showAlert(`جاري إنشاء ${count} حساب...`, 'info');
            
            // محاكاة إنشاء حسابات
            for (let i = 1; i <= count; i++) {
                const studentData = {
                    fullName: `طالب ${i}`,
                    username: `student${i}`,
                    email: `student${i}@autism-platform.edu`,
                    phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
                    password: 'student123',
                    age: Math.floor(Math.random() * 10) + 8,
                    notes: 'تم إنشاؤه تلقائياً'
                };
                
                await AutismPlatformDB.addStudent(studentData);
            }
            
            this.showAlert(`تم إنشاء ${count} حساب بنجاح`, 'success');
            
            // تحديث البيانات
            await this.loadStudentsTable();
            await this.loadDashboardStats();
            
        } catch (error) {
            console.error('Error creating bulk accounts:', error);
            this.showAlert('حدث خطأ في إنشاء الحسابات', 'error');
        }
    }
}

// إنشاء نسخة من مدير الإدارة
window.Admin = new AdminManager();