package com.networkCards.manager.data.database.dao

import androidx.room.*
import androidx.lifecycle.LiveData
import com.networkCards.manager.data.model.Sale
import com.networkCards.manager.data.model.SaleStatus
import com.networkCards.manager.data.model.PaymentStatus
import kotlinx.coroutines.flow.Flow
import java.util.Date

/**
 * DAO للمبيعات
 * يوفر عمليات قاعدة البيانات للمبيعات
 */
@Dao
interface SaleDao {
    
    /**
     * الحصول على جميع المبيعات
     */
    @Query("SELECT * FROM sales ORDER BY date DESC")
    fun getAllSales(): Flow<List<Sale>>
    
    /**
     * الحصول على جميع المبيعات كقائمة
     */
    @Query("SELECT * FROM sales ORDER BY date DESC")
    suspend fun getAllSalesList(): List<Sale>
    
    /**
     * الحصول على بيع بالمعرف
     */
    @Query("SELECT * FROM sales WHERE id = :saleId")
    suspend fun getSaleById(saleId: String): Sale?
    
    /**
     * الحصول على مبيعات محل معين
     */
    @Query("SELECT * FROM sales WHERE storeId = :storeId ORDER BY date DESC")
    fun getSalesByStore(storeId: String): Flow<List<Sale>>
    
    /**
     * الحصول على مبيعات باقة معينة
     */
    @Query("SELECT * FROM sales WHERE packageId = :packageId AND isCustom = 0 ORDER BY date DESC")
    suspend fun getSalesByPackage(packageId: String): List<Sale>
    
    /**
     * الحصول على المبيعات في فترة معينة
     */
    @Query("SELECT * FROM sales WHERE date BETWEEN :fromDate AND :toDate ORDER BY date DESC")
    suspend fun getSalesInPeriod(fromDate: Date, toDate: Date): List<Sale>
    
    /**
     * الحصول على المبيعات اليوم
     */
    @Query("""
        SELECT * FROM sales 
        WHERE date >= date('now', 'start of day') 
        ORDER BY date DESC
    """)
    suspend fun getTodaySales(): List<Sale>
    
    /**
     * الحصول على المبيعات هذا الأسبوع
     */
    @Query("""
        SELECT * FROM sales 
        WHERE date >= date('now', 'weekday 0', '-6 days') 
        ORDER BY date DESC
    """)
    suspend fun getThisWeekSales(): List<Sale>
    
    /**
     * الحصول على المبيعات هذا الشهر
     */
    @Query("""
        SELECT * FROM sales 
        WHERE date >= date('now', 'start of month') 
        ORDER BY date DESC
    """)
    suspend fun getThisMonthSales(): List<Sale>
    
    /**
     * الحصول على أحدث المبيعات
     */
    @Query("SELECT * FROM sales ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentSales(limit: Int = 10): List<Sale>
    
    /**
     * الحصول على المبيعات المخصصة
     */
    @Query("SELECT * FROM sales WHERE isCustom = 1 ORDER BY date DESC")
    suspend fun getCustomSales(): List<Sale>
    
    /**
     * الحصول على إحصائيات المبيعات
     */
    @Query("""
        SELECT 
            COUNT(*) as totalSales,
            COUNT(CASE WHEN isCustom = 0 THEN 1 END) as packageSales,
            COUNT(CASE WHEN isCustom = 1 THEN 1 END) as customSales,
            SUM(total) as totalRevenue,
            SUM(CASE WHEN isCustom = 0 THEN quantity ELSE 0 END) as totalQuantitySold,
            AVG(total) as averageSaleValue,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedSales,
            COUNT(CASE WHEN paymentStatus = 'PENDING' THEN 1 END) as pendingPayments
        FROM sales
    """)
    suspend fun getSalesStatistics(): SalesStatistics
    
    /**
     * الحصول على إحصائيات المبيعات لفترة
     */
    @Query("""
        SELECT 
            COUNT(*) as totalSales,
            SUM(total) as totalRevenue,
            SUM(CASE WHEN isCustom = 0 THEN quantity ELSE 0 END) as totalQuantitySold,
            AVG(total) as averageSaleValue
        FROM sales 
        WHERE date BETWEEN :fromDate AND :toDate
    """)
    suspend fun getSalesStatisticsForPeriod(fromDate: Date, toDate: Date): SalesStatistics
    
    /**
     * الحصول على مبيعات محل في فترة
     */
    @Query("""
        SELECT * FROM sales 
        WHERE storeId = :storeId 
        AND date BETWEEN :fromDate AND :toDate 
        ORDER BY date DESC
    """)
    suspend fun getStoreSalesInPeriod(storeId: String, fromDate: Date, toDate: Date): List<Sale>
    
    /**
     * حساب إجمالي مبيعات محل
     */
    @Query("SELECT COALESCE(SUM(total), 0) FROM sales WHERE storeId = :storeId")
    suspend fun getTotalSalesForStore(storeId: String): Double
    
    /**
     * حساب إجمالي مبيعات باقة
     */
    @Query("SELECT COALESCE(SUM(total), 0) FROM sales WHERE packageId = :packageId AND isCustom = 0")
    suspend fun getTotalSalesForPackage(packageId: String): Double
    
    /**
     * إدراج بيع جديد
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSale(sale: Sale): Long
    
    /**
     * إدراج عدة مبيعات
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSales(sales: List<Sale>): List<Long>
    
    /**
     * تحديث بيع
     */
    @Update
    suspend fun updateSale(sale: Sale): Int
    
    /**
     * تحديث حالة الدفع
     */
    @Query("UPDATE sales SET paymentStatus = :paymentStatus, updatedAt = :updatedAt WHERE id = :saleId")
    suspend fun updatePaymentStatus(saleId: String, paymentStatus: PaymentStatus, updatedAt: Date = Date()): Int
    
    /**
     * تحديث حالة البيع
     */
    @Query("UPDATE sales SET status = :status, updatedAt = :updatedAt WHERE id = :saleId")
    suspend fun updateSaleStatus(saleId: String, status: SaleStatus, updatedAt: Date = Date()): Int
    
    /**
     * حذف بيع
     */
    @Delete
    suspend fun deleteSale(sale: Sale): Int
    
    /**
     * حذف بيع بالمعرف
     */
    @Query("DELETE FROM sales WHERE id = :saleId")
    suspend fun deleteSaleById(saleId: String): Int
    
    /**
     * حذف مبيعات محل معين
     */
    @Query("DELETE FROM sales WHERE storeId = :storeId")
    suspend fun deleteSalesByStore(storeId: String): Int
    
    /**
     * عدد المبيعات
     */
    @Query("SELECT COUNT(*) FROM sales")
    suspend fun getSalesCount(): Int
    
    /**
     * عدد مبيعات اليوم
     */
    @Query("SELECT COUNT(*) FROM sales WHERE date >= date('now', 'start of day')")
    suspend fun getTodaySalesCount(): Int
    
    /**
     * البحث المتقدم في المبيعات
     */
    @Query("""
        SELECT s.* FROM sales s
        LEFT JOIN stores st ON s.storeId = st.id
        LEFT JOIN packages p ON s.packageId = p.id
        WHERE (:query IS NULL OR 
               st.name LIKE '%' || :query || '%' OR
               p.name LIKE '%' || :query || '%' OR
               s.customReason LIKE '%' || :query || '%' OR
               s.notes LIKE '%' || :query || '%')
        AND (:storeId IS NULL OR s.storeId = :storeId)
        AND (:packageId IS NULL OR s.packageId = :packageId)
        AND (:isCustom IS NULL OR s.isCustom = :isCustom)
        AND (:status IS NULL OR s.status = :status)
        AND (:fromDate IS NULL OR s.date >= :fromDate)
        AND (:toDate IS NULL OR s.date <= :toDate)
        ORDER BY s.date DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun searchSalesAdvanced(
        query: String? = null,
        storeId: String? = null,
        packageId: String? = null,
        isCustom: Boolean? = null,
        status: SaleStatus? = null,
        fromDate: Date? = null,
        toDate: Date? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<Sale>
    
    /**
     * الحصول على المبيعات غير المتزامنة
     */
    @Query("SELECT * FROM sales WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedSales(): List<Sale>
    
    /**
     * عدد المبيعات غير المتزامنة
     */
    @Query("SELECT COUNT(*) FROM sales WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedSalesCount(): Int
    
    /**
     * تحديد بيع كمتزامن
     */
    @Query("UPDATE sales SET lastSyncTime = :syncTime WHERE id = :saleId")
    suspend fun markAsSynced(saleId: String, syncTime: Date = Date()): Int
}

/**
 * إحصائيات المبيعات
 */
data class SalesStatistics(
    val totalSales: Int,
    val packageSales: Int,
    val customSales: Int,
    val totalRevenue: Double,
    val totalQuantitySold: Int,
    val averageSaleValue: Double,
    val completedSales: Int,
    val pendingPayments: Int
)