package com.networkCards.manager.data.database.dao

import androidx.room.*
import androidx.lifecycle.LiveData
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.data.model.StockStatus
import kotlinx.coroutines.flow.Flow

/**
 * DAO للباقات
 * يوفر عمليات قاعدة البيانات للباقات
 */
@Dao
interface PackageDao {
    
    /**
     * الحصول على جميع الباقات
     */
    @Query("SELECT * FROM packages WHERE isActive = 1 ORDER BY sortOrder ASC, name ASC")
    fun getAllPackages(): Flow<List<Package>>
    
    /**
     * الحصول على جميع الباقات كقائمة
     */
    @Query("SELECT * FROM packages ORDER BY name ASC")
    suspend fun getAllPackagesList(): List<Package>
    
    /**
     * الحصول على باقة بالمعرف
     */
    @Query("SELECT * FROM packages WHERE id = :packageId")
    suspend fun getPackageById(packageId: String): Package?
    
    /**
     * البحث في الباقات
     */
    @Query("""
        SELECT * FROM packages 
        WHERE (name LIKE :query OR description LIKE :query OR barcode LIKE :query)
        AND isActive = 1
        ORDER BY 
            CASE 
                WHEN name LIKE :query THEN 1
                WHEN barcode LIKE :query THEN 2
                WHEN description LIKE :query THEN 3
                ELSE 4
            END,
            name ASC
    """)
    suspend fun searchPackages(query: String): List<Package>
    
    /**
     * البحث بالباركود
     */
    @Query("SELECT * FROM packages WHERE barcode = :barcode AND isActive = 1")
    suspend fun getPackageByBarcode(barcode: String): Package?
    
    /**
     * الحصول على الباقات المميزة
     */
    @Query("SELECT * FROM packages WHERE isFeatured = 1 AND isActive = 1 ORDER BY sortOrder ASC")
    suspend fun getFeaturedPackages(): List<Package>
    
    /**
     * الحصول على الباقات منخفضة المخزون
     */
    @Query("SELECT * FROM packages WHERE currentStock <= minStockLevel AND isActive = 1 ORDER BY currentStock ASC")
    suspend fun getLowStockPackages(): List<Package>
    
    /**
     * الحصول على الباقات نافدة المخزون
     */
    @Query("SELECT * FROM packages WHERE currentStock <= 0 AND isActive = 1 ORDER BY name ASC")
    suspend fun getOutOfStockPackages(): List<Package>
    
    /**
     * الحصول على الباقات حسب الفئة
     */
    @Query("SELECT * FROM packages WHERE category = :category AND isActive = 1 ORDER BY name ASC")
    suspend fun getPackagesByCategory(category: String): List<Package>
    
    /**
     * الحصول على أفضل الباقات مبيعاً
     */
    @Query("SELECT * FROM packages WHERE isActive = 1 ORDER BY totalSold DESC LIMIT :limit")
    suspend fun getTopSellingPackages(limit: Int = 10): List<Package>
    
    /**
     * الحصول على إحصائيات الباقات
     */
    @Query("""
        SELECT 
            COUNT(*) as totalPackages,
            COUNT(CASE WHEN isActive = 1 THEN 1 END) as activePackages,
            COUNT(CASE WHEN currentStock <= minStockLevel THEN 1 END) as lowStockPackages,
            COUNT(CASE WHEN currentStock <= 0 THEN 1 END) as outOfStockPackages,
            SUM(currentStock) as totalStock,
            AVG(currentStock) as averageStock,
            COUNT(CASE WHEN isFeatured = 1 THEN 1 END) as featuredPackages
        FROM packages
    """)
    suspend fun getPackageStatistics(): PackageStatistics
    
    /**
     * إدراج باقة جديدة
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPackage(package: Package): Long
    
    /**
     * إدراج عدة باقات
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPackages(packages: List<Package>): List<Long>
    
    /**
     * تحديث باقة
     */
    @Update
    suspend fun updatePackage(package: Package): Int
    
    /**
     * تحديث مخزون الباقة
     */
    @Query("UPDATE packages SET currentStock = :stock, updatedAt = :updatedAt WHERE id = :packageId")
    suspend fun updateStock(packageId: String, stock: Int, updatedAt: Date = Date()): Int
    
    /**
     * إضافة للمخزون
     */
    @Query("UPDATE packages SET currentStock = currentStock + :quantity, updatedAt = :updatedAt WHERE id = :packageId")
    suspend fun addToStock(packageId: String, quantity: Int, updatedAt: Date = Date()): Int
    
    /**
     * خصم من المخزون
     */
    @Query("UPDATE packages SET currentStock = currentStock - :quantity, updatedAt = :updatedAt WHERE id = :packageId")
    suspend fun removeFromStock(packageId: String, quantity: Int, updatedAt: Date = Date()): Int
    
    /**
     * تحديث إحصائيات المبيعات
     */
    @Query("""
        UPDATE packages 
        SET totalSold = totalSold + :soldQuantity,
            totalRevenue = totalRevenue + :revenue,
            updatedAt = :updatedAt 
        WHERE id = :packageId
    """)
    suspend fun updateSalesStats(
        packageId: String, 
        soldQuantity: Int, 
        revenue: Double, 
        updatedAt: Date = Date()
    ): Int
    
    /**
     * تفعيل/تعطيل باقة
     */
    @Query("UPDATE packages SET isActive = :isActive, updatedAt = :updatedAt WHERE id = :packageId")
    suspend fun togglePackageActive(packageId: String, isActive: Boolean, updatedAt: Date = Date()): Int
    
    /**
     * تمييز/إلغاء تمييز باقة
     */
    @Query("UPDATE packages SET isFeatured = :isFeatured, updatedAt = :updatedAt WHERE id = :packageId")
    suspend fun togglePackageFeatured(packageId: String, isFeatured: Boolean, updatedAt: Date = Date()): Int
    
    /**
     * حذف باقة
     */
    @Delete
    suspend fun deletePackage(package: Package): Int
    
    /**
     * حذف باقة بالمعرف
     */
    @Query("DELETE FROM packages WHERE id = :packageId")
    suspend fun deletePackageById(packageId: String): Int
    
    /**
     * حذف جميع الباقات (للاختبار)
     */
    @Query("DELETE FROM packages")
    suspend fun deleteAllPackages(): Int
    
    /**
     * عدد الباقات
     */
    @Query("SELECT COUNT(*) FROM packages")
    suspend fun getPackagesCount(): Int
    
    /**
     * عدد الباقات النشطة
     */
    @Query("SELECT COUNT(*) FROM packages WHERE isActive = 1")
    suspend fun getActivePackagesCount(): Int
    
    /**
     * الحصول على أحدث الباقات
     */
    @Query("SELECT * FROM packages ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentPackages(limit: Int = 10): List<Package>
    
    /**
     * البحث المتقدم مع فلترة
     */
    @Query("""
        SELECT * FROM packages 
        WHERE (:query IS NULL OR name LIKE '%' || :query || '%' 
               OR description LIKE '%' || :query || '%'
               OR barcode LIKE '%' || :query || '%')
        AND (:category IS NULL OR category = :category)
        AND (:isActive IS NULL OR isActive = :isActive)
        AND (:isFeatured IS NULL OR isFeatured = :isFeatured)
        AND (:stockStatus IS NULL OR 
             (:stockStatus = 'LOW' AND currentStock <= minStockLevel) OR
             (:stockStatus = 'OUT' AND currentStock <= 0) OR
             (:stockStatus = 'NORMAL' AND currentStock > minStockLevel))
        ORDER BY 
            CASE :sortBy
                WHEN 'name' THEN name
                WHEN 'stock' THEN CAST(currentStock AS TEXT)
                WHEN 'price' THEN CAST(retailPrice AS TEXT)
                WHEN 'date' THEN CAST(createdAt AS TEXT)
                ELSE name
            END ASC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun searchPackagesAdvanced(
        query: String? = null,
        category: String? = null,
        isActive: Boolean? = null,
        isFeatured: Boolean? = null,
        stockStatus: String? = null,
        sortBy: String = "name",
        limit: Int = 50,
        offset: Int = 0
    ): List<Package>
    
    /**
     * الحصول على الباقات غير المتزامنة
     */
    @Query("SELECT * FROM packages WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedPackages(): List<Package>
    
    /**
     * عدد الباقات غير المتزامنة
     */
    @Query("SELECT COUNT(*) FROM packages WHERE lastSyncTime < updatedAt OR lastSyncTime IS NULL")
    suspend fun getUnsyncedPackagesCount(): Int
    
    /**
     * تحديث الباقات المعدلة
     */
    @Query("SELECT * FROM packages WHERE updatedAt > :since")
    suspend fun getModifiedPackages(since: Date): List<Package>
    
    /**
     * تحديد باقة كمتزامنة
     */
    @Query("UPDATE packages SET lastSyncTime = :syncTime WHERE id = :packageId")
    suspend fun markAsSynced(packageId: String, syncTime: Date = Date()): Int
}

/**
 * إحصائيات الباقات
 */
data class PackageStatistics(
    val totalPackages: Int,
    val activePackages: Int,
    val lowStockPackages: Int,
    val outOfStockPackages: Int,
    val totalStock: Int,
    val averageStock: Double,
    val featuredPackages: Int
)