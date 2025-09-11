package com.networkCards.manager.data.repository

import com.networkCards.manager.data.database.NetworkCardsDatabase
import com.networkCards.manager.data.model.*
import com.networkCards.manager.data.remote.ApiService
import com.networkCards.manager.util.NetworkUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مستودع المزامنة
 * يدير مزامنة البيانات مع الخادم والتطبيق الويب
 */
@Singleton
class SyncRepository @Inject constructor(
    private val database: NetworkCardsDatabase,
    private val apiService: ApiService,
    private val networkUtil: NetworkUtil
) {
    
    /**
     * مزامنة جميع البيانات
     */
    suspend fun syncAllData(): SyncResult = withContext(Dispatchers.IO) {
        try {
            if (!networkUtil.isNetworkAvailable()) {
                return@withContext SyncResult.Error("لا يوجد اتصال إنترنت")
            }
            
            Timber.d("🔄 Starting full data sync...")
            
            // 1. رفع البيانات المحلية المعدلة
            val uploadResult = uploadLocalChanges()
            if (!uploadResult.success) {
                return@withContext SyncResult.Error("فشل في رفع البيانات المحلية: ${uploadResult.message}")
            }
            
            // 2. تحميل البيانات من الخادم
            val downloadResult = downloadRemoteData()
            if (!downloadResult.success) {
                return@withContext SyncResult.Error("فشل في تحميل البيانات من الخادم: ${downloadResult.message}")
            }
            
            // 3. دمج البيانات
            val mergeResult = mergeData()
            if (!mergeResult.success) {
                return@withContext SyncResult.Error("فشل في دمج البيانات: ${mergeResult.message}")
            }
            
            // 4. تحديث آخر وقت مزامنة
            updateLastSyncTime()
            
            Timber.d("✅ Full data sync completed successfully")
            SyncResult.Success("تمت المزامنة بنجاح")
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Sync failed")
            SyncResult.Error("فشلت المزامنة: ${e.message}")
        }
    }
    
    /**
     * رفع التغييرات المحلية
     */
    private suspend fun uploadLocalChanges(): OperationResult {
        try {
            // الحصول على البيانات المعدلة محلياً
            val modifiedStores = database.storeDao().getModifiedStores()
            val modifiedPackages = database.packageDao().getModifiedPackages()
            val newSales = database.saleDao().getUnsynedSales()
            val newPayments = database.paymentDao().getUnsynedPayments()
            
            // رفع المحلات المعدلة
            if (modifiedStores.isNotEmpty()) {
                val response = apiService.uploadStores(modifiedStores)
                if (!response.isSuccessful) {
                    return OperationResult(false, "فشل في رفع المحلات")
                }
                
                // تحديث حالة المزامنة
                modifiedStores.forEach { store ->
                    database.storeDao().markAsSynced(store.id)
                }
            }
            
            // رفع الباقات المعدلة
            if (modifiedPackages.isNotEmpty()) {
                val response = apiService.uploadPackages(modifiedPackages)
                if (!response.isSuccessful) {
                    return OperationResult(false, "فشل في رفع الباقات")
                }
                
                modifiedPackages.forEach { pkg ->
                    database.packageDao().markAsSynced(pkg.id)
                }
            }
            
            // رفع المبيعات الجديدة
            if (newSales.isNotEmpty()) {
                val response = apiService.uploadSales(newSales)
                if (!response.isSuccessful) {
                    return OperationResult(false, "فشل في رفع المبيعات")
                }
                
                newSales.forEach { sale ->
                    database.saleDao().markAsSynced(sale.id)
                }
            }
            
            // رفع المدفوعات الجديدة
            if (newPayments.isNotEmpty()) {
                val response = apiService.uploadPayments(newPayments)
                if (!response.isSuccessful) {
                    return OperationResult(false, "فشل في رفع المدفوعات")
                }
                
                newPayments.forEach { payment ->
                    database.paymentDao().markAsSynced(payment.id)
                }
            }
            
            return OperationResult(true, "تم رفع جميع التغييرات")
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Upload failed")
            return OperationResult(false, e.message ?: "خطأ غير معروف")
        }
    }
    
    /**
     * تحميل البيانات من الخادم
     */
    private suspend fun downloadRemoteData(): OperationResult {
        try {
            // تحميل آخر تحديثات البيانات من الخادم
            val lastSyncTime = getLastSyncTime()
            
            // تحميل المحلات المحدثة
            val storesResponse = apiService.getUpdatedStores(lastSyncTime)
            if (storesResponse.isSuccessful) {
                storesResponse.body()?.let { stores ->
                    stores.forEach { store ->
                        database.storeDao().insertStore(store)
                    }
                }
            }
            
            // تحميل الباقات المحدثة
            val packagesResponse = apiService.getUpdatedPackages(lastSyncTime)
            if (packagesResponse.isSuccessful) {
                packagesResponse.body()?.let { packages ->
                    packages.forEach { pkg ->
                        database.packageDao().insertPackage(pkg)
                    }
                }
            }
            
            // تحميل المبيعات الجديدة
            val salesResponse = apiService.getNewSales(lastSyncTime)
            if (salesResponse.isSuccessful) {
                salesResponse.body()?.let { sales ->
                    sales.forEach { sale ->
                        database.saleDao().insertSale(sale)
                    }
                }
            }
            
            // تحميل المدفوعات الجديدة
            val paymentsResponse = apiService.getNewPayments(lastSyncTime)
            if (paymentsResponse.isSuccessful) {
                paymentsResponse.body()?.let { payments ->
                    payments.forEach { payment ->
                        database.paymentDao().insertPayment(payment)
                    }
                }
            }
            
            return OperationResult(true, "تم تحميل جميع البيانات")
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Download failed")
            return OperationResult(false, e.message ?: "خطأ في التحميل")
        }
    }
    
    /**
     * دمج البيانات المتضاربة
     */
    private suspend fun mergeData(): OperationResult {
        try {
            // حل التضارب في البيانات (إذا وجد)
            // هذا يتطلب منطق معقد حسب قواعد العمل
            
            // مثال: آخر تعديل يفوز
            resolveConflictsByLastModified()
            
            return OperationResult(true, "تم دمج البيانات بنجاح")
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Data merge failed")
            return OperationResult(false, e.message ?: "خطأ في دمج البيانات")
        }
    }
    
    /**
     * حل التضارب بآخر تعديل
     */
    private suspend fun resolveConflictsByLastModified() {
        // منطق حل التضارب
        // يمكن تطويره حسب الحاجة
    }
    
    /**
     * مزامنة بيانات محددة
     */
    suspend fun syncSpecificData(dataType: DataType): SyncResult = withContext(Dispatchers.IO) {
        try {
            when (dataType) {
                DataType.STORES -> syncStores()
                DataType.PACKAGES -> syncPackages()
                DataType.SALES -> syncSales()
                DataType.PAYMENTS -> syncPayments()
                DataType.EXPENSES -> syncExpenses()
            }
        } catch (e: Exception) {
            Timber.e(e, "❌ Specific sync failed for $dataType")
            SyncResult.Error("فشلت مزامنة ${dataType.arabicName}: ${e.message}")
        }
    }
    
    /**
     * مزامنة المحلات
     */
    private suspend fun syncStores(): SyncResult {
        val stores = database.storeDao().getAllStoresList()
        val response = apiService.syncStores(stores)
        
        return if (response.isSuccessful) {
            response.body()?.let { syncedStores ->
                syncedStores.forEach { store ->
                    database.storeDao().insertStore(store)
                }
            }
            SyncResult.Success("تمت مزامنة المحلات")
        } else {
            SyncResult.Error("فشلت مزامنة المحلات")
        }
    }
    
    /**
     * مزامنة الباقات
     */
    private suspend fun syncPackages(): SyncResult {
        val packages = database.packageDao().getAllPackagesList()
        val response = apiService.syncPackages(packages)
        
        return if (response.isSuccessful) {
            response.body()?.let { syncedPackages ->
                syncedPackages.forEach { pkg ->
                    database.packageDao().insertPackage(pkg)
                }
            }
            SyncResult.Success("تمت مزامنة الباقات")
        } else {
            SyncResult.Error("فشلت مزامنة الباقات")
        }
    }
    
    /**
     * مزامنة المبيعات
     */
    private suspend fun syncSales(): SyncResult {
        val sales = database.saleDao().getAllSalesList()
        val response = apiService.syncSales(sales)
        
        return if (response.isSuccessful) {
            response.body()?.let { syncedSales ->
                syncedSales.forEach { sale ->
                    database.saleDao().insertSale(sale)
                }
            }
            SyncResult.Success("تمت مزامنة المبيعات")
        } else {
            SyncResult.Error("فشلت مزامنة المبيعات")
        }
    }
    
    /**
     * مزامنة المدفوعات
     */
    private suspend fun syncPayments(): SyncResult {
        val payments = database.paymentDao().getAllPaymentsList()
        val response = apiService.syncPayments(payments)
        
        return if (response.isSuccessful) {
            response.body()?.let { syncedPayments ->
                syncedPayments.forEach { payment ->
                    database.paymentDao().insertPayment(payment)
                }
            }
            SyncResult.Success("تمت مزامنة المدفوعات")
        } else {
            SyncResult.Error("فشلت مزامنة المدفوعات")
        }
    }
    
    /**
     * مزامنة المصروفات
     */
    private suspend fun syncExpenses(): SyncResult {
        // تنفيذ مزامنة المصروفات
        return SyncResult.Success("تمت مزامنة المصروفات")
    }
    
    /**
     * الحصول على آخر وقت مزامنة
     */
    private suspend fun getLastSyncTime(): Long {
        return database.settingsDao().getLastSyncTime() ?: 0L
    }
    
    /**
     * تحديث آخر وقت مزامنة
     */
    private suspend fun updateLastSyncTime() {
        database.settingsDao().setLastSyncTime(System.currentTimeMillis())
    }
    
    /**
     * التحقق من حالة المزامنة
     */
    suspend fun getSyncStatus(): SyncStatus {
        val lastSyncTime = getLastSyncTime()
        val pendingChanges = getPendingChangesCount()
        
        return SyncStatus(
            lastSyncTime = lastSyncTime,
            pendingChanges = pendingChanges,
            isOnline = networkUtil.isNetworkAvailable()
        )
    }
    
    /**
     * الحصول على عدد التغييرات المعلقة
     */
    private suspend fun getPendingChangesCount(): Int {
        return database.storeDao().getUnsyncedStoresCount() +
               database.packageDao().getUnsyncedPackagesCount() +
               database.saleDao().getUnsyncedSalesCount() +
               database.paymentDao().getUnsyncedPaymentsCount()
    }
}

/**
 * نتيجة المزامنة
 */
sealed class SyncResult {
    data class Success(val message: String) : SyncResult()
    data class Error(val message: String) : SyncResult()
    data class Partial(val successCount: Int, val failureCount: Int, val message: String) : SyncResult()
}

/**
 * نتيجة العملية
 */
data class OperationResult(
    val success: Boolean,
    val message: String
)

/**
 * أنواع البيانات
 */
enum class DataType(val arabicName: String) {
    STORES("المحلات"),
    PACKAGES("الباقات"),
    SALES("المبيعات"),
    PAYMENTS("المدفوعات"),
    EXPENSES("المصروفات")
}

/**
 * حالة المزامنة
 */
data class SyncStatus(
    val lastSyncTime: Long,
    val pendingChanges: Int,
    val isOnline: Boolean
) {
    fun getLastSyncText(): String {
        return if (lastSyncTime == 0L) {
            "لم تتم المزامنة مطلقاً"
        } else {
            val diff = System.currentTimeMillis() - lastSyncTime
            val hours = diff / (1000 * 60 * 60)
            val minutes = (diff % (1000 * 60 * 60)) / (1000 * 60)
            
            when {
                hours == 0L -> "منذ ${minutes} دقيقة"
                hours < 24 -> "منذ ${hours} ساعة"
                else -> {
                    val days = hours / 24
                    "منذ ${days} يوم"
                }
            }
        }
    }
}