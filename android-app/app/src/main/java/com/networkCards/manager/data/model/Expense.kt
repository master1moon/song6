package com.networkCards.manager.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Index
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * نموذج بيانات المصروف
 * يمثل مصروف من مصروفات العمل
 */
@Parcelize
@Entity(
    tableName = "expenses",
    indices = [
        Index(value = ["type"]),
        Index(value = ["date"]),
        Index(value = ["category"]),
        Index(value = ["isRecurring"])
    ]
)
data class Expense(
    @PrimaryKey
    val id: String,
    val type: String,
    val amount: Double,
    val notes: String? = null,
    val date: Date = Date(),
    
    // تصنيف المصروف
    val category: ExpenseCategory = ExpenseCategory.GENERAL,
    val subcategory: String? = null,
    
    // معلومات إضافية
    val receiptNumber: String? = null,
    val vendorName: String? = null,
    val vendorPhone: String? = null,
    val paymentMethod: PaymentMethod = PaymentMethod.CASH,
    
    // المصروفات المتكررة
    val isRecurring: Boolean = false,
    val recurringFrequency: RecurringFrequency? = null,
    val nextDueDate: Date? = null,
    
    // المرفقات
    val attachmentPath: String? = null,
    val hasReceipt: Boolean = false,
    
    // حالة المصروف
    val status: ExpenseStatus = ExpenseStatus.COMPLETED,
    val approvalStatus: ApprovalStatus = ApprovalStatus.APPROVED,
    
    // تواريخ
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val approvedAt: Date? = null,
    
    // معلومات المستخدم
    val createdBy: String? = null,
    val approvedBy: String? = null,
    
    // معلومات الموقع (للمصروفات الميدانية)
    val latitude: Double? = null,
    val longitude: Double? = null,
    val location: String? = null,
    
    // معلومات ضريبية
    val taxAmount: Double = 0.0,
    val taxRate: Double = 0.0,
    val isDeductible: Boolean = true
) : Parcelable {
    
    /**
     * حساب المبلغ الإجمالي مع الضريبة
     */
    fun getTotalAmount(): Double = amount + taxAmount
    
    /**
     * التحقق من صحة المصروف
     */
    fun isValid(): Boolean {
        return when {
            type.isBlank() -> false
            amount <= 0 -> false
            isRecurring && recurringFrequency == null -> false
            isRecurring && nextDueDate == null -> false
            else -> true
        }
    }
    
    /**
     * التحقق من استحقاق المصروف المتكرر
     */
    fun isDue(): Boolean {
        return isRecurring && nextDueDate?.let { it.before(Date()) } ?: false
    }
    
    /**
     * حساب التاريخ التالي للمصروف المتكرر
     */
    fun calculateNextDueDate(): Date? {
        if (!isRecurring || recurringFrequency == null || nextDueDate == null) {
            return null
        }
        
        val calendar = java.util.Calendar.getInstance()
        calendar.time = nextDueDate
        
        when (recurringFrequency) {
            RecurringFrequency.DAILY -> calendar.add(java.util.Calendar.DAY_OF_MONTH, 1)
            RecurringFrequency.WEEKLY -> calendar.add(java.util.Calendar.WEEK_OF_YEAR, 1)
            RecurringFrequency.MONTHLY -> calendar.add(java.util.Calendar.MONTH, 1)
            RecurringFrequency.QUARTERLY -> calendar.add(java.util.Calendar.MONTH, 3)
            RecurringFrequency.YEARLY -> calendar.add(java.util.Calendar.YEAR, 1)
        }
        
        return calendar.time
    }
    
    /**
     * الحصول على لون الفئة
     */
    fun getCategoryColor(): Int {
        return when (category) {
            ExpenseCategory.RENT -> android.graphics.Color.parseColor("#FF5722")
            ExpenseCategory.UTILITIES -> android.graphics.Color.parseColor("#2196F3")
            ExpenseCategory.SUPPLIES -> android.graphics.Color.parseColor("#4CAF50")
            ExpenseCategory.MARKETING -> android.graphics.Color.parseColor("#E91E63")
            ExpenseCategory.MAINTENANCE -> android.graphics.Color.parseColor("#FF9800")
            ExpenseCategory.TRANSPORTATION -> android.graphics.Color.parseColor("#9C27B0")
            ExpenseCategory.MEALS -> android.graphics.Color.parseColor("#795548")
            ExpenseCategory.GENERAL -> android.graphics.Color.parseColor("#607D8B")
        }
    }
    
    /**
     * الحصول على أيقونة الفئة
     */
    fun getCategoryIcon(): String {
        return when (category) {
            ExpenseCategory.RENT -> "🏠"
            ExpenseCategory.UTILITIES -> "⚡"
            ExpenseCategory.SUPPLIES -> "📦"
            ExpenseCategory.MARKETING -> "📢"
            ExpenseCategory.MAINTENANCE -> "🔧"
            ExpenseCategory.TRANSPORTATION -> "🚗"
            ExpenseCategory.MEALS -> "🍽️"
            ExpenseCategory.GENERAL -> "💼"
        }
    }
    
    /**
     * تنسيق عرض التاريخ
     */
    fun getFormattedDate(): String {
        val formatter = java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale("ar"))
        return formatter.format(date)
    }
    
    /**
     * تنسيق عرض المبلغ
     */
    fun getFormattedAmount(): String {
        val formatter = java.text.NumberFormat.getCurrencyInstance(java.util.Locale("ar", "SA"))
        return formatter.format(amount)
    }
}

/**
 * فئات المصروفات
 */
enum class ExpenseCategory(val arabicName: String) {
    RENT("إيجار"),
    UTILITIES("مرافق"),
    SUPPLIES("مستلزمات"),
    MARKETING("تسويق"),
    MAINTENANCE("صيانة"),
    TRANSPORTATION("مواصلات"),
    MEALS("وجبات"),
    GENERAL("عام")
}

/**
 * تكرار المصروفات
 */
enum class RecurringFrequency(val arabicName: String) {
    DAILY("يومي"),
    WEEKLY("أسبوعي"),
    MONTHLY("شهري"),
    QUARTERLY("ربع سنوي"),
    YEARLY("سنوي")
}

/**
 * حالة المصروف
 */
enum class ExpenseStatus(val arabicName: String) {
    DRAFT("مسودة"),
    PENDING("في الانتظار"),
    COMPLETED("مكتمل"),
    CANCELLED("ملغي")
}

/**
 * حالة الموافقة
 */
enum class ApprovalStatus(val arabicName: String) {
    PENDING("في انتظار الموافقة"),
    APPROVED("موافق عليه"),
    REJECTED("مرفوض"),
    REQUIRES_REVIEW("يحتاج مراجعة")
}