package com.networkCards.manager.ui.main

import android.net.Uri
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.data.repository.*
import com.networkCards.manager.util.FileManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel للشاشة الرئيسية
 * يدير الحالة العامة للتطبيق والعمليات المشتركة
 */
@HiltViewModel
class MainViewModel @Inject constructor(
    private val syncRepository: SyncRepository,
    private val packageRepository: PackageRepository,
    private val fileManager: FileManager
) : ViewModel() {
    
    // حالة المزامنة
    private val _syncStatus = MutableLiveData<SyncStatus?>()
    val syncStatus: LiveData<SyncStatus?> = _syncStatus
    
    // حالة التحميل العامة
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // الأخطاء العامة
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    /**
     * مزامنة جميع البيانات
     */
    suspend fun syncData() {
        try {
            _syncStatus.value = SyncStatus.InProgress
            _isLoading.value = true
            
            val result = syncRepository.syncAllData()
            
            when (result) {
                is SyncResult.Success -> {
                    _syncStatus.value = SyncStatus.Success
                    Timber.d("✅ Full sync completed successfully")
                }
                is SyncResult.Error -> {
                    _syncStatus.value = SyncStatus.Error(result.message)
                    Timber.e("❌ Sync failed: ${result.message}")
                }
                is SyncResult.Partial -> {
                    _syncStatus.value = SyncStatus.Error("مزامنة جزئية: ${result.message}")
                    Timber.w("⚠️ Partial sync: ${result.message}")
                }
            }
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Sync exception")
            _syncStatus.value = SyncStatus.Error("فشلت المزامنة: ${e.message}")
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * البحث عن باقة بالباركود
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
     * إنشاء نسخة احتياطية شاملة
     */
    suspend fun createBackup(): Uri? {
        return try {
            _isLoading.value = true
            
            val backupFile = fileManager.createFullBackup()
            
            Timber.d("💾 Backup created successfully")
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
        Timber.d("🧹 MainViewModel cleared")
    }
}

/**
 * حالات المزامنة
 */
sealed class SyncStatus {
    object InProgress : SyncStatus()
    object Success : SyncStatus()
    data class Error(val message: String) : SyncStatus()
}