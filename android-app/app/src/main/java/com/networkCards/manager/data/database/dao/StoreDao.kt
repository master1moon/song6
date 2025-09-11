package com.networkCards.manager.data.database.dao

import androidx.room.*
import androidx.lifecycle.LiveData
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.PriceType
import kotlinx.coroutines.flow.Flow

/**
 * DAO للمحلات
 * يوفر عمليات قاعدة البيانات للمحلات
 */
@Dao
interface StoreDao {
    
    /**
     * الحصول على جميع المحلات
     */
    @Query("SELECT * FROM stores ORDER BY name ASC")
    fun getAllStores(): Flow<List<Store>>
    
    /**
     * الحصول على جميع المحلات (LiveData)
     */
    @Query("SELECT * FROM stores ORDER BY name ASC")
    fun getAllStoresLiveData(): LiveData<List<Store>>
    
    /**
     * الحصول على محل بالمعرف
     */
    @Query("SELECT * FROM stores WHERE id = :storeId")
    suspend fun getStoreById(storeId: String): Store?
    
    /**
     * البحث في المحلات
     */
    @Query("""
        SELECT * FROM stores 
        WHERE name LIKE :query 
        OR phone LIKE :query 
        OR address LIKE :query 
        OR notes LIKE :query
        ORDER BY 
            CASE 
                WHEN name LIKE :query THEN 1
                WHEN phone LIKE :query THEN 2
                WHEN address LIKE :query THEN 3
                ELSE 4
            END,
            name ASC
    """)
    suspend fun searchStores(query: String): List<Store>
    
    /**
     * فلترة المحلات حسب نوع السعر
     */
    @Query("SELECT * FROM stores WHERE priceType = :priceType ORDER BY name ASC")
    suspend fun getStoresByPriceType(priceType: PriceType): List<Store>
    
    /**
     * الحصول على المحلات النشطة
     */
    @Query("SELECT * FROM stores WHERE isActive = 1 ORDER BY name ASC")
    fun getActiveStores(): Flow<List<Store>>
    
    /**
     * الحصول على المحلات مع الديون
     */
    @Query("SELECT * FROM stores WHERE balance > 0 ORDER BY balance DESC")
    suspend fun getStoresWithDebt(): List<Store>
    
    /**
     * الحصول على المحلات VIP
     */
    @Query("SELECT * FROM stores WHERE priority >= 2 ORDER BY priority DESC, name ASC")
    suspend fun getVIPStores(): List<Store>
    
    /**
     * الحصول على إحصائيات المحلات
     */
    @Query("""
        SELECT 
            COUNT(*) as totalStores,
            COUNT(CASE WHEN isActive = 1 THEN 1 END) as activeStores,
            COUNT(CASE WHEN balance > 0 THEN 1 END) as storesWithDebt,
            SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as totalDebt,
            AVG(balance) as averageBalance
        FROM stores
    """)
    suspend fun getStoreStatistics(): StoreStatistics
    
    /**
     * إدراج محل جديد
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStore(store: Store): Long
    
    /**
     * إدراج عدة محلات
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStores(stores: List<Store>): List<Long>
    
    /**
     * تحديث محل
     */
    @Update
    suspend fun updateStore(store: Store): Int
    
    /**
     * تحديث رصيد محل
     */
    @Query("UPDATE stores SET balance = :balance, updatedAt = :updatedAt WHERE id = :storeId")
    suspend fun updateStoreBalance(storeId: String, balance: Double, updatedAt: Date = Date()): Int
    
    /**
     * تحديث آخر تاريخ بيع
     */
    @Query("UPDATE stores SET lastSaleDate = :lastSaleDate WHERE id = :storeId")
    suspend fun updateLastSaleDate(storeId: String, lastSaleDate: Date): Int
    
    /**
     * تحديث آخر تاريخ دفع
     */
    @Query("UPDATE stores SET lastPaymentDate = :lastPaymentDate WHERE id = :storeId")
    suspend fun updateLastPaymentDate(storeId: String, lastPaymentDate: Date): Int
    
    /**
     * تفعيل/تعطيل محل
     */
    @Query("UPDATE stores SET isActive = :isActive, updatedAt = :updatedAt WHERE id = :storeId")
    suspend fun toggleStoreActive(storeId: String, isActive: Boolean, updatedAt: Date = Date()): Int
    
    /**
     * حذف محل
     */
    @Delete
    suspend fun deleteStore(store: Store): Int
    
    /**
     * حذف محل بالمعرف
     */
    @Query("DELETE FROM stores WHERE id = :storeId")
    suspend fun deleteStoreById(storeId: String): Int
    
    /**
     * حذف جميع المحلات (للاختبار)
     */
    @Query("DELETE FROM stores")
    suspend fun deleteAllStores(): Int
    
    /**
     * عدد المحلات
     */
    @Query("SELECT COUNT(*) FROM stores")
    suspend fun getStoresCount(): Int
    
    /**
     * عدد المحلات النشطة
     */
    @Query("SELECT COUNT(*) FROM stores WHERE isActive = 1")
    suspend fun getActiveStoresCount(): Int
    
    /**
     * الحصول على أحدث المحلات
     */
    @Query("SELECT * FROM stores ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentStores(limit: Int = 10): List<Store>
    
    /**
     * البحث المتقدم مع فلترة
     */
    @Query("""
        SELECT * FROM stores 
        WHERE (:query IS NULL OR name LIKE '%' || :query || '%' 
               OR phone LIKE '%' || :query || '%'
               OR address LIKE '%' || :query || '%')
        AND (:priceType IS NULL OR priceType = :priceType)
        AND (:isActive IS NULL OR isActive = :isActive)
        AND (:hasDebt IS NULL OR 
             (:hasDebt = 1 AND balance > 0) OR 
             (:hasDebt = 0 AND balance <= 0))
        ORDER BY 
            CASE :sortBy
                WHEN 'name' THEN name
                WHEN 'balance' THEN CAST(balance AS TEXT)
                WHEN 'date' THEN CAST(createdAt AS TEXT)
                ELSE name
            END ASC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun searchStoresAdvanced(
        query: String? = null,
        priceType: PriceType? = null,
        isActive: Boolean? = null,
        hasDebt: Boolean? = null,
        sortBy: String = "name",
        limit: Int = 50,
        offset: Int = 0
    ): List<Store>
}

/**
 * كلاس إحصائيات المحلات
 */
data class StoreStatistics(
    val totalStores: Int,
    val activeStores: Int,
    val storesWithDebt: Int,
    val totalDebt: Double,
    val averageBalance: Double
)