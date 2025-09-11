package com.networkCards.manager.ui.stores

import android.net.Uri
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.networkCards.manager.data.database.NetworkCardsDatabase
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.PriceType
import com.networkCards.manager.data.repository.StoreRepository
import com.networkCards.manager.data.repository.SyncRepository
import com.networkCards.manager.util.ExcelExporter
import com.networkCards.manager.util.FileManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel للمحلات
 * يدير حالة وبيانات شاشة المحلات
 */
@HiltViewModel
class StoresViewModel @Inject constructor(
    private val storeRepository: StoreRepository,
    private val syncRepository: SyncRepository,
    private val excelExporter: ExcelExporter,
    private val fileManager: FileManager
) : ViewModel() {
    
    // حالة البيانات
    private val _stores = MutableLiveData<List<Store>>()
    val stores: LiveData<List<Store>> = _stores
    
    private val _storeStatistics = MutableLiveData<StoreStatistics>()
    val storeStatistics: LiveData<StoreStatistics> = _storeStatistics
    
    // حالة التحميل
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // الأخطاء
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    // حالة البحث
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    // فلاتر
    private val _currentFilter = MutableStateFlow<PriceType?>(null)
    val currentFilter: StateFlow<PriceType?> = _currentFilter.asStateFlow()
    
    // حالة المزامنة
    private val _syncStatus = MutableLiveData<SyncStatus?>()
    val syncStatus: LiveData<SyncStatus?> = _syncStatus
    
    init {
        loadStores()
        loadStatistics()
    }
    
    /**
     * تحميل المحلات
     */
    fun loadStores() {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                storeRepository.getAllStores().collect { storesList ->
                    _stores.value = storesList
                    Timber.d("✅ Loaded ${storesList.size} stores")
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load stores")
                _error.value = "فشل في تحميل المحلات: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * تحميل الإحصائيات
     */
    fun loadStatistics() {
        viewModelScope.launch {
            try {
                val stats = storeRepository.getStoreStatistics()
                _storeStatistics.value = stats
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load store statistics")
            }
        }
    }
    
    /**
     * البحث في المحلات
     */
    fun searchStores(query: String, priceType: PriceType? = null) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _searchQuery.value = query
                _currentFilter.value = priceType
                
                val results = if (query.isBlank() && priceType == null) {
                    storeRepository.getAllStoresList()
                } else {
                    storeRepository.searchStores(
                        query = if (query.isBlank()) null else "%$query%",
                        priceType = priceType
                    )
                }
                
                _stores.value = results
                Timber.d("🔍 Search completed: ${results.size} results for '$query'")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Search failed")
                _error.value = "فشل في البحث: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * ترتيب المحلات
     */
    fun sortStores(sortBy: String) {
        viewModelScope.launch {
            try {
                val currentStores = _stores.value ?: return@launch
                
                val sortedStores = when (sortBy) {
                    "name_asc" -> currentStores.sortedBy { it.name }
                    "name_desc" -> currentStores.sortedByDescending { it.name }
                    "balance_asc" -> currentStores.sortedBy { it.balance }
                    "balance_desc" -> currentStores.sortedByDescending { it.balance }
                    "date_asc" -> currentStores.sortedBy { it.createdAt }
                    "date_desc" -> currentStores.sortedByDescending { it.createdAt }
                    else -> currentStores.sortedBy { it.name }
                }
                
                _stores.value = sortedStores
                Timber.d("📊 Stores sorted by: $sortBy")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Sort failed")
                _error.value = "فشل في الترتيب: ${e.message}"
            }
        }
    }
    
    /**
     * حذف محل
     */
    fun deleteStore(store: Store) {
        viewModelScope.launch {
            try {
                storeRepository.deleteStore(store)
                
                // إعادة تحميل القائمة
                loadStores()
                loadStatistics()
                
                Timber.d("🗑️ Store deleted: ${store.name}")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to delete store")
                _error.value = "فشل في حذف المحل: ${e.message}"
            }
        }
    }
    
    /**
     * استعادة محل محذوف
     */
    fun restoreStore(store: Store) {
        viewModelScope.launch {
            try {
                storeRepository.insertStore(store)
                loadStores()
                loadStatistics()
                
                Timber.d("♻️ Store restored: ${store.name}")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to restore store")
                _error.value = "فشل في استعادة المحل: ${e.message}"
            }
        }
    }
    
    /**
     * تصدير المحلات إلى Excel
     */
    suspend fun exportStores(): Uri? {
        return try {
            _isLoading.value = true
            
            val stores = storeRepository.getAllStoresList()
            val file = excelExporter.exportStores(stores)
            
            Timber.d("📊 Stores exported to Excel: ${stores.size} stores")
            file
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Export failed")
            _error.value = "فشل في التصدير: ${e.message}"
            null
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * استيراد المحلات من ملف
     */
    suspend fun importStoresFromFile(uri: Uri): Int {
        return try {
            _isLoading.value = true
            
            val importedStores = excelExporter.importStores(uri)
            
            // حفظ المحلات المستوردة
            importedStores.forEach { store ->
                storeRepository.insertStore(store)
            }
            
            // إعادة تحميل البيانات
            loadStores()
            loadStatistics()
            
            Timber.d("📥 Stores imported: ${importedStores.size} stores")
            importedStores.size
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Import failed")
            _error.value = "فشل في الاستيراد: ${e.message}"
            0
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * إنشاء نسخة احتياطية للمحلات
     */
    suspend fun createStoresBackup(): Uri? {
        return try {
            _isLoading.value = true
            
            val stores = storeRepository.getAllStoresList()
            val backupFile = fileManager.createStoresBackup(stores)
            
            Timber.d("💾 Stores backup created: ${stores.size} stores")
            backupFile
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Backup creation failed")
            _error.value = "فشل في إنشاء النسخة الاحتياطية: ${e.message}"
            null
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * مزامنة المحلات
     */
    fun syncStores() {
        viewModelScope.launch {
            try {
                _syncStatus.value = SyncStatus.InProgress
                
                val result = syncRepository.syncSpecificData(DataType.STORES)
                
                when (result) {
                    is SyncResult.Success -> {
                        _syncStatus.value = SyncStatus.Success
                        loadStores() // إعادة تحميل البيانات المحدثة
                        loadStatistics()
                    }
                    is SyncResult.Error -> {
                        _syncStatus.value = SyncStatus.Error(result.message)
                    }
                    is SyncResult.Partial -> {
                        _syncStatus.value = SyncStatus.Error("مزامنة جزئية: ${result.message}")
                    }
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Sync failed")
                _syncStatus.value = SyncStatus.Error("فشلت المزامنة: ${e.message}")
            }
        }
    }
    
    /**
     * الحصول على إحصائيات مفصلة
     */
    suspend fun getDetailedStatistics(): DetailedStoreStatistics {
        return try {
            val basicStats = storeRepository.getStoreStatistics()
            val priceTypeStats = storeRepository.getStoresByPriceTypeCount()
            
            DetailedStoreStatistics(
                totalStores = basicStats.totalStores,
                activeStores = basicStats.activeStores,
                storesWithDebt = basicStats.storesWithDebt,
                totalDebt = basicStats.totalDebt,
                averageBalance = basicStats.averageBalance,
                retailStores = priceTypeStats[PriceType.RETAIL] ?: 0,
                wholesaleStores = priceTypeStats[PriceType.WHOLESALE] ?: 0,
                distributorStores = priceTypeStats[PriceType.DISTRIBUTOR] ?: 0
            )
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to get detailed statistics")
            throw e
        }
    }
    
    /**
     * مسح رسالة الخطأ
     */
    fun clearError() {
        _error.value = null
    }
    
    /**
     * مسح حالة المزامنة
     */
    fun clearSyncStatus() {
        _syncStatus.value = null
    }
    
    override fun onCleared() {
        super.onCleared()
        Timber.d("🧹 StoresViewModel cleared")
    }
}

/**
 * إحصائيات مفصلة للمحلات
 */
data class DetailedStoreStatistics(
    val totalStores: Int,
    val activeStores: Int,
    val storesWithDebt: Int,
    val totalDebt: Double,
    val averageBalance: Double,
    val retailStores: Int,
    val wholesaleStores: Int,
    val distributorStores: Int
)

/**
 * حالات المزامنة
 */
sealed class SyncStatus {
    object InProgress : SyncStatus()
    object Success : SyncStatus()
    data class Error(val message: String) : SyncStatus()
}