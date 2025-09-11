package com.networkCards.manager.work

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.*
import com.networkCards.manager.data.repository.SyncRepository
import com.networkCards.manager.service.NotificationManager
import com.networkCards.manager.util.NetworkUtil
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import timber.log.Timber
import java.util.concurrent.TimeUnit

/**
 * عامل المزامنة في الخلفية
 * يدير المزامنة التلقائية للبيانات
 */
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val syncRepository: SyncRepository,
    private val notificationManager: NotificationManager,
    private val networkUtil: NetworkUtil
) : CoroutineWorker(context, workerParams) {
    
    override suspend fun doWork(): Result {
        return try {
            // التحقق من توفر الاتصال
            if (!networkUtil.isNetworkAvailable()) {
                Timber.w("⚠️ No network available for sync")
                return Result.retry()
            }
            
            Timber.d("🔄 Starting background sync...")
            
            // تنفيذ المزامنة
            val syncResult = syncRepository.syncAllData()
            
            when (syncResult) {
                is SyncResult.Success -> {
                    Timber.d("✅ Background sync completed successfully")
                    notificationManager.showSyncCompleteNotification(true, syncResult.message)
                    Result.success()
                }
                
                is SyncResult.Error -> {
                    Timber.e("❌ Background sync failed: ${syncResult.message}")
                    notificationManager.showSyncCompleteNotification(false, syncResult.message)
                    Result.failure()
                }
                
                is SyncResult.Partial -> {
                    Timber.w("⚠️ Background sync partial: ${syncResult.message}")
                    notificationManager.showSyncCompleteNotification(true, "مزامنة جزئية: ${syncResult.message}")
                    Result.success()
                }
            }
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Sync worker exception")
            notificationManager.showSyncCompleteNotification(false, "خطأ في المزامنة: ${e.message}")
            Result.failure()
        }
    }
    
    companion object {
        const val WORK_NAME = "sync_work"
        
        /**
         * جدولة المزامنة الدورية
         */
        fun schedulePeriodicSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(true)
                .build()
            
            val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
                1, TimeUnit.HOURS // كل ساعة
            )
                .setConstraints(constraints)
                .setBackoffCriteria(
                    BackoffPolicy.LINEAR,
                    WorkRequest.MIN_BACKOFF_MILLIS,
                    TimeUnit.MILLISECONDS
                )
                .build()
            
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    WORK_NAME,
                    ExistingPeriodicWorkPolicy.KEEP,
                    syncRequest
                )
            
            Timber.d("📅 Periodic sync scheduled")
        }
        
        /**
         * إلغاء المزامنة الدورية
         */
        fun cancelPeriodicSync(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
            Timber.d("🛑 Periodic sync cancelled")
        }
        
        /**
         * تشغيل مزامنة فورية
         */
        fun runImmediateSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            
            val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()
            
            WorkManager.getInstance(context).enqueue(syncRequest)
            
            Timber.d("⚡ Immediate sync requested")
        }
    }
}