package com.networkCards.manager.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * نموذج بيانات المخزون
 * يمثل حركة المخزون للباقات
 */
@Parcelize
@Entity(
    tableName = "inventory",
    foreignKeys = [
        ForeignKey(
            entity = Package::class,
            parentColumns = ["id"],
            childColumns = ["packageId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["packageId"]),
        Index(value = ["date"]),
        Index(value = ["operationType"]),
        Index(value = ["batchNumber"])
    ]
)
data class Inventory(
    @PrimaryKey
    val id: String,
    val packageId: String,
    val quantity: Int,
    val operationType: InventoryOperationType = InventoryOperationType.ADD,
    
    // تفاصيل العملية
    val notes: String? = null,
    val reason: String? = null,
    val referenceNumber: String? = null,
    
    // معلومات الدفعة/اللوت
    val batchNumber: String? = null,
    val expiryDate: Date? = null,
    val manufacturingDate: Date? = null,
    val supplierBatch: String? = null,
    
    // تفاصيل التكلفة
    val unitCost: Double? = null,
    val totalCost: Double? = null,
    val supplierName: String? = null,
    val supplierInvoice: String? = null,
    
    // تواريخ
    val date: Date = Date(),
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    
    // معلومات المستخدم
    val createdBy: String? = null,
    val approvedBy: String? = null,
    
    // حالة العملية
    val status: InventoryStatus = InventoryStatus.COMPLETED,
    val verificationStatus: VerificationStatus = VerificationStatus.VERIFIED,
    
    // معلومات الموقع (للمستودعات المتعددة)
    val warehouseLocation: String? = null,
    val shelfLocation: String? = null,
    
    // معلومات إضافية
    val qualityCheck: Boolean = true,
    val damageReport: String? = null,
    val photos: String? = null, // مسارات الصور مفصولة بفاصلة
    
    // ربط بالمبيعات (للخصم التلقائي)
    val relatedSaleId: String? = null,
    val relatedPurchaseId: String? = null
) : Parcelable {
    
    /**
     * التحقق من صحة حركة المخزون
     */
    fun isValid(): Boolean {
        return when {
            packageId.isBlank() -> false
            quantity == 0 -> false
            operationType == InventoryOperationType.ADD && quantity < 0 -> false
            operationType == InventoryOperationType.REMOVE && quantity > 0 -> false
            unitCost != null && unitCost < 0 -> false
            totalCost != null && totalCost < 0 -> false
            else -> true
        }
    }
    
    /**
     * حساب التكلفة الإجمالية
     */
    fun calculateTotalCost(): Double? {
        return unitCost?.let { cost ->
            cost * Math.abs(quantity)
        }
    }
    
    /**
     * التحقق من انتهاء الصلاحية
     */
    fun isExpired(): Boolean {
        return expiryDate?.let { it.before(Date()) } ?: false
    }
    
    /**
     * التحقق من قرب انتهاء الصلاحية
     */
    fun isNearExpiry(daysThreshold: Int = 30): Boolean {
        return expiryDate?.let { expiry ->
            val calendar = java.util.Calendar.getInstance()
            calendar.add(java.util.Calendar.DAY_OF_MONTH, daysThreshold)
            expiry.before(calendar.time)
        } ?: false
    }
    
    /**
     * الحصول على وصف العملية
     */
    fun getOperationDescription(): String {
        val quantityText = Math.abs(quantity).toString()
        val operation = operationType.arabicName
        
        return "$operation $quantityText كرت${reason?.let { " - $it" } ?: ""}"
    }
    
    /**
     * الحصول على لون نوع العملية
     */
    fun getOperationColor(): Int {
        return when (operationType) {
            InventoryOperationType.ADD -> android.graphics.Color.GREEN
            InventoryOperationType.REMOVE -> android.graphics.Color.RED
            InventoryOperationType.TRANSFER -> android.graphics.Color.BLUE
            InventoryOperationType.ADJUSTMENT -> android.graphics.Color.parseColor("#FF9800")
            InventoryOperationType.DAMAGE -> android.graphics.Color.parseColor("#E91E63")
            InventoryOperationType.RETURN -> android.graphics.Color.parseColor("#9C27B0")
        }
    }
    
    /**
     * الحصول على أيقونة نوع العملية
     */
    fun getOperationIcon(): String {
        return when (operationType) {
            InventoryOperationType.ADD -> "➕"
            InventoryOperationType.REMOVE -> "➖"
            InventoryOperationType.TRANSFER -> "🔄"
            InventoryOperationType.ADJUSTMENT -> "⚖️"
            InventoryOperationType.DAMAGE -> "💥"
            InventoryOperationType.RETURN -> "↩️"
        }
    }
    
    /**
     * تنسيق عرض التاريخ
     */
    fun getFormattedDate(): String {
        val formatter = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", java.util.Locale("ar"))
        return formatter.format(date)
    }
    
    /**
     * تنسيق عرض التكلفة
     */
    fun getFormattedCost(): String? {
        return totalCost?.let { cost ->
            val formatter = java.text.NumberFormat.getCurrencyInstance(java.util.Locale("ar", "SA"))
            formatter.format(cost)
        }
    }
}

/**
 * أنواع عمليات المخزون
 */
enum class InventoryOperationType(val arabicName: String) {
    ADD("إضافة"),
    REMOVE("خصم"),
    TRANSFER("نقل"),
    ADJUSTMENT("تعديل"),
    DAMAGE("تلف"),
    RETURN("إرجاع")
}

/**
 * حالة المخزون
 */
enum class InventoryStatus(val arabicName: String) {
    PENDING("في الانتظار"),
    COMPLETED("مكتمل"),
    CANCELLED("ملغي"),
    VERIFIED("محقق")
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