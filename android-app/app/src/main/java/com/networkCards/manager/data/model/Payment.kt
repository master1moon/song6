package com.networkCards.manager.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * نموذج بيانات الدفعة
 * يمثل دفعة من عميل/محل
 */
@Parcelize
@Entity(
    tableName = "payments",
    foreignKeys = [
        ForeignKey(
            entity = Store::class,
            parentColumns = ["id"],
            childColumns = ["storeId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["storeId"]),
        Index(value = ["date"]),
        Index(value = ["paymentMethod"]),
        Index(value = ["status"])
    ]
)
data class Payment(
    @PrimaryKey
    val id: String,
    val storeId: String,
    val amount: Double,
    val notes: String? = null,
    val date: Date = Date(),
    
    // تفاصيل الدفع
    val paymentMethod: PaymentMethod = PaymentMethod.CASH,
    val referenceNumber: String? = null, // رقم الشيك أو التحويل
    val bankName: String? = null,
    val accountNumber: String? = null,
    
    // حالة الدفعة
    val status: PaymentStatus = PaymentStatus.COMPLETED,
    val verificationStatus: VerificationStatus = VerificationStatus.VERIFIED,
    
    // تواريخ
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val dueDate: Date? = null, // للشيكات الآجلة
    val clearedDate: Date? = null, // تاريخ الصرف
    
    // معلومات المستخدم
    val createdBy: String? = null,
    val verifiedBy: String? = null,
    
    // معلومات إضافية
    val receiptNumber: String? = null,
    val attachmentPath: String? = null, // مسار صورة الإيصال
    val location: String? = null,
    
    // معلومات الموقع
    val latitude: Double? = null,
    val longitude: Double? = null
) : Parcelable {
    
    /**
     * التحقق من صحة الدفعة
     */
    fun isValid(): Boolean {
        return when {
            storeId.isBlank() -> false
            amount <= 0 -> false
            paymentMethod == PaymentMethod.CHECK && referenceNumber.isNullOrBlank() -> false
            paymentMethod == PaymentMethod.BANK_TRANSFER && bankName.isNullOrBlank() -> false
            else -> true
        }
    }
    
    /**
     * التحقق من استحقاق الدفعة
     */
    fun isOverdue(): Boolean {
        return dueDate?.let { it.before(Date()) } ?: false
    }
    
    /**
     * التحقق من تصريح الدفعة
     */
    fun isCleared(): Boolean {
        return clearedDate != null && 
               (paymentMethod == PaymentMethod.CHECK || paymentMethod == PaymentMethod.BANK_TRANSFER)
    }
    
    /**
     * حساب عدد الأيام حتى الاستحقاق
     */
    fun getDaysUntilDue(): Int? {
        return dueDate?.let {
            val diffInMillis = it.time - Date().time
            (diffInMillis / (1000 * 60 * 60 * 24)).toInt()
        }
    }
    
    /**
     * الحصول على وصف طريقة الدفع
     */
    fun getPaymentMethodDescription(): String {
        return when (paymentMethod) {
            PaymentMethod.CASH -> "نقدي"
            PaymentMethod.CHECK -> "شيك${referenceNumber?.let { " رقم $it" } ?: ""}"
            PaymentMethod.BANK_TRANSFER -> "تحويل بنكي${bankName?.let { " - $it" } ?: ""}"
            PaymentMethod.CREDIT_CARD -> "بطاقة ائتمان"
            PaymentMethod.DIGITAL_WALLET -> "محفظة رقمية"
        }
    }
    
    /**
     * الحصول على لون الحالة
     */
    fun getStatusColor(): Int {
        return when (status) {
            PaymentStatus.COMPLETED -> android.graphics.Color.GREEN
            PaymentStatus.PENDING -> android.graphics.Color.parseColor("#FF9800")
            PaymentStatus.PARTIAL -> android.graphics.Color.BLUE
            PaymentStatus.OVERDUE -> android.graphics.Color.RED
            PaymentStatus.CANCELLED -> android.graphics.Color.GRAY
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
 * طرق الدفع
 */
enum class PaymentMethod(val arabicName: String) {
    CASH("نقدي"),
    CHECK("شيك"),
    BANK_TRANSFER("تحويل بنكي"),
    CREDIT_CARD("بطاقة ائتمان"),
    DIGITAL_WALLET("محفظة رقمية")
}

/**
 * حالة التحقق
 */
enum class VerificationStatus(val arabicName: String) {
    PENDING("في الانتظار"),
    VERIFIED("محقق"),
    REJECTED("مرفوض"),
    REQUIRES_REVIEW("يحتاج مراجعة")
}

/**
 * حالة الدفعة (إضافة للتوضيح)
 */
enum class PaymentStatus(val arabicName: String) {
    PENDING("في الانتظار"),
    PARTIAL("دفع جزئي"),
    COMPLETED("مكتمل"),
    OVERDUE("متأخر"),
    CANCELLED("ملغي")
}