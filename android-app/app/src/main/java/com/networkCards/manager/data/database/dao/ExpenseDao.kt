package com.networkCards.manager.data.database.dao

import androidx.room.*
import androidx.lifecycle.LiveData
import com.networkCards.manager.data.model.Expense
import com.networkCards.manager.data.model.ExpenseCategory
import com.networkCards.manager.data.model.ExpenseStatus
import kotlinx.coroutines.flow.Flow
import java.util.Date

/**
 * DAO للمصروفات
 * يوفر عمليات قاعدة البيانات للمصروفات
 */
@Dao
interface ExpenseDao {
    
    /**
     * الحصول على جميع المصروفات
     */
    @Query("SELECT * FROM expenses ORDER BY date DESC")
    fun getAllExpenses(): Flow<List<Expense>>
    
    /**
     * الحصول على جميع المصروفات كقائمة
     */
    @Query("SELECT * FROM expenses ORDER BY date DESC")
    suspend fun getAllExpensesList(): List<Expense>
    
    /**
     * الحصول على مصروف بالمعرف
     */
    @Query("SELECT * FROM expenses WHERE id = :expenseId")
    suspend fun getExpenseById(expenseId: String): Expense?
    
    /**
     * البحث في المصروفات
     */
    @Query("""
        SELECT * FROM expenses 
        WHERE (type LIKE :query OR notes LIKE :query OR vendorName LIKE :query)
        ORDER BY 
            CASE 
                WHEN type LIKE :query THEN 1
                WHEN vendorName LIKE :query THEN 2
                WHEN notes LIKE :query THEN 3
                ELSE 4
            END,
            date DESC
    """)
    suspend fun searchExpenses(query: String): List<Expense>
    
    /**
     * الحصول على المصروفات حسب الفئة
     */
    @Query("SELECT * FROM expenses WHERE category = :category ORDER BY date DESC")
    suspend fun getExpensesByCategory(category: ExpenseCategory): List<Expense>
    
    /**
     * الحصول على المصروفات في فترة معينة
     */
    @Query("SELECT * FROM expenses WHERE date BETWEEN :fromDate AND :toDate ORDER BY date DESC")
    suspend fun getExpensesInPeriod(fromDate: Date, toDate: Date): List<Expense>
    
    /**
     * الحصول على مصروفات اليوم
     */
    @Query("""
        SELECT * FROM expenses 
        WHERE date >= date('now', 'start of day') 
        ORDER BY date DESC
    """)
    suspend fun getTodayExpenses(): List<Expense>
    
    /**
     * الحصول على مصروفات هذا الشهر
     */
    @Query("""
        SELECT * FROM expenses 
        WHERE date >= date('now', 'start of month') 
        ORDER BY date DESC
    """)
    suspend fun getThisMonthExpenses(): List<Expense>
    
    /**
     * الحصول على أحدث المصروفات
     */
    @Query("SELECT * FROM expenses ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentExpenses(limit: Int = 10): List<Expense>
    
    /**
     * الحصول على المصروفات المتكررة
     */
    @Query("SELECT * FROM expenses WHERE isRecurring = 1 ORDER BY nextDueDate ASC")
    suspend fun getRecurringExpenses(): List<Expense>
    
    /**
     * الحصول على المصروفات المستحقة
     */
    @Query("SELECT * FROM expenses WHERE isRecurring = 1 AND nextDueDate <= :currentDate ORDER BY nextDueDate ASC")
    suspend fun getDueExpenses(currentDate: Date = Date()): List<Expense>
    
    /**
     * الحصول على المصروفات المعلقة
     */
    @Query("SELECT * FROM expenses WHERE status = 'PENDING' ORDER BY date ASC")
    suspend fun getPendingExpenses(): List<Expense>
    
    /**
     * الحصول على إحصائيات المصروفات
     */
    @Query("""
        SELECT 
            COUNT(*) as totalExpenses,
            SUM(amount) as totalAmount,
            AVG(amount) as averageAmount,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedExpenses,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingExpenses,
            COUNT(CASE WHEN isRecurring = 1 THEN 1 END) as recurringExpenses,
            MAX(amount) as largestExpense,
            MIN(amount) as smallestExpense,
            SUM(taxAmount) as totalTax
        FROM expenses
    """)
    suspend fun getExpenseStatistics(): ExpenseStatistics
    
    /**
     * الحصول على إحصائيات المصروفات حسب الفئة
     */
    @Query("""
        SELECT 
            category,
            COUNT(*) as count,
            SUM(amount) as totalAmount,
            AVG(amount) as averageAmount
        FROM expenses 
        GROUP BY category
        ORDER BY totalAmount DESC
    """)
    suspend fun getExpenseStatisticsByCategory(): List<CategoryStatistics>
    
    /**
     * الحصول على إجمالي المصروفات لفترة
     */
    @Query("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE date BETWEEN :fromDate AND :toDate AND status = 'COMPLETED'")
    suspend fun getTotalExpensesForPeriod(fromDate: Date, toDate: Date): Double
    
    /**
     * الحصول على إجمالي المصروفات حسب الفئة لفترة
     */
    @Query("""
        SELECT COALESCE(SUM(amount), 0) 
        FROM expenses 
        WHERE category = :category 
        AND date BETWEEN :fromDate AND :toDate 
        AND status = 'COMPLETED'
    """)
    suspend fun getTotalExpensesByCategoryForPeriod(
        category: ExpenseCategory, 
        fromDate: Date, 
        toDate: Date
    ): Double
    
    /**
     * إدراج مصروف جديد
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: Expense): Long
    
    /**
     * إدراج عدة مصروفات
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpenses(expenses: List<Expense>): List<Long>
    
    /**
     * تحديث مصروف
     */
    @Update
    suspend fun updateExpense(expense: Expense): Int
    
    /**
     * تحديث حالة المصروف
     */
    @Query("UPDATE expenses SET status = :status, updatedAt = :updatedAt WHERE id = :expenseId")
    suspend fun updateExpenseStatus(expenseId: String, status: ExpenseStatus, updatedAt: Date = Date()): Int
    
    /**
     * تحديث التاريخ التالي للمصروف المتكرر
     */
    @Query("UPDATE expenses SET nextDueDate = :nextDueDate, updatedAt = :updatedAt WHERE id = :expenseId")
    suspend fun updateNextDueDate(expenseId: String, nextDueDate: Date, updatedAt: Date = Date()): Int
    
    /**
     * حذف مصروف
     */
    @Delete
    suspend fun deleteExpense(expense: Expense): Int
    
    /**
     * حذف مصروف بالمعرف
     */
    @Query("DELETE FROM expenses WHERE id = :expenseId")
    suspend fun deleteExpenseById(expenseId: String): Int
    
    /**
     * حذف جميع المصروفات (للاختبار)
     */
    @Query("DELETE FROM expenses")
    suspend fun deleteAllExpenses(): Int
    
    /**
     * عدد المصروفات
     */
    @Query("SELECT COUNT(*) FROM expenses")
    suspend fun getExpensesCount(): Int
    
    /**
     * عدد مصروفات اليوم
     */
    @Query("SELECT COUNT(*) FROM expenses WHERE date >= date('now', 'start of day')")
    suspend fun getTodayExpensesCount(): Int
    
    /**
     * البحث المتقدم مع فلترة
     */
    @Query("""
        SELECT * FROM expenses 
        WHERE (:query IS NULL OR type LIKE '%' || :query || '%' 
               OR notes LIKE '%' || :query || '%'
               OR vendorName LIKE '%' || :query || '%')
        AND (:category IS NULL OR category = :category)
        AND (:status IS NULL OR status = :status)
        AND (:isRecurring IS NULL OR isRecurring = :isRecurring)
        AND (:fromDate IS NULL OR date >= :fromDate)
        AND (:toDate IS NULL OR date <= :toDate)
        ORDER BY 
            CASE :sortBy
                WHEN 'amount' THEN CAST(amount AS TEXT)
                WHEN 'date' THEN CAST(date AS TEXT)
                WHEN 'type' THEN type
                ELSE CAST(date AS TEXT)
            END DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun searchExpensesAdvanced(
        query: String? = null,
        category: ExpenseCategory? = null,
        status: ExpenseStatus? = null,
        isRecurring: Boolean? = null,
        fromDate: Date? = null,
        toDate: Date? = null,
        sortBy: String = "date",
        limit: Int = 50,
        offset: Int = 0
    ): List<Expense>
    
    /**
     * الحصول على المصروفات غير المتزامنة
     */
    @Query("SELECT * FROM expenses WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedExpenses(): List<Expense>
    
    /**
     * عدد المصروفات غير المتزامنة
     */
    @Query("SELECT COUNT(*) FROM expenses WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedExpensesCount(): Int
    
    /**
     * تحديد مصروف كمتزامن
     */
    @Query("UPDATE expenses SET lastSyncTime = :syncTime WHERE id = :expenseId")
    suspend fun markAsSynced(expenseId: String, syncTime: Date = Date()): Int
}

/**
 * إحصائيات المصروفات
 */
data class ExpenseStatistics(
    val totalExpenses: Int,
    val totalAmount: Double,
    val averageAmount: Double,
    val completedExpenses: Int,
    val pendingExpenses: Int,
    val recurringExpenses: Int,
    val largestExpense: Double,
    val smallestExpense: Double,
    val totalTax: Double
)

/**
 * إحصائيات الفئة
 */
data class CategoryStatistics(
    val category: ExpenseCategory,
    val count: Int,
    val totalAmount: Double,
    val averageAmount: Double
)