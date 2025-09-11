package com.networkCards.manager.data.repository

import com.networkCards.manager.data.database.dao.StoreDao
import com.networkCards.manager.data.database.dao.SaleDao
import com.networkCards.manager.data.database.dao.PaymentDao
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.PriceType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مستودع المحلات
 * يدير جميع عمليات البيانات المتعلقة بالمحلات
 */
@Singleton
class StoreRepository @Inject constructor(
    private val storeDao: StoreDao,
    private val saleDao: SaleDao,
    private val paymentDao: PaymentDao
) {
    
    /**
     * الحصول على جميع المحلات
     */
    fun getAllStores(): Flow<List<Store>> = storeDao.getAllStores().map { stores ->
        stores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * الحصول على جميع المحلات كقائمة
     */
    suspend fun getAllStoresList(): List<Store> = withContext(Dispatchers.IO) {
        val stores = storeDao.getAllStoresList()
        stores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * الحصول على محل بالمعرف
     */
    suspend fun getStoreById(storeId: String): Store? = withContext(Dispatchers.IO) {
        storeDao.getStoreById(storeId)?.let { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * البحث في المحلات
     */
    suspend fun searchStores(
        query: String? = null,
        priceType: PriceType? = null
    ): List<Store> = withContext(Dispatchers.IO) {
        val stores = if (query != null) {
            storeDao.searchStores("%$query%")
        } else {
            storeDao.getAllStoresList()
        }
        
        val filteredStores = if (priceType != null) {
            stores.filter { it.priceType == priceType }
        } else {
            stores
        }
        
        filteredStores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * الحصول على المحلات النشطة
     */
    fun getActiveStores(): Flow<List<Store>> = storeDao.getActiveStores().map { stores ->
        stores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * الحصول على المحلات مع الديون
     */
    suspend fun getStoresWithDebt(): List<Store> = withContext(Dispatchers.IO) {
        val stores = storeDao.getStoresWithDebt()
        stores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * الحصول على المحلات VIP
     */
    suspend fun getVIPStores(): List<Store> = withContext(Dispatchers.IO) {
        val stores = storeDao.getVIPStores()
        stores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
    
    /**
     * الحصول على إحصائيات المحلات
     */
    suspend fun getStoreStatistics(): StoreStatistics = withContext(Dispatchers.IO) {
        storeDao.getStoreStatistics()
    }
    
    /**
     * الحصول على عدد المحلات حسب نوع السعر
     */
    suspend fun getStoresByPriceTypeCount(): Map<PriceType, Int> = withContext(Dispatchers.IO) {
        val result = mutableMapOf<PriceType, Int>()
        
        PriceType.values().forEach { priceType ->
            val count = storeDao.getStoresByPriceType(priceType).size
            result[priceType] = count
        }
        
        result
    }
    
    /**
     * إدراج محل جديد
     */
    suspend fun insertStore(store: Store): Long = withContext(Dispatchers.IO) {
        storeDao.insertStore(store)
    }
    
    /**
     * تحديث محل
     */
    suspend fun updateStore(store: Store): Int = withContext(Dispatchers.IO) {
        val updatedStore = store.copy(updatedAt = java.util.Date())
        storeDao.updateStore(updatedStore)
    }
    
    /**
     * حذف محل
     */
    suspend fun deleteStore(store: Store): Int = withContext(Dispatchers.IO) {
        storeDao.deleteStore(store)
    }
    
    /**
     * تحديث رصيد محل
     */
    suspend fun updateStoreBalance(storeId: String): Double = withContext(Dispatchers.IO) {
        val totalSales = saleDao.getTotalSalesForStore(storeId)
        val totalPayments = paymentDao.getTotalPaymentsForStore(storeId)
        val balance = totalSales - totalPayments
        
        storeDao.updateStoreBalance(storeId, balance)
        balance
    }
    
    /**
     * تحديث آخر تاريخ بيع
     */
    suspend fun updateLastSaleDate(storeId: String, lastSaleDate: java.util.Date) = withContext(Dispatchers.IO) {
        storeDao.updateLastSaleDate(storeId, lastSaleDate)
    }
    
    /**
     * تحديث آخر تاريخ دفع
     */
    suspend fun updateLastPaymentDate(storeId: String, lastPaymentDate: java.util.Date) = withContext(Dispatchers.IO) {
        storeDao.updateLastPaymentDate(storeId, lastPaymentDate)
    }
    
    /**
     * تفعيل/تعطيل محل
     */
    suspend fun toggleStoreActive(storeId: String, isActive: Boolean) = withContext(Dispatchers.IO) {
        storeDao.toggleStoreActive(storeId, isActive)
    }
    
    /**
     * تحسين المحل بالحقول المحسوبة
     */
    private suspend fun enhanceStoreWithCalculatedFields(store: Store): Store {
        return try {
            val totalSales = saleDao.getTotalSalesForStore(store.id)
            val totalPayments = paymentDao.getTotalPaymentsForStore(store.id)
            val balance = totalSales - totalPayments
            
            // الحصول على آخر تواريخ النشاط
            val recentSales = saleDao.getStoreSalesInPeriod(
                store.id, 
                java.util.Date(0), 
                java.util.Date()
            )
            val recentPayments = paymentDao.getPaymentsByStoreList(store.id)
            
            val lastSaleDate = recentSales.maxByOrNull { it.date }?.date
            val lastPaymentDate = recentPayments.maxByOrNull { it.date }?.date
            
            store.copy(
                totalSales = totalSales,
                totalPayments = totalPayments,
                balance = balance,
                lastSaleDate = lastSaleDate,
                lastPaymentDate = lastPaymentDate
            )
        } catch (e: Exception) {
            // في حالة الخطأ، إرجاع المحل كما هو
            store
        }
    }
    
    /**
     * تحديث جميع أرصدة المحلات
     */
    suspend fun updateAllStoreBalances() = withContext(Dispatchers.IO) {
        val stores = storeDao.getAllStoresList()
        
        stores.forEach { store ->
            updateStoreBalance(store.id)
        }
    }
    
    /**
     * البحث المتقدم
     */
    suspend fun searchStoresAdvanced(
        query: String? = null,
        priceType: PriceType? = null,
        isActive: Boolean? = null,
        hasDebt: Boolean? = null,
        sortBy: String = "name",
        limit: Int = 50,
        offset: Int = 0
    ): List<Store> = withContext(Dispatchers.IO) {
        val stores = storeDao.searchStoresAdvanced(
            query, priceType, isActive, hasDebt, sortBy, limit, offset
        )
        
        stores.map { store ->
            enhanceStoreWithCalculatedFields(store)
        }
    }
}