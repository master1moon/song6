package com.networkCards.manager.ui.store

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.repository.StoreRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel لإضافة/تعديل المحل
 * يدير حالة وعمليات إضافة وتعديل المحلات
 */
@HiltViewModel
class AddEditStoreViewModel @Inject constructor(
    private val storeRepository: StoreRepository
) : ViewModel() {
    
    // نتيجة الحفظ
    private val _saveResult = MutableLiveData<Result<Store>>()
    val saveResult: LiveData<Result<Store>> = _saveResult
    
    // حالة التحميل
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // الأخطاء
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    /**
     * إدراج محل جديد
     */
    fun insertStore(store: Store) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                val storeId = storeRepository.insertStore(store)
                
                if (storeId > 0) {
                    _saveResult.value = Result.success(store)
                    Timber.d("✅ Store inserted successfully: ${store.name}")
                } else {
                    _saveResult.value = Result.failure(Exception("فشل في حفظ المحل"))
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to insert store")
                _saveResult.value = Result.failure(e)
                _error.value = "فشل في إضافة المحل: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * تحديث محل موجود
     */
    fun updateStore(store: Store) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                val rowsAffected = storeRepository.updateStore(store)
                
                if (rowsAffected > 0) {
                    _saveResult.value = Result.success(store)
                    Timber.d("✅ Store updated successfully: ${store.name}")
                } else {
                    _saveResult.value = Result.failure(Exception("لم يتم العثور على المحل للتحديث"))
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to update store")
                _saveResult.value = Result.failure(e)
                _error.value = "فشل في تحديث المحل: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * حذف محل
     */
    fun deleteStore(store: Store) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                val rowsAffected = storeRepository.deleteStore(store)
                
                if (rowsAffected > 0) {
                    Timber.d("✅ Store deleted successfully: ${store.name}")
                } else {
                    throw Exception("لم يتم العثور على المحل للحذف")
                }
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to delete store")
                _error.value = "فشل في حذف المحل: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * التحقق من تكرار اسم المحل
     */
    suspend fun isStoreNameExists(name: String, excludeStoreId: String? = null): Boolean {
        return try {
            val stores = storeRepository.getAllStoresList()
            stores.any { store ->
                store.name.equals(name, ignoreCase = true) && store.id != excludeStoreId
            }
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to check store name existence")
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
        Timber.d("🧹 AddEditStoreViewModel cleared")
    }
}