package com.networkCards.manager.data.model

import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * نموذج بيانات الباقة
 * يمثل باقة كروت الشبكة مع أسعارها المختلفة
 */
@Parcelize
@Entity(tableName = "packages")
data class Package(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String? = null,
    
    // الأسعار المختلفة
    val retailPrice: Double? = null,      // سعر التجزئة
    val wholesalePrice: Double? = null,   // سعر الجملة
    val distributorPrice: Double? = null, // سعر الموزعين
    
    // معلومات المنتج
    val barcode: String? = null,
    val category: String? = null,
    val brand: String? = null,
    val model: String? = null,
    
    // معلومات المخزون
    val currentStock: Int = 0,
    val minStockLevel: Int = 100,
    val maxStockLevel: Int = 10000,
    
    // معلومات التكلفة
    val costPrice: Double? = null,
    val supplierName: String? = null,
    val supplierPhone: String? = null,
    
    // تواريخ
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val lastRestockDate: Date? = null,
    
    // إعدادات
    val isActive: Boolean = true,
    val isFeatured: Boolean = false,
    val sortOrder: Int = 0,
    
    // إحصائيات (محسوبة)
    val totalSold: Int = 0,
    val totalRevenue: Double = 0.0,
    val averageSalePrice: Double = 0.0
) : Parcelable {
    
    /**
     * الحصول على السعر حسب نوع العميل
     */
    fun getPriceForType(priceType: PriceType): Double? {
        return when (priceType) {
            PriceType.RETAIL -> retailPrice
            PriceType.WHOLESALE -> wholesalePrice
            PriceType.DISTRIBUTOR -> distributorPrice
        }
    }
    
    /**
     * التحقق من انخفاض المخزون
     */
    fun isLowStock(): Boolean = currentStock <= minStockLevel
    
    /**
     * التحقق من نفاد المخزون
     */
    fun isOutOfStock(): Boolean = currentStock <= 0
    
    /**
     * حساب هامش الربح
     */
    fun calculateProfitMargin(priceType: PriceType): Double? {
        val sellingPrice = getPriceForType(priceType)
        return if (sellingPrice != null && costPrice != null && costPrice > 0) {
            ((sellingPrice - costPrice) / sellingPrice) * 100
        } else null
    }
    
    /**
     * الحصول على حالة المخزون
     */
    fun getStockStatus(): StockStatus {
        return when {
            currentStock <= 0 -> StockStatus.OUT_OF_STOCK
            currentStock <= minStockLevel -> StockStatus.LOW_STOCK
            currentStock >= maxStockLevel -> StockStatus.OVERSTOCK
            else -> StockStatus.NORMAL
        }
    }
    
    /**
     * الحصول على لون حالة المخزون
     */
    fun getStockStatusColor(): Int {
        return when (getStockStatus()) {
            StockStatus.OUT_OF_STOCK -> android.graphics.Color.RED
            StockStatus.LOW_STOCK -> android.graphics.Color.parseColor("#FF9800")
            StockStatus.OVERSTOCK -> android.graphics.Color.parseColor("#9C27B0")
            StockStatus.NORMAL -> android.graphics.Color.GREEN
        }
    }
    
    /**
     * تنسيق عرض المخزون
     */
    fun getFormattedStock(): String {
        return when {
            currentStock <= 0 -> "نفد المخزون"
            currentStock <= minStockLevel -> "$currentStock كرت (منخفض)"
            else -> "$currentStock كرت"
        }
    }
}

/**
 * حالات المخزون
 */
enum class StockStatus(val arabicName: String) {
    NORMAL("طبيعي"),
    LOW_STOCK("منخفض"),
    OUT_OF_STOCK("نفد المخزون"),
    OVERSTOCK("مخزون زائد")
}