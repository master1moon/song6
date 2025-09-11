package com.networkCards.manager.data.database.dao

import androidx.room.*
import androidx.lifecycle.LiveData
import com.networkCards.manager.data.model.Inventory
import com.networkCards.manager.data.model.InventoryOperationType
import com.networkCards.manager.data.model.InventoryStatus
import kotlinx.coroutines.flow.Flow
import java.util.Date

/**
 * DAO للمخزون
 * يوفر عمليات قاعدة البيانات للمخزون
 */
@Dao
interface InventoryDao {
    
    /**
     * الحصول على جميع حركات المخزون
     */
    @Query("SELECT * FROM inventory ORDER BY date DESC")
    fun getAllInventoryMovements(): Flow<List<Inventory>>
    
    /**
     * الحصول على جميع حركات المخزون كقائمة
     */
    @Query("SELECT * FROM inventory ORDER BY date DESC")
    suspend fun getAllInventoryMovementsList(): List<Inventory>
    
    /**
     * الحصول على حركة مخزون بالمعرف
     */
    @Query("SELECT * FROM inventory WHERE id = :inventoryId")
    suspend fun getInventoryMovementById(inventoryId: String): Inventory?
    
    /**
     * الحصول على حركات مخزون باقة معينة
     */
    @Query("SELECT * FROM inventory WHERE packageId = :packageId ORDER BY date DESC")
    fun getInventoryMovementsByPackage(packageId: String): Flow<List<Inventory>>
    
    /**
     * الحصول على حركات مخزون باقة معينة كقائمة
     */
    @Query("SELECT * FROM inventory WHERE packageId = :packageId ORDER BY date DESC")
    suspend fun getInventoryMovementsByPackageList(packageId: String): List<Inventory>
    
    /**
     * الحصول على حركات المخزون في فترة معينة
     */
    @Query("SELECT * FROM inventory WHERE date BETWEEN :fromDate AND :toDate ORDER BY date DESC")
    suspend fun getInventoryMovementsInPeriod(fromDate: Date, toDate: Date): List<Inventory>
    
    /**
     * الحصول على حركات مخزون اليوم
     */
    @Query("""
        SELECT * FROM inventory 
        WHERE date >= date('now', 'start of day') 
        ORDER BY date DESC
    """)
    suspend fun getTodayInventoryMovements(): List<Inventory>
    
    /**
     * الحصول على أحدث حركات المخزون
     */
    @Query("SELECT * FROM inventory ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentInventoryMovements(limit: Int = 10): List<Inventory>
    
    /**
     * الحصول على حركات المخزون حسب النوع
     */
    @Query("SELECT * FROM inventory WHERE operationType = :operationType ORDER BY date DESC")
    suspend fun getInventoryMovementsByType(operationType: InventoryOperationType): List<Inventory>
    
    /**
     * الحصول على حركات الإضافة للمخزون
     */
    @Query("SELECT * FROM inventory WHERE operationType = 'ADD' ORDER BY date DESC")
    suspend fun getInventoryAdditions(): List<Inventory>
    
    /**
     * الحصول على حركات الخصم من المخزون
     */
    @Query("SELECT * FROM inventory WHERE operationType = 'REMOVE' ORDER BY date DESC")
    suspend fun getInventoryRemovals(): List<Inventory>
    
    /**
     * الحصول على المواد التالفة
     */
    @Query("SELECT * FROM inventory WHERE operationType = 'DAMAGE' ORDER BY date DESC")
    suspend fun getDamagedItems(): List<Inventory>
    
    /**
     * الحصول على المواد المرتجعة
     */
    @Query("SELECT * FROM inventory WHERE operationType = 'RETURN' ORDER BY date DESC")
    suspend fun getReturnedItems(): List<Inventory>
    
    /**
     * حساب إجمالي المخزون لباقة معينة
     */
    @Query("""
        SELECT COALESCE(SUM(
            CASE 
                WHEN operationType = 'ADD' THEN quantity
                WHEN operationType = 'REMOVE' THEN -quantity
                WHEN operationType = 'DAMAGE' THEN -quantity
                WHEN operationType = 'RETURN' THEN quantity
                ELSE 0
            END
        ), 0) 
        FROM inventory 
        WHERE packageId = :packageId AND status = 'COMPLETED'
    """)
    suspend fun getTotalStockForPackage(packageId: String): Int
    
    /**
     * الحصول على إحصائيات المخزون
     */
    @Query("""
        SELECT 
            COUNT(*) as totalMovements,
            COUNT(CASE WHEN operationType = 'ADD' THEN 1 END) as additionCount,
            COUNT(CASE WHEN operationType = 'REMOVE' THEN 1 END) as removalCount,
            COUNT(CASE WHEN operationType = 'DAMAGE' THEN 1 END) as damageCount,
            COUNT(CASE WHEN operationType = 'RETURN' THEN 1 END) as returnCount,
            SUM(CASE WHEN operationType = 'ADD' THEN quantity ELSE 0 END) as totalAdded,
            SUM(CASE WHEN operationType = 'REMOVE' THEN quantity ELSE 0 END) as totalRemoved,
            SUM(CASE WHEN operationType = 'DAMAGE' THEN quantity ELSE 0 END) as totalDamaged,
            SUM(CASE WHEN operationType = 'RETURN' THEN quantity ELSE 0 END) as totalReturned
        FROM inventory
    """)
    suspend fun getInventoryStatistics(): InventoryStatistics
    
    /**
     * الحصول على إحصائيات المخزون لباقة معينة
     */
    @Query("""
        SELECT 
            COUNT(*) as totalMovements,
            SUM(CASE WHEN operationType = 'ADD' THEN quantity ELSE 0 END) as totalAdded,
            SUM(CASE WHEN operationType = 'REMOVE' THEN quantity ELSE 0 END) as totalRemoved,
            SUM(CASE WHEN operationType = 'DAMAGE' THEN quantity ELSE 0 END) as totalDamaged,
            SUM(CASE WHEN operationType = 'RETURN' THEN quantity ELSE 0 END) as totalReturned
        FROM inventory 
        WHERE packageId = :packageId
    """)
    suspend fun getInventoryStatisticsForPackage(packageId: String): PackageInventoryStatistics
    
    /**
     * إدراج حركة مخزون جديدة
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInventory(inventory: Inventory): Long
    
    /**
     * إدراج عدة حركات مخزون
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInventoryMovements(movements: List<Inventory>): List<Long>
    
    /**
     * تحديث حركة مخزون
     */
    @Update
    suspend fun updateInventory(inventory: Inventory): Int
    
    /**
     * تحديث حالة حركة المخزون
     */
    @Query("UPDATE inventory SET status = :status, updatedAt = :updatedAt WHERE id = :inventoryId")
    suspend fun updateInventoryStatus(inventoryId: String, status: InventoryStatus, updatedAt: Date = Date()): Int
    
    /**
     * إضافة للمخزون
     */
    @Transaction
    suspend fun addToInventory(
        packageId: String,
        quantity: Int,
        notes: String? = null,
        unitCost: Double? = null,
        batchNumber: String? = null,
        supplierName: String? = null
    ) {
        val inventory = Inventory(
            id = "inv_${System.currentTimeMillis()}",
            packageId = packageId,
            quantity = quantity,
            operationType = InventoryOperationType.ADD,
            notes = notes,
            unitCost = unitCost,
            totalCost = unitCost?.let { it * quantity },
            batchNumber = batchNumber,
            supplierName = supplierName
        )
        
        insertInventory(inventory)
    }
    
    /**
     * خصم من المخزون
     */
    @Transaction
    suspend fun removeFromInventory(
        packageId: String,
        quantity: Int,
        reason: String? = null,
        relatedSaleId: String? = null
    ) {
        val inventory = Inventory(
            id = "inv_${System.currentTimeMillis()}",
            packageId = packageId,
            quantity = quantity,
            operationType = InventoryOperationType.REMOVE,
            reason = reason,
            relatedSaleId = relatedSaleId
        )
        
        insertInventory(inventory)
    }
    
    /**
     * تسجيل تلف
     */
    @Transaction
    suspend fun recordDamage(
        packageId: String,
        quantity: Int,
        damageReport: String,
        photos: String? = null
    ) {
        val inventory = Inventory(
            id = "inv_${System.currentTimeMillis()}",
            packageId = packageId,
            quantity = quantity,
            operationType = InventoryOperationType.DAMAGE,
            damageReport = damageReport,
            photos = photos,
            qualityCheck = false
        )
        
        insertInventory(inventory)
    }
    
    /**
     * حذف حركة مخزون
     */
    @Delete
    suspend fun deleteInventoryMovement(inventory: Inventory): Int
    
    /**
     * حذف حركة مخزون بالمعرف
     */
    @Query("DELETE FROM inventory WHERE id = :inventoryId")
    suspend fun deleteInventoryMovementById(inventoryId: String): Int
    
    /**
     * عدد حركات المخزون
     */
    @Query("SELECT COUNT(*) FROM inventory")
    suspend fun getInventoryMovementsCount(): Int
    
    /**
     * البحث في حركات المخزون
     */
    @Query("""
        SELECT i.* FROM inventory i
        LEFT JOIN packages p ON i.packageId = p.id
        WHERE (:query IS NULL OR 
               p.name LIKE '%' || :query || '%' OR
               i.notes LIKE '%' || :query || '%' OR
               i.reason LIKE '%' || :query || '%' OR
               i.batchNumber LIKE '%' || :query || '%')
        AND (:packageId IS NULL OR i.packageId = :packageId)
        AND (:operationType IS NULL OR i.operationType = :operationType)
        AND (:fromDate IS NULL OR i.date >= :fromDate)
        AND (:toDate IS NULL OR i.date <= :toDate)
        ORDER BY i.date DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun searchInventoryMovementsAdvanced(
        query: String? = null,
        packageId: String? = null,
        operationType: InventoryOperationType? = null,
        fromDate: Date? = null,
        toDate: Date? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<Inventory>
    
    /**
     * الحصول على المواد قاربة انتهاء الصلاحية
     */
    @Query("""
        SELECT * FROM inventory 
        WHERE expiryDate IS NOT NULL 
        AND expiryDate <= date('now', '+30 days')
        AND operationType = 'ADD'
        ORDER BY expiryDate ASC
    """)
    suspend fun getNearExpiryItems(): List<Inventory>
    
    /**
     * الحصول على المواد منتهية الصلاحية
     */
    @Query("""
        SELECT * FROM inventory 
        WHERE expiryDate IS NOT NULL 
        AND expiryDate <= date('now')
        AND operationType = 'ADD'
        ORDER BY expiryDate ASC
    """)
    suspend fun getExpiredItems(): List<Inventory>
}

/**
 * إحصائيات المخزون العامة
 */
data class InventoryStatistics(
    val totalMovements: Int,
    val additionCount: Int,
    val removalCount: Int,
    val damageCount: Int,
    val returnCount: Int,
    val totalAdded: Int,
    val totalRemoved: Int,
    val totalDamaged: Int,
    val totalReturned: Int
)

/**
 * إحصائيات مخزون الباقة
 */
data class PackageInventoryStatistics(
    val totalMovements: Int,
    val totalAdded: Int,
    val totalRemoved: Int,
    val totalDamaged: Int,
    val totalReturned: Int
) {
    val currentStock: Int
        get() = totalAdded - totalRemoved - totalDamaged + totalReturned
}