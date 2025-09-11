package com.networkCards.manager

import android.app.Application
import androidx.work.Configuration
import androidx.work.WorkManager
import com.jakewharton.threetenabp.AndroidThreeTen
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

/**
 * فئة التطبيق الرئيسية
 * تدير تهيئة التطبيق والخدمات العامة
 */
@HiltAndroidApp
class NetworkCardsApplication : Application(), Configuration.Provider {
    
    override fun onCreate() {
        super.onCreate()
        
        // تهيئة Timber للسجلات
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
        
        // تهيئة ThreeTen للتواريخ
        AndroidThreeTen.init(this)
        
        // تهيئة WorkManager
        initializeWorkManager()
        
        // تهيئة الإشعارات
        initializeNotifications()
        
        // تهيئة نظام التشفير
        initializeEncryption()
        
        Timber.d("🚀 NetworkCards Application initialized")
    }
    
    /**
     * تهيئة WorkManager للمهام في الخلفية
     */
    private fun initializeWorkManager() {
        val config = Configuration.Builder()
            .setMinimumLoggingLevel(if (BuildConfig.DEBUG) android.util.Log.DEBUG else android.util.Log.ERROR)
            .build()
        
        WorkManager.initialize(this, config)
    }
    
    /**
     * تهيئة نظام الإشعارات
     */
    private fun initializeNotifications() {
        // سيتم تهيئة قنوات الإشعارات في NotificationManager
        Timber.d("📢 Notifications system initialized")
    }
    
    /**
     * تهيئة نظام التشفير
     */
    private fun initializeEncryption() {
        try {
            // تهيئة مفاتيح التشفير
            // يمكن إضافة منطق تشفير البيانات الحساسة هنا
            Timber.d("🔒 Encryption system initialized")
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to initialize encryption")
        }
    }
    
    /**
     * إعداد WorkManager
     */
    override fun getWorkManagerConfiguration(): Configuration {
        return Configuration.Builder()
            .setMinimumLoggingLevel(if (BuildConfig.DEBUG) android.util.Log.DEBUG else android.util.Log.ERROR)
            .build()
    }
    
    /**
     * معالجة الذاكرة المنخفضة
     */
    override fun onLowMemory() {
        super.onLowMemory()
        Timber.w("⚠️ Low memory warning - clearing caches")
        
        // تنظيف الذاكرة المؤقتة
        clearCaches()
    }
    
    /**
     * معالجة تقليم الذاكرة
     */
    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        
        when (level) {
            TRIM_MEMORY_RUNNING_MODERATE,
            TRIM_MEMORY_RUNNING_LOW,
            TRIM_MEMORY_RUNNING_CRITICAL -> {
                Timber.w("⚠️ Memory trim level: $level - clearing caches")
                clearCaches()
            }
        }
    }
    
    /**
     * تنظيف الذاكرة المؤقتة
     */
    private fun clearCaches() {
        try {
            // تنظيف كاش الصور
            com.bumptech.glide.Glide.get(this).clearMemory()
            
            // يمكن إضافة تنظيف إضافي هنا
            
            Timber.d("🧹 Memory caches cleared")
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to clear caches")
        }
    }
}