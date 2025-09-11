package com.networkCards.manager.util

import android.util.Patterns
import java.util.regex.Pattern

/**
 * أداة التحقق من صحة البيانات
 * تحتوي على دوال للتحقق من صحة المدخلات المختلفة
 */
object ValidationUtil {
    
    // أنماط التحقق
    private val PHONE_PATTERN = Pattern.compile("^(\\+966|966|0)?[5][0-9]{8}$")
    private val SAUDI_PHONE_PATTERN = Pattern.compile("^(\\+966|0)?5[0-9]{8}$")
    private val BARCODE_PATTERN = Pattern.compile("^[0-9]{8,18}$")
    private val ARABIC_NAME_PATTERN = Pattern.compile("^[\\u0600-\\u06FF\\u0750-\\u077F\\s\\d\\-_()]+$")
    
    /**
     * التحقق من صحة البريد الإلكتروني
     */
    fun isValidEmail(email: String): Boolean {
        return email.isNotBlank() && Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    /**
     * التحقق من صحة رقم الهاتف السعودي
     */
    fun isValidPhoneNumber(phone: String): Boolean {
        val cleanPhone = phone.replace("\\s".toRegex(), "").replace("-", "")
        return SAUDI_PHONE_PATTERN.matcher(cleanPhone).matches()
    }
    
    /**
     * التحقق من صحة رقم الهاتف العام
     */
    fun isValidPhoneNumberGeneral(phone: String): Boolean {
        val cleanPhone = phone.replace("\\s".toRegex(), "").replace("-", "")
        return PHONE_PATTERN.matcher(cleanPhone).matches() || 
               cleanPhone.length in 7..15 && cleanPhone.all { it.isDigit() || it in "+()-" }
    }
    
    /**
     * التحقق من صحة رابط الموقع
     */
    fun isValidUrl(url: String): Boolean {
        return url.isNotBlank() && (
            Patterns.WEB_URL.matcher(url).matches() ||
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("www.")
        )
    }
    
    /**
     * التحقق من صحة الباركود
     */
    fun isValidBarcode(barcode: String): Boolean {
        return barcode.isNotBlank() && BARCODE_PATTERN.matcher(barcode).matches()
    }
    
    /**
     * التحقق من صحة الاسم العربي
     */
    fun isValidArabicName(name: String): Boolean {
        return name.isNotBlank() && 
               name.length >= 2 && 
               name.length <= 100 &&
               ARABIC_NAME_PATTERN.matcher(name).matches()
    }
    
    /**
     * التحقق من صحة المبلغ المالي
     */
    fun isValidAmount(amount: String): Boolean {
        val numericAmount = amount.toDoubleOrNull()
        return numericAmount != null && numericAmount >= 0 && numericAmount <= 1_000_000
    }
    
    /**
     * التحقق من صحة الكمية
     */
    fun isValidQuantity(quantity: String): Boolean {
        val numericQuantity = quantity.toIntOrNull()
        return numericQuantity != null && numericQuantity > 0 && numericQuantity <= 100_000
    }
    
    /**
     * التحقق من صحة النسبة المئوية
     */
    fun isValidPercentage(percentage: String): Boolean {
        val numericPercentage = percentage.toDoubleOrNull()
        return numericPercentage != null && numericPercentage >= 0 && numericPercentage <= 100
    }
    
    /**
     * التحقق من قوة كلمة المرور
     */
    fun isValidPassword(password: String): Boolean {
        return password.length >= 6 && 
               password.any { it.isDigit() } &&
               password.any { it.isLetter() }
    }
    
    /**
     * التحقق من صحة معرف المستخدم
     */
    fun isValidUsername(username: String): Boolean {
        return username.isNotBlank() &&
               username.length >= 3 &&
               username.length <= 50 &&
               username.all { it.isLetterOrDigit() || it in "_-." }
    }
    
    /**
     * تنظيف رقم الهاتف
     */
    fun cleanPhoneNumber(phone: String): String {
        var cleaned = phone.replace("\\s".toRegex(), "").replace("-", "").replace("(", "").replace(")", "")
        
        // تحويل الأرقام العربية للإنجليزية
        cleaned = cleaned.replace("٠", "0")
            .replace("١", "1")
            .replace("٢", "2")
            .replace("٣", "3")
            .replace("٤", "4")
            .replace("٥", "5")
            .replace("٦", "6")
            .replace("٧", "7")
            .replace("٨", "8")
            .replace("٩", "9")
        
        // إضافة رمز البلد إذا لم يكن موجوداً
        if (cleaned.startsWith("5") && cleaned.length == 9) {
            cleaned = "966$cleaned"
        } else if (cleaned.startsWith("05")) {
            cleaned = cleaned.substring(1)
            cleaned = "966$cleaned"
        }
        
        return cleaned
    }
    
    /**
     * تنسيق رقم الهاتف للعرض
     */
    fun formatPhoneNumber(phone: String): String {
        val cleaned = cleanPhoneNumber(phone)
        
        return when {
            cleaned.startsWith("966") && cleaned.length == 12 -> {
                "+966 ${cleaned.substring(3, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}"
            }
            cleaned.length == 9 && cleaned.startsWith("5") -> {
                "0${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}"
            }
            else -> phone
        }
    }
    
    /**
     * التحقق من صحة التاريخ
     */
    fun isValidDate(dateString: String): Boolean {
        return try {
            DateFormatter.parseDate(dateString) != null
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * التحقق من صحة نطاق التواريخ
     */
    fun isValidDateRange(fromDate: String, toDate: String): Boolean {
        val from = DateFormatter.parseDate(fromDate)
        val to = DateFormatter.parseDate(toDate)
        
        return from != null && to != null && !from.after(to)
    }
    
    /**
     * تنظيف النص من المحارف الخاصة
     */
    fun sanitizeText(text: String): String {
        return text.trim()
            .replace(Regex("[<>\"'&]"), "") // إزالة محارف HTML خطيرة
            .replace(Regex("\\s+"), " ") // توحيد المسافات
    }
    
    /**
     * التحقق من طول النص
     */
    fun isValidTextLength(text: String, minLength: Int = 0, maxLength: Int = Int.MAX_VALUE): Boolean {
        val trimmedText = text.trim()
        return trimmedText.length >= minLength && trimmedText.length <= maxLength
    }
    
    /**
     * التحقق من صحة المعرف الفريد
     */
    fun isValidId(id: String): Boolean {
        return id.isNotBlank() && 
               id.length >= 3 && 
               id.length <= 50 &&
               id.all { it.isLetterOrDigit() || it in "_-" }
    }
    
    /**
     * التحقق من صحة إحداثيات GPS
     */
    fun isValidLatitude(latitude: Double): Boolean {
        return latitude >= -90.0 && latitude <= 90.0
    }
    
    fun isValidLongitude(longitude: Double): Boolean {
        return longitude >= -180.0 && longitude <= 180.0
    }
    
    /**
     * التحقق من صحة إحداثيات GPS كنص
     */
    fun isValidCoordinates(latitude: String, longitude: String): Boolean {
        val lat = latitude.toDoubleOrNull()
        val lng = longitude.toDoubleOrNull()
        
        return lat != null && lng != null && 
               isValidLatitude(lat) && isValidLongitude(lng)
    }
    
    /**
     * الحصول على رسالة خطأ التحقق
     */
    fun getValidationErrorMessage(field: String, value: String, validationType: ValidationType): String {
        return when (validationType) {
            ValidationType.REQUIRED -> "حقل $field مطلوب"
            ValidationType.INVALID_FORMAT -> "تنسيق $field غير صحيح"
            ValidationType.TOO_SHORT -> "حقل $field قصير جداً"
            ValidationType.TOO_LONG -> "حقل $field طويل جداً"
            ValidationType.INVALID_RANGE -> "قيمة $field خارج النطاق المسموح"
            ValidationType.ALREADY_EXISTS -> "قيمة $field موجودة مسبقاً"
            ValidationType.INVALID_CHARACTERS -> "حقل $field يحتوي على محارف غير مسموحة"
        }
    }
}

/**
 * أنواع التحقق من الصحة
 */
enum class ValidationType {
    REQUIRED,
    INVALID_FORMAT,
    TOO_SHORT,
    TOO_LONG,
    INVALID_RANGE,
    ALREADY_EXISTS,
    INVALID_CHARACTERS
}