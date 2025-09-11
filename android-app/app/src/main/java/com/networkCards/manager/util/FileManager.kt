package com.networkCards.manager.util

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.networkCards.manager.data.model.*
import dagger.hilt.android.qualifiers.ApplicationContext
import timber.log.Timber
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مدير الملفات
 * يدير إنشاء وحفظ ومشاركة الملفات
 */
@Singleton
class FileManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private val gson = GsonBuilder()
        .setPrettyPrinting()
        .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .create()
    
    private val dateFormatter = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.getDefault())
    
    /**
     * إنشاء نسخة احتياطية شاملة
     */
    suspend fun createFullBackup(): Uri {
        val backupData = BackupData(
            version = "1.0.0",
            timestamp = System.currentTimeMillis(),
            deviceId = getDeviceId(),
            appVersion = getAppVersion(),
            data = gatherAllData(),
            metadata = createBackupMetadata()
        )
        
        val fileName = "network_cards_backup_${dateFormatter.format(Date())}.json"
        val file = createFileInExternalStorage("backups", fileName)
        
        FileOutputStream(file).use { fos ->
            fos.write(gson.toJson(backupData).toByteArray())
        }
        
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
    }
    
    /**
     * إنشاء نسخة احتياطية للمحلات فقط
     */
    suspend fun createStoresBackup(stores: List<Store>): Uri {
        val backupData = StoresBackupData(
            version = "1.0.0",
            timestamp = System.currentTimeMillis(),
            storesCount = stores.size,
            stores = stores,
            metadata = mapOf(
                "created_by" to "Network Cards App",
                "backup_type" to "stores_only",
                "device_id" to getDeviceId()
            )
        )
        
        val fileName = "stores_backup_${dateFormatter.format(Date())}.json"
        val file = createFileInExternalStorage("backups", fileName)
        
        FileOutputStream(file).use { fos ->
            fos.write(gson.toJson(backupData).toByteArray())
        }
        
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
    }
    
    /**
     * إنشاء ملف تقرير
     */
    suspend fun createReportFile(reportData: Any, reportName: String, format: ReportFormat): Uri {
        val fileName = "${reportName}_${dateFormatter.format(Date())}.${format.extension}"
        val file = createFileInExternalStorage("reports", fileName)
        
        when (format) {
            ReportFormat.JSON -> {
                FileOutputStream(file).use { fos ->
                    fos.write(gson.toJson(reportData).toByteArray())
                }
            }
            ReportFormat.CSV -> {
                // تنفيذ تصدير CSV
                createCSVReport(file, reportData)
            }
            ReportFormat.TXT -> {
                // تنفيذ تصدير نصي
                createTextReport(file, reportData)
            }
        }
        
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
    }
    
    /**
     * إنشاء ملف في التخزين الخارجي
     */
    private fun createFileInExternalStorage(directory: String, fileName: String): File {
        val dir = File(context.getExternalFilesDir(null), directory)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        
        return File(dir, fileName)
    }
    
    /**
     * جمع جميع البيانات
     */
    private suspend fun gatherAllData(): AllAppData {
        // هذا يتطلب حقن جميع المستودعات
        // للتبسيط، سنعيد بيانات فارغة مع إمكانية التحسين لاحقاً
        return AllAppData(
            stores = emptyList(),
            packages = emptyList(),
            sales = emptyList(),
            payments = emptyList(),
            expenses = emptyList(),
            inventory = emptyList()
        )
    }
    
    /**
     * إنشاء معلومات النسخة الاحتياطية
     */
    private fun createBackupMetadata(): Map<String, String> {
        return mapOf(
            "created_by" to "Network Cards App",
            "device_model" to android.os.Build.MODEL,
            "device_manufacturer" to android.os.Build.MANUFACTURER,
            "android_version" to android.os.Build.VERSION.RELEASE,
            "app_version" to getAppVersion(),
            "backup_format_version" to "1.0"
        )
    }
    
    /**
     * الحصول على معرف الجهاز
     */
    private fun getDeviceId(): String {
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: "unknown_device"
    }
    
    /**
     * الحصول على إصدار التطبيق
     */
    private fun getAppVersion(): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            packageInfo.versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }
    }
    
    /**
     * إنشاء تقرير CSV
     */
    private fun createCSVReport(file: File, data: Any) {
        // تنفيذ بسيط لتصدير CSV
        FileOutputStream(file).use { fos ->
            val csvContent = when (data) {
                is List<*> -> convertListToCSV(data)
                else -> "البيانات,القيمة\nنوع البيانات,${data::class.simpleName}"
            }
            fos.write(csvContent.toByteArray())
        }
    }
    
    /**
     * إنشاء تقرير نصي
     */
    private fun createTextReport(file: File, data: Any) {
        FileOutputStream(file).use { fos ->
            val textContent = "تقرير نظام إدارة كروت الشبكة\n" +
                    "تاريخ الإنشاء: ${Date()}\n" +
                    "=====================================\n\n" +
                    gson.toJson(data)
            fos.write(textContent.toByteArray())
        }
    }
    
    /**
     * تحويل قائمة لـ CSV
     */
    private fun convertListToCSV(list: List<*>): String {
        if (list.isEmpty()) return "لا توجد بيانات"
        
        val sb = StringBuilder()
        
        // إضافة رأس الجدول (تبسيط)
        sb.append("المعرف,الاسم,التاريخ,القيمة\n")
        
        // إضافة البيانات
        list.forEach { item ->
            when (item) {
                is Store -> sb.append("${item.id},${item.name},${item.createdAt},${item.balance}\n")
                is Package -> sb.append("${item.id},${item.name},${item.createdAt},${item.retailPrice}\n")
                is Sale -> sb.append("${item.id},بيع,${item.date},${item.total}\n")
                is Payment -> sb.append("${item.id},دفعة,${item.date},${item.amount}\n")
                else -> sb.append("$item\n")
            }
        }
        
        return sb.toString()
    }
    
    /**
     * مسح الملفات المؤقتة
     */
    fun cleanupTempFiles() {
        try {
            val tempDir = File(context.cacheDir, "temp")
            if (tempDir.exists()) {
                tempDir.deleteRecursively()
                Timber.d("🧹 Temporary files cleaned up")
            }
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to cleanup temp files")
        }
    }
    
    /**
     * الحصول على حجم مجلد
     */
    fun getDirectorySize(directoryName: String): Long {
        val dir = File(context.getExternalFilesDir(null), directoryName)
        return if (dir.exists()) {
            dir.walkTopDown().filter { it.isFile }.map { it.length() }.sum()
        } else {
            0L
        }
    }
}

/**
 * أشكال التقارير
 */
enum class ReportFormat(val extension: String) {
    JSON("json"),
    CSV("csv"),
    TXT("txt")
}

/**
 * بيانات النسخة الاحتياطية الشاملة
 */
data class BackupData(
    val version: String,
    val timestamp: Long,
    val deviceId: String,
    val appVersion: String,
    val data: AllAppData,
    val metadata: Map<String, String>
)

/**
 * بيانات النسخة الاحتياطية للمحلات
 */
data class StoresBackupData(
    val version: String,
    val timestamp: Long,
    val storesCount: Int,
    val stores: List<Store>,
    val metadata: Map<String, String>
)

/**
 * جميع بيانات التطبيق
 */
data class AllAppData(
    val stores: List<Store>,
    val packages: List<Package>,
    val sales: List<Sale>,
    val payments: List<Payment>,
    val expenses: List<Expense>,
    val inventory: List<Inventory>
)