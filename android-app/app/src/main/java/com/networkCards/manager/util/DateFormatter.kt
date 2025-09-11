package com.networkCards.manager.util

import java.text.SimpleDateFormat
import java.util.*

/**
 * منسق التواريخ
 * يوفر تنسيق موحد للتواريخ باللغة العربية
 */
object DateFormatter {
    
    private val arabicLocale = Locale("ar", "SA")
    
    // منسقات مختلفة للاستخدامات المتنوعة
    private val dateFormatter = SimpleDateFormat("dd/MM/yyyy", arabicLocale)
    private val timeFormatter = SimpleDateFormat("HH:mm", arabicLocale)
    private val dateTimeFormatter = SimpleDateFormat("dd/MM/yyyy HH:mm", arabicLocale)
    private val dayNameFormatter = SimpleDateFormat("EEEE", arabicLocale)
    private val monthYearFormatter = SimpleDateFormat("MMMM yyyy", arabicLocale)
    private val shortDateFormatter = SimpleDateFormat("dd/MM", arabicLocale)
    
    /**
     * تنسيق التاريخ فقط
     */
    fun formatDate(date: Date): String {
        return dateFormatter.format(date)
    }
    
    /**
     * تنسيق الوقت فقط
     */
    fun formatTime(date: Date): String {
        return timeFormatter.format(date)
    }
    
    /**
     * تنسيق التاريخ والوقت
     */
    fun formatDateTime(date: Date): String {
        return dateTimeFormatter.format(date)
    }
    
    /**
     * تنسيق اسم اليوم
     */
    fun formatDayName(date: Date): String {
        return dayNameFormatter.format(date)
    }
    
    /**
     * تنسيق الشهر والسنة
     */
    fun formatMonthYear(date: Date): String {
        return monthYearFormatter.format(date)
    }
    
    /**
     * تنسيق مختصر للتاريخ
     */
    fun formatShortDate(date: Date): String {
        return shortDateFormatter.format(date)
    }
    
    /**
     * تنسيق نسبي (منذ كم من الوقت)
     */
    fun formatRelative(date: Date): String {
        val now = Date()
        val diffInMillis = now.time - date.time
        val diffInSeconds = diffInMillis / 1000
        val diffInMinutes = diffInSeconds / 60
        val diffInHours = diffInMinutes / 60
        val diffInDays = diffInHours / 24
        
        return when {
            diffInSeconds < 60 -> "منذ لحظات"
            diffInMinutes < 60 -> "منذ ${diffInMinutes} دقيقة"
            diffInHours < 24 -> "منذ ${diffInHours} ساعة"
            diffInDays == 1L -> "أمس"
            diffInDays < 7 -> "منذ ${diffInDays} أيام"
            diffInDays < 30 -> "منذ ${diffInDays / 7} أسابيع"
            diffInDays < 365 -> "منذ ${diffInDays / 30} أشهر"
            else -> "منذ ${diffInDays / 365} سنوات"
        }
    }
    
    /**
     * تنسيق ذكي (اليوم، أمس، أو التاريخ)
     */
    fun formatSmart(date: Date): String {
        val calendar = Calendar.getInstance()
        val today = calendar.time
        
        calendar.add(Calendar.DAY_OF_MONTH, -1)
        val yesterday = calendar.time
        
        return when {
            isSameDay(date, today) -> "اليوم ${formatTime(date)}"
            isSameDay(date, yesterday) -> "أمس ${formatTime(date)}"
            else -> formatDate(date)
        }
    }
    
    /**
     * التحقق من كون التاريخين في نفس اليوم
     */
    fun isSameDay(date1: Date, date2: Date): Boolean {
        val cal1 = Calendar.getInstance().apply { time = date1 }
        val cal2 = Calendar.getInstance().apply { time = date2 }
        
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
    }
    
    /**
     * الحصول على بداية اليوم
     */
    fun getStartOfDay(date: Date = Date()): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.time
    }
    
    /**
     * الحصول على نهاية اليوم
     */
    fun getEndOfDay(date: Date = Date()): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.set(Calendar.HOUR_OF_DAY, 23)
        calendar.set(Calendar.MINUTE, 59)
        calendar.set(Calendar.SECOND, 59)
        calendar.set(Calendar.MILLISECOND, 999)
        return calendar.time
    }
    
    /**
     * الحصول على بداية الأسبوع
     */
    fun getStartOfWeek(date: Date = Date()): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY) // السبت بداية الأسبوع
        return getStartOfDay(calendar.time)
    }
    
    /**
     * الحصول على بداية الشهر
     */
    fun getStartOfMonth(date: Date = Date()): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.set(Calendar.DAY_OF_MONTH, 1)
        return getStartOfDay(calendar.time)
    }
    
    /**
     * الحصول على بداية السنة
     */
    fun getStartOfYear(date: Date = Date()): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.set(Calendar.DAY_OF_YEAR, 1)
        return getStartOfDay(calendar.time)
    }
    
    /**
     * تحليل نص التاريخ
     */
    fun parseDate(dateText: String): Date? {
        val formatters = listOf(
            SimpleDateFormat("dd/MM/yyyy", arabicLocale),
            SimpleDateFormat("yyyy-MM-dd", arabicLocale),
            SimpleDateFormat("dd-MM-yyyy", arabicLocale),
            SimpleDateFormat("dd/MM/yyyy HH:mm", arabicLocale)
        )
        
        for (formatter in formatters) {
            try {
                return formatter.parse(dateText)
            } catch (e: Exception) {
                // تجربة المنسق التالي
            }
        }
        
        return null
    }
    
    /**
     * التحقق من صحة نص التاريخ
     */
    fun isValidDate(dateText: String): Boolean {
        return parseDate(dateText) != null
    }
    
    /**
     * حساب عدد الأيام بين تاريخين
     */
    fun daysBetween(startDate: Date, endDate: Date): Long {
        val diffInMillis = endDate.time - startDate.time
        return diffInMillis / (1000 * 60 * 60 * 24)
    }
    
    /**
     * إضافة أيام لتاريخ
     */
    fun addDays(date: Date, days: Int): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.add(Calendar.DAY_OF_MONTH, days)
        return calendar.time
    }
    
    /**
     * إضافة أشهر لتاريخ
     */
    fun addMonths(date: Date, months: Int): Date {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.add(Calendar.MONTH, months)
        return calendar.time
    }
}