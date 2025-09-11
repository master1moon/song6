package com.networkCards.manager.ui.packages

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.data.repository.PackageRepository
import com.networkCards.manager.data.repository.SaleRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel للباقات
 * يدير حالة وبيانات شاشة الباقات
 */
@HiltViewModel
class PackagesViewModel @Inject constructor(
    private val packageRepository: PackageRepository,
    private val saleRepository: SaleRepository
) : ViewModel() {
    
    // حالة البيانات
    private val _packages = MutableLiveData<List<Package>>()
    val packages: LiveData<List<Package>> = _packages
    
    private val _packageStatistics = MutableLiveData<PackageStatistics>()
    val packageStatistics: LiveData<PackageStatistics> = _packageStatistics
    
    private val _availableCategories = MutableLiveData<List<String>>()
    val availableCategories: LiveData<List<String>> = _availableCategories
    
    // حالة التحميل
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // الأخطاء
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    init {
        loadPackages()
        loadStatistics()
        loadCategories()
    }
    
    /**
     * تحميل الباقات
     */
    fun loadPackages() {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                packageRepository.getAllPackages().collect { packagesList ->
                    _packages.value = packagesList
                    Timber.d("✅ Loaded ${packagesList.size} packages")
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load packages")
                _error.value = "فشل في تحميل الباقات: ${e.message}"
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
                val stats = packageRepository.getPackageStatistics()
                _packageStatistics.value = stats
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load package statistics")
            }
        }
    }
    
    /**
     * تحميل الفئات المتاحة
     */
    fun loadCategories() {
        viewModelScope.launch {
            try {
                val categories = packageRepository.getAvailableCategories()
                _availableCategories.value = categories
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load categories")
            }
        }
    }
    
    /**
     * البحث في الباقات
     */
    fun searchPackages(
        query: String,
        category: String? = null,
        isFeatured: Boolean? = null,
        stockStatus: String? = null
    ) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                
                val results = if (query.isBlank() && category == null && isFeatured == null && stockStatus == null) {
                    packageRepository.getAllPackagesList()
                } else {
                    packageRepository.searchPackagesAdvanced(
                        query = if (query.isBlank()) null else query,
                        category = category,
                        isFeatured = isFeatured,
                        stockStatus = stockStatus
                    )
                }
                
                _packages.value = results
                Timber.d("🔍 Package search completed: ${results.size} results")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Package search failed")
                _error.value = "فشل في البحث: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * البحث بالباركود
     */
    suspend fun findPackageByBarcode(barcode: String): Package? {
        return try {
            packageRepository.getPackageByBarcode(barcode)
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to find package by barcode")
            null
        }
    }
    
    /**
     * حذف باقة
     */
    fun deletePackage(package: Package) {
        viewModelScope.launch {
            try {
                packageRepository.deletePackage(package)
                
                // إعادة تحميل البيانات
                loadPackages()
                loadStatistics()
                
                Timber.d("🗑️ Package deleted: ${package.name}")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to delete package")
                _error.value = "فشل في حذف الباقة: ${e.message}"
            }
        }
    }
    
    /**
     * تبديل تمييز الباقة
     */
    suspend fun togglePackageFeatured(packageId: String, isFeatured: Boolean) {
        try {
            packageRepository.togglePackageFeatured(packageId, isFeatured)
            loadPackages() // إعادة تحميل لعكس التغيير
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to toggle package featured")
            throw e
        }
    }
    
    /**
     * إضافة للمخزون
     */
    suspend fun addToStock(
        packageId: String,
        quantity: Int,
        notes: String? = null,
        unitCost: Double? = null
    ) {
        try {
            packageRepository.addToStock(packageId, quantity, notes, unitCost)
            loadPackages() // إعادة تحميل لعكس التغيير
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to add to stock")
            throw e
        }
    }
    
    /**
     * خصم من المخزون
     */
    suspend fun removeFromStock(
        packageId: String,
        quantity: Int,
        reason: String? = null
    ): Boolean {
        return try {
            val success = packageRepository.removeFromStock(packageId, quantity, reason)
            if (success) {
                loadPackages() // إعادة تحميل لعكس التغيير
            }
            success
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to remove from stock")
            throw e
        }
    }
    
    /**
     * التحقق من وجود مبيعات مرتبطة
     */
    suspend fun hasRelatedSales(packageId: String): Boolean {
        return try {
            val sales = saleRepository.getSalesByPackage(packageId)
            sales.isNotEmpty()
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to check related sales")
            false
        }
    }
    
    /**
     * مسح رسالة الخطأ
     */
    fun clearError() {
        _error.value = null
    }
    
    override fun onCleared() {
        super.onCleared()
        Timber.d("🧹 PackagesViewModel cleared")
    }
}