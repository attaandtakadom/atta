<?php
// السماح بالوصول من أي مصدر (لتطوير فقط - في الإنتاج حدد النطاقات المسموحة)
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// تحديد مجلدات الوجهة
$imageDir = '/var/www/html/autism_platfor_html/teacher_dashbord/programs/images/';
$soundDir = '/var/www/html/autism_platfor_html/teacher_dashbord/programs/sound/';

// إنشاء المجلدات إذا لم تكن موجودة
if (!file_exists($imageDir)) {
    mkdir($imageDir, 0777, true);
}

if (!file_exists($soundDir)) {
    mkdir($soundDir, 0777, true);
}

// التحقق من نوع الرفع
$type = $_POST['type'] ?? '';

// تحديد المجلد الهدف
if ($type === 'image') {
    $targetDir = $imageDir;
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $maxFileSize = 10 * 1024 * 1024; // 10MB
} else if ($type === 'sound') {
    $targetDir = $soundDir;
    $allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
    $maxFileSize = 20 * 1024 * 1024; // 20MB
} else {
    echo json_encode([
        'success' => false,
        'message' => 'نوع الملف غير محدد'
    ]);
    exit;
}

// التحقق من وجود ملفات
if (!isset($_FILES['files'])) {
    echo json_encode([
        'success' => false,
        'message' => 'لم يتم رفع أي ملفات'
    ]);
    exit;
}

$uploadedFiles = $_FILES['files'];
$uploadedCount = 0;
$errors = [];

// معالجة كل ملف على حدة
for ($i = 0; $i < count($uploadedFiles['name']); $i++) {
    $fileName = $uploadedFiles['name'][$i];
    $fileTmpName = $uploadedFiles['tmp_name'][$i];
    $fileSize = $uploadedFiles['size'][$i];
    $fileError = $uploadedFiles['error'][$i];
    
    // الحصول على امتداد الملف
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // التحقق من امتداد الملف
    if (!in_array($fileExtension, $allowedExtensions)) {
        $errors[] = "الملف '$fileName' لديه امتداد غير مسموح به. الامتدادات المسموحة: " . implode(', ', $allowedExtensions);
        continue;
    }
    
    // التحقق من حجم الملف
    if ($fileSize > $maxFileSize) {
        $maxSizeMB = $maxFileSize / (1024 * 1024);
        $errors[] = "الملف '$fileName' كبير جداً. الحد الأقصى: $maxSizeMB MB";
        continue;
    }
    
    // التحقق من أخطاء الرفع
    if ($fileError !== UPLOAD_ERR_OK) {
        $errors[] = "حدث خطأ أثناء رفع الملف '$fileName' (خطأ رقم: $fileError)";
        continue;
    }
    
    // إنشاء اسم فريد للملف لتجنب التكرار
    $newFileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $fileName);
    $targetPath = $targetDir . $newFileName;
    
    // نقل الملف إلى المجلد الهدف
    if (move_uploaded_file($fileTmpName, $targetPath)) {
        $uploadedCount++;
        
        // إذا كان الملف صورة، يمكنك هنا إضافة معالجة إضافية مثل تغيير الحجم
        if ($type === 'image') {
            // يمكنك إضافة كود لتغيير حجم الصورة هنا إذا لزم الأمر
        }
    } else {
        $errors[] = "فشل في حفظ الملف '$fileName'";
    }
}

// إعداد الاستجابة
if ($uploadedCount > 0) {
    $response = [
        'success' => true,
        'uploaded_count' => $uploadedCount,
        'total_files' => count($uploadedFiles['name']),
        'message' => "تم رفع $uploadedCount ملف بنجاح"
    ];
    
    if (!empty($errors)) {
        $response['warnings'] = $errors;
    }
} else {
    $response = [
        'success' => false,
        'message' => 'فشل في رفع الملفات: ' . implode(' | ', $errors)
    ];
}

echo json_encode($response);
?>