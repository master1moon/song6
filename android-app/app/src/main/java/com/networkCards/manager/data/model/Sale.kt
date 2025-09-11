package com.networkCards.manager.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * نموذج بيانات المبيعة
 * يمثل عملية بيع واحدة لمحل معين
 */
@Parcelize
@Entity(
    tableName = "sales",
    foreignKeys = [
        ForeignKey(
            entity = Store::class,
            parentColumns = ["id"],
            childColumns = ["storeId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = Package::class,
            parentColumns = ["id"],
            childColumns = ["packageId"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [
        Index(value = ["storeId"]),
        Index(value = ["packageId"]),
        Index(value = ["date"]),
        Index(value = ["isCustom"])
    ]
)
data class Sale(
    @PrimaryKey
    val id: String,
    val storeId: String,
    val packageId: String? = null, // null للمبيعات المخصصة
    
    // تفاصيل البيع
    val quantity: Int = 0,
    val pricePerUnit: Double = 0.0,
    val total: Double = 0.0,
    
    // للمبيعات المخصصة
    val isCustom: Boolean = false,
    val customReason: String? = null,
    val customAmount: Double = 0.0,
    
    // تفاصيل إضافية
    val notes: String? = null,
    val discount: Double = 0.0,
    val tax: Double = 0.0,
    
    // معلومات التوقيت
    val date: Date = Date(),
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    
    // معلومات المستخدم
    val createdBy: String? = null,
    val updatedBy: String? = null,
    
    // حالة البيع
    val status: SaleStatus = SaleStatus.COMPLETED,
    val paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    
    // معلومات إضافية للتتبع
    val invoiceNumber: String? = null,
    val referenceNumber: String? = null,
    val source: SaleSource = SaleSource.MANUAL,
    
    // معلومات الموقع (اختيارية)
    val latitude: Double? = null,
    val longitude: Double? = null
) : Parcelable {
    
    /**
     * حساب الإجمالي مع الخصم والضريبة
     */
    fun calculateFinalTotal(): Double {
        val subtotal = if (isCustom) customAmount else total
        val afterDiscount = subtotal - discount
        val withTax = afterDiscount + tax
        return maxOf(0.0, withTax)
    }
    
    /**
     * حساب هامش الربح
     */
    fun calculateProfitMargin(costPrice: Double?): Double? {
        if (costPrice == null || costPrice <= 0) return null
        
        val finalTotal = calculateFinalTotal()
        val totalCost = costPrice * quantity
        
        return if (totalCost > 0) {
            ((finalTotal - totalCost) / finalTotal) * 100
        } else null
    }
    
    /**
     * التحقق من صحة البيع
     */
    fun isValid(): Boolean {
        return when {
            storeId.isBlank() -> false
            isCustom && (customReason.isNullOrBlank() || customAmount <= 0) -> false
            !isCustom && (packageId.isNullOrBlank() || quantity <= 0 || pricePerUnit <= 0) -> false
            else -> true
        }
    }
    
    /**
     * الحصول على وصف البيع
     */
    fun getDescription(): String {
        return if (isCustom) {
            customReason ?: "مبيعة مخصصة"
        } else {
            "باقة × $quantity"
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
     * الحصول على أيقونة المصدر
     */
    fun getSourceIcon(): String {
        return when (source) {
            SaleSource.MANUAL -> "✏️"
            SaleSource.BARCODE -> "📷"
            SaleSource.IMPORT -> "📥"
            SaleSource.API -> "🔗"
        }
    }
}

/**
 * حالة البيع
 */
enum class SaleStatus(val arabicName: String) {
    DRAFT("مسودة"),
    COMPLETED("مكتمل"),
    CANCELLED("ملغي"),
    RETURNED("مرتجع")
}

/**
 * حالة الدفع
 */
enum class PaymentStatus(val arabicName: String) {
    PENDING("في الانتظار"),
    PARTIAL("دفع جزئي"),
    PAID("مدفوع"),
    OVERDUE("متأخر")
}

/**
 * مصدر البيع
 */
enum class SaleSource(val arabicName: String) {
    MANUAL("يدوي"),
    BARCODE("مسح ضوئي"),
    IMPORT("مستورد"),
    API("واجهة برمجية")
}