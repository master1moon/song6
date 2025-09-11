package com.networkCards.manager.ui.store

import android.net.Uri
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.Sale
import com.networkCards.manager.data.model.Payment
import com.networkCards.manager.data.repository.*
import com.networkCards.manager.util.ExcelExporter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.Date
import javax.inject.Inject

/**
 * ViewModel لتفاصيل المحل
 * يدير بيانات وحالة شاشة تفاصيل المحل
 */
@HiltViewModel
class StoreDetailsViewModel @Inject constructor(
    private val storeRepository: StoreRepository,
    private val saleRepository: SaleRepository,
    private val paymentRepository: PaymentRepository,
    private val excelExporter: ExcelExporter
) : ViewModel() {
    
    // بيانات المحل
    private val _store = MutableLiveData<Store?>()
    val store: LiveData<Store?> = _store
    
    // مبيعات المحل
    private val _storeSales = MutableLiveData<List<Sale>>()
    val storeSales: LiveData<List<Sale>> = _storeSales
    
    // مدفوعات المحل
    private val _storePayments = MutableLiveData<List<Payment>>()
    val storePayments: LiveData<List<Payment>> = _storePayments
    
    // إحصائيات المحل
    private val _storeStatistics = MutableLiveData<StoreStatistics>()
    val storeStatistics: LiveData<StoreStatistics> = _storeStatistics
    
    // حالة التحميل
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // الأخطاء
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private var currentStoreId: String? = null
    
    /**
     * تحميل تفاصيل المحل
     */
    fun loadStoreDetails(storeId: String) {
        currentStoreId = storeId
        
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                // تحميل بيانات المحل
                val storeData = storeRepository.getStoreById(storeId)
                _store.value = storeData
                
                if (storeData != null) {
                    // تحميل المبيعات والمدفوعات بشكل متوازي
                    launch { loadStoreSales(storeId) }
                    launch { loadStorePayments(storeId) }
                    launch { loadStoreStatistics(storeId) }
                    
                    Timber.d("✅ Store details loaded: ${storeData.name}")
                } else {
                    _error.value = "المحل غير موجود"
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load store details")
                _error.value = "فشل في تحميل تفاصيل المحل: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * تحميل مبيعات المحل
     */
    private suspend fun loadStoreSales(storeId: String) {
        try {
            saleRepository.getSalesByStore(storeId).collect { sales ->
                _storeSales.value = sales
                Timber.d("✅ Loaded ${sales.size} sales for store")
            }
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to load store sales")
        }
    }
    
    /**
     * تحميل مدفوعات المحل
     */
    private suspend fun loadStorePayments(storeId: String) {
        try {
            paymentRepository.getPaymentsByStore(storeId).collect { payments ->
                _storePayments.value = payments
                Timber.d("✅ Loaded ${payments.size} payments for store")
            }
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to load store payments")
        }
    }
    
    /**
     * تحميل إحصائيات المحل
     */
    private suspend fun loadStoreStatistics(storeId: String) {
        try {
            val sales = saleRepository.getSalesByStore(storeId)
            val payments = paymentRepository.getPaymentsByStoreList(storeId)
            
            val totalSales = sales.sumOf { it.total }
            val totalPayments = payments.sumOf { it.amount }
            val salesCount = sales.size
            val paymentsCount = payments.size
            val averageSaleValue = if (salesCount > 0) totalSales / salesCount else 0.0
            val averagePaymentValue = if (paymentsCount > 0) totalPayments / paymentsCount else 0.0
            val lastSaleDate = sales.maxByOrNull { it.date }?.date
            val lastPaymentDate = payments.maxByOrNull { it.date }?.date
            
            val statistics = StoreStatistics(
                totalSales = totalSales,
                totalPayments = totalPayments,
                salesCount = salesCount,
                paymentsCount = paymentsCount,
                averageSaleValue = averageSaleValue,
                averagePaymentValue = averagePaymentValue,
                lastSaleDate = lastSaleDate,
                lastPaymentDate = lastPaymentDate
            )
            
            _storeStatistics.value = statistics
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to load store statistics")
        }
    }
    
    /**
     * تصدير بيانات المحل
     */
    suspend fun exportStoreData(storeId: String): Uri? {
        return try {
            _isLoading.value = true
            
            val store = storeRepository.getStoreById(storeId) ?: return null
            val sales = saleRepository.getSalesByStore(storeId)
            val payments = paymentRepository.getPaymentsByStoreList(storeId)
            
            val file = excelExporter.exportStoreData(store, sales, payments)
            
            Timber.d("📊 Store data exported successfully")
            file
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Store data export failed")
            _error.value = "فشل في تصدير بيانات المحل: ${e.message}"
            null
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * حذف المحل
     */
    fun deleteStore(store: Store) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                
                storeRepository.deleteStore(store)
                
                Timber.d("🗑️ Store deleted: ${store.name}")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to delete store")
                _error.value = "فشل في حذف المحل: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * تحديث بيانات المحل
     */
    fun refreshStoreData() {
        currentStoreId?.let { storeId ->
            loadStoreDetails(storeId)
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
        Timber.d("🧹 StoreDetailsViewModel cleared")
    }
}