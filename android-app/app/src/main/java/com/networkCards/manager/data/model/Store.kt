package com.networkCards.manager.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * نموذج بيانات المحل
 * يمثل محل أو عميل في النظام
 */
@Parcelize
@Entity(tableName = "stores")
data class Store(
    @PrimaryKey
    val id: String,
    val name: String,
    val phone: String? = null,
    val address: String? = null,
    val notes: String? = null,
    val priceType: PriceType = PriceType.RETAIL,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    
    // إحداثيات الموقع (للميزات المتقدمة)
    val latitude: Double? = null,
    val longitude: Double? = null,
    
    // معلومات إضافية
    val email: String? = null,
    val website: String? = null,
    val contactPerson: String? = null,
    
    // إعدادات خاصة
    val creditLimit: Double = 0.0,
    val isActive: Boolean = true,
    val priority: Int = 0, // 0 = عادي، 1 = مهم، 2 = VIP
    
    // معلومات حسابية (محسوبة)
    val totalSales: Double = 0.0,
    val totalPayments: Double = 0.0,
    val balance: Double = 0.0,
    val lastSaleDate: Date? = null,
    val lastPaymentDate: Date? = null
) : Parcelable {
    
    /**
     * حساب الرصيد الحالي
     */
    fun calculateBalance(): Double = totalSales - totalPayments
    
    /**
     * التحقق من تجاوز حد الائتمان
     */
    fun isOverCreditLimit(): Boolean = balance > creditLimit && creditLimit > 0
    
    /**
     * الحصول على حالة المحل
     */
    fun getStatus(): StoreStatus {
        return when {
            !isActive -> StoreStatus.INACTIVE
            isOverCreditLimit() -> StoreStatus.OVER_LIMIT
            balance > 0 -> StoreStatus.HAS_DEBT
            balance < 0 -> StoreStatus.HAS_CREDIT
            else -> StoreStatus.BALANCED
        }
    }
    
    /**
     * الحصول على لون الحالة
     */
    fun getStatusColor(): Int {
        return when (getStatus()) {
            StoreStatus.INACTIVE -> android.graphics.Color.GRAY
            StoreStatus.OVER_LIMIT -> android.graphics.Color.RED
            StoreStatus.HAS_DEBT -> android.graphics.Color.parseColor("#FF9800") // برتقالي
            StoreStatus.HAS_CREDIT -> android.graphics.Color.GREEN
            StoreStatus.BALANCED -> android.graphics.Color.BLUE
        }
    }
}

/**
 * أنواع الأسعار
 */
enum class PriceType(val arabicName: String) {
    RETAIL("تجزئة"),
    WHOLESALE("جملة"),
    DISTRIBUTOR("موزعين");
    
    companion object {
        fun fromString(value: String): PriceType {
            return values().find { it.name.equals(value, ignoreCase = true) } ?: RETAIL
        }
    }
}

/**
 * حالات المحل
 */
enum class StoreStatus(val arabicName: String) {
    ACTIVE("نشط"),
    INACTIVE("غير نشط"),
    HAS_DEBT("له رصيد"),
    HAS_CREDIT("عليه رصيد"),
    BALANCED("متوازن"),
    OVER_LIMIT("تجاوز الحد")
}