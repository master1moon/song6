package com.networkCards.manager.data.database.dao

import androidx.room.*
import androidx.lifecycle.LiveData
import com.networkCards.manager.data.model.Payment
import com.networkCards.manager.data.model.PaymentMethod
import com.networkCards.manager.data.model.PaymentStatus
import kotlinx.coroutines.flow.Flow
import java.util.Date

/**
 * DAO للمدفوعات
 * يوفر عمليات قاعدة البيانات للمدفوعات
 */
@Dao
interface PaymentDao {
    
    /**
     * الحصول على جميع المدفوعات
     */
    @Query("SELECT * FROM payments ORDER BY date DESC")
    fun getAllPayments(): Flow<List<Payment>>
    
    /**
     * الحصول على جميع المدفوعات كقائمة
     */
    @Query("SELECT * FROM payments ORDER BY date DESC")
    suspend fun getAllPaymentsList(): List<Payment>
    
    /**
     * الحصول على دفعة بالمعرف
     */
    @Query("SELECT * FROM payments WHERE id = :paymentId")
    suspend fun getPaymentById(paymentId: String): Payment?
    
    /**
     * الحصول على مدفوعات محل معين
     */
    @Query("SELECT * FROM payments WHERE storeId = :storeId ORDER BY date DESC")
    fun getPaymentsByStore(storeId: String): Flow<List<Payment>>
    
    /**
     * الحصول على مدفوعات محل معين كقائمة
     */
    @Query("SELECT * FROM payments WHERE storeId = :storeId ORDER BY date DESC")
    suspend fun getPaymentsByStoreList(storeId: String): List<Payment>
    
    /**
     * الحصول على المدفوعات في فترة معينة
     */
    @Query("SELECT * FROM payments WHERE date BETWEEN :fromDate AND :toDate ORDER BY date DESC")
    suspend fun getPaymentsInPeriod(fromDate: Date, toDate: Date): List<Payment>
    
    /**
     * الحصول على مدفوعات اليوم
     */
    @Query("""
        SELECT * FROM payments 
        WHERE date >= date('now', 'start of day') 
        ORDER BY date DESC
    """)
    suspend fun getTodayPayments(): List<Payment>
    
    /**
     * الحصول على مدفوعات هذا الأسبوع
     */
    @Query("""
        SELECT * FROM payments 
        WHERE date >= date('now', 'weekday 0', '-6 days') 
        ORDER BY date DESC
    """)
    suspend fun getThisWeekPayments(): List<Payment>
    
    /**
     * الحصول على مدفوعات هذا الشهر
     */
    @Query("""
        SELECT * FROM payments 
        WHERE date >= date('now', 'start of month') 
        ORDER BY date DESC
    """)
    suspend fun getThisMonthPayments(): List<Payment>
    
    /**
     * الحصول على أحدث المدفوعات
     */
    @Query("SELECT * FROM payments ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentPayments(limit: Int = 10): List<Payment>
    
    /**
     * الحصول على المدفوعات المعلقة
     */
    @Query("SELECT * FROM payments WHERE status = 'PENDING' ORDER BY date ASC")
    suspend fun getPendingPayments(): List<Payment>
    
    /**
     * الحصول على المدفوعات المتأخرة
     */
    @Query("SELECT * FROM payments WHERE dueDate < :currentDate AND status != 'COMPLETED' ORDER BY dueDate ASC")
    suspend fun getOverduePayments(currentDate: Date = Date()): List<Payment>
    
    /**
     * الحصول على المدفوعات حسب طريقة الدفع
     */
    @Query("SELECT * FROM payments WHERE paymentMethod = :paymentMethod ORDER BY date DESC")
    suspend fun getPaymentsByMethod(paymentMethod: PaymentMethod): List<Payment>
    
    /**
     * الحصول على إحصائيات المدفوعات
     */
    @Query("""
        SELECT 
            COUNT(*) as totalPayments,
            SUM(amount) as totalAmount,
            AVG(amount) as averageAmount,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedPayments,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingPayments,
            COUNT(CASE WHEN dueDate < date('now') AND status != 'COMPLETED' THEN 1 END) as overduePayments,
            MAX(amount) as largestPayment,
            MIN(amount) as smallestPayment
        FROM payments
    """)
    suspend fun getPaymentStatistics(): PaymentStatistics
    
    /**
     * الحصول على إحصائيات المدفوعات لفترة
     */
    @Query("""
        SELECT 
            COUNT(*) as totalPayments,
            SUM(amount) as totalAmount,
            AVG(amount) as averageAmount
        FROM payments 
        WHERE date BETWEEN :fromDate AND :toDate
    """)
    suspend fun getPaymentStatisticsForPeriod(fromDate: Date, toDate: Date): PaymentStatistics
    
    /**
     * حساب إجمالي مدفوعات محل
     */
    @Query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE storeId = :storeId AND status = 'COMPLETED'")
    suspend fun getTotalPaymentsForStore(storeId: String): Double
    
    /**
     * حساب إجمالي المدفوعات لفترة
     */
    @Query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE date BETWEEN :fromDate AND :toDate AND status = 'COMPLETED'")
    suspend fun getTotalPaymentsForPeriod(fromDate: Date, toDate: Date): Double
    
    /**
     * إدراج دفعة جديدة
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayment(payment: Payment): Long
    
    /**
     * إدراج عدة مدفوعات
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayments(payments: List<Payment>): List<Long>
    
    /**
     * تحديث دفعة
     */
    @Update
    suspend fun updatePayment(payment: Payment): Int
    
    /**
     * تحديث حالة الدفعة
     */
    @Query("UPDATE payments SET status = :status, updatedAt = :updatedAt WHERE id = :paymentId")
    suspend fun updatePaymentStatus(paymentId: String, status: PaymentStatus, updatedAt: Date = Date()): Int
    
    /**
     * تحديث تاريخ التصريح
     */
    @Query("UPDATE payments SET clearedDate = :clearedDate, status = 'COMPLETED', updatedAt = :updatedAt WHERE id = :paymentId")
    suspend fun markAsCleared(paymentId: String, clearedDate: Date = Date(), updatedAt: Date = Date()): Int
    
    /**
     * حذف دفعة
     */
    @Delete
    suspend fun deletePayment(payment: Payment): Int
    
    /**
     * حذف دفعة بالمعرف
     */
    @Query("DELETE FROM payments WHERE id = :paymentId")
    suspend fun deletePaymentById(paymentId: String): Int
    
    /**
     * حذف مدفوعات محل معين
     */
    @Query("DELETE FROM payments WHERE storeId = :storeId")
    suspend fun deletePaymentsByStore(storeId: String): Int
    
    /**
     * عدد المدفوعات
     */
    @Query("SELECT COUNT(*) FROM payments")
    suspend fun getPaymentsCount(): Int
    
    /**
     * عدد مدفوعات اليوم
     */
    @Query("SELECT COUNT(*) FROM payments WHERE date >= date('now', 'start of day')")
    suspend fun getTodayPaymentsCount(): Int
    
    /**
     * البحث المتقدم في المدفوعات
     */
    @Query("""
        SELECT p.* FROM payments p
        LEFT JOIN stores s ON p.storeId = s.id
        WHERE (:query IS NULL OR 
               s.name LIKE '%' || :query || '%' OR
               p.notes LIKE '%' || :query || '%' OR
               p.referenceNumber LIKE '%' || :query || '%')
        AND (:storeId IS NULL OR p.storeId = :storeId)
        AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
        AND (:status IS NULL OR p.status = :status)
        AND (:fromDate IS NULL OR p.date >= :fromDate)
        AND (:toDate IS NULL OR p.date <= :toDate)
        ORDER BY p.date DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun searchPaymentsAdvanced(
        query: String? = null,
        storeId: String? = null,
        paymentMethod: PaymentMethod? = null,
        status: PaymentStatus? = null,
        fromDate: Date? = null,
        toDate: Date? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<Payment>
    
    /**
     * الحصول على المدفوعات غير المتزامنة
     */
    @Query("SELECT * FROM payments WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedPayments(): List<Payment>
    
    /**
     * عدد المدفوعات غير المتزامنة
     */
    @Query("SELECT COUNT(*) FROM payments WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedPaymentsCount(): Int
    
    /**
     * تحديد دفعة كمتزامنة
     */
    @Query("UPDATE payments SET lastSyncTime = :syncTime WHERE id = :paymentId")
    suspend fun markAsSynced(paymentId: String, syncTime: Date = Date()): Int
}

/**
 * إحصائيات المدفوعات
 */
data class PaymentStatistics(
    val totalPayments: Int,
    val totalAmount: Double,
    val averageAmount: Double,
    val completedPayments: Int,
    val pendingPayments: Int,
    val overduePayments: Int,
    val largestPayment: Double,
    val smallestPayment: Double
)