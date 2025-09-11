package com.networkCards.manager.util

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import pub.devrel.easypermissions.EasyPermissions

/**
 * أداة إدارة الصلاحيات
 * تبسط طلب والتحقق من صلاحيات التطبيق
 */
object PermissionUtil {
    
    // رموز طلب الصلاحيات
    const val REQUEST_CODE_BASIC_PERMISSIONS = 1001
    const val REQUEST_CODE_CAMERA_PERMISSION = 1002
    const val REQUEST_CODE_PHONE_PERMISSION = 1003
    const val REQUEST_CODE_LOCATION_PERMISSION = 1004
    const val REQUEST_CODE_STORAGE_PERMISSION = 1005
    const val REQUEST_CODE_SMS_PERMISSION = 1006
    
    // قوائم الصلاحيات
    private val BASIC_PERMISSIONS = arrayOf(
        Manifest.permission.INTERNET,
        Manifest.permission.ACCESS_NETWORK_STATE,
        Manifest.permission.VIBRATE
    )
    
    private val CAMERA_PERMISSIONS = arrayOf(
        Manifest.permission.CAMERA
    )
    
    private val PHONE_PERMISSIONS = arrayOf(
        Manifest.permission.CALL_PHONE
    )
    
    private val LOCATION_PERMISSIONS = arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    )
    
    private val STORAGE_PERMISSIONS = arrayOf(
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    )
    
    private val SMS_PERMISSIONS = arrayOf(
        Manifest.permission.SEND_SMS
    )
    
    /**
     * التحقق من صلاحية واحدة
     */
    fun hasPermission(context: Context, permission: String): Boolean {
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * التحقق من مجموعة صلاحيات
     */
    fun hasPermissions(context: Context, permissions: Array<String>): Boolean {
        return permissions.all { hasPermission(context, it) }
    }
    
    /**
     * التحقق من الصلاحيات الأساسية
     */
    fun hasBasicPermissions(context: Context): Boolean {
        return hasPermissions(context, BASIC_PERMISSIONS)
    }
    
    /**
     * التحقق من صلاحية الكاميرا
     */
    fun hasCameraPermission(context: Context): Boolean {
        return hasPermissions(context, CAMERA_PERMISSIONS)
    }
    
    /**
     * التحقق من صلاحية الهاتف
     */
    fun hasPhonePermission(context: Context): Boolean {
        return hasPermissions(context, PHONE_PERMISSIONS)
    }
    
    /**
     * التحقق من صلاحية الموقع
     */
    fun hasLocationPermission(context: Context): Boolean {
        return hasPermissions(context, LOCATION_PERMISSIONS)
    }
    
    /**
     * التحقق من صلاحية التخزين
     */
    fun hasStoragePermission(context: Context): Boolean {
        return hasPermissions(context, STORAGE_PERMISSIONS)
    }
    
    /**
     * التحقق من صلاحية الرسائل
     */
    fun hasSmsPermission(context: Context): Boolean {
        return hasPermissions(context, SMS_PERMISSIONS)
    }
    
    /**
     * طلب الصلاحيات الأساسية
     */
    fun requestBasicPermissions(activity: Activity, callback: (Boolean) -> Unit) {
        if (hasBasicPermissions(activity)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "التطبيق يحتاج هذه الصلاحيات للعمل بشكل صحيح",
            REQUEST_CODE_BASIC_PERMISSIONS,
            *BASIC_PERMISSIONS
        )
    }
    
    /**
     * طلب صلاحية الكاميرا
     */
    fun requestCameraPermission(activity: Activity, callback: (Boolean) -> Unit) {
        if (hasCameraPermission(activity)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "صلاحية الكاميرا مطلوبة لمسح الباركود",
            REQUEST_CODE_CAMERA_PERMISSION,
            *CAMERA_PERMISSIONS
        )
    }
    
    /**
     * طلب صلاحية الهاتف
     */
    fun requestPhonePermission(activity: Activity, callback: (Boolean) -> Unit) {
        if (hasPhonePermission(activity)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "صلاحية الاتصال مطلوبة للاتصال بالعملاء",
            REQUEST_CODE_PHONE_PERMISSION,
            *PHONE_PERMISSIONS
        )
    }
    
    /**
     * طلب صلاحية الموقع
     */
    fun requestLocationPermission(activity: Activity, callback: (Boolean) -> Unit) {
        if (hasLocationPermission(activity)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "صلاحية الموقع مطلوبة لحفظ مواقع المحلات",
            REQUEST_CODE_LOCATION_PERMISSION,
            *LOCATION_PERMISSIONS
        )
    }
    
    /**
     * طلب صلاحية التخزين
     */
    fun requestStoragePermission(activity: Activity, callback: (Boolean) -> Unit) {
        if (hasStoragePermission(activity)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "صلاحية التخزين مطلوبة لحفظ التقارير والملفات",
            REQUEST_CODE_STORAGE_PERMISSION,
            *STORAGE_PERMISSIONS
        )
    }
    
    /**
     * طلب صلاحية الرسائل
     */
    fun requestSmsPermission(activity: Activity, callback: (Boolean) -> Unit) {
        if (hasSmsPermission(activity)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "صلاحية الرسائل مطلوبة لإرسال رسائل للعملاء",
            REQUEST_CODE_SMS_PERMISSION,
            *SMS_PERMISSIONS
        )
    }
    
    /**
     * طلب جميع الصلاحيات المتقدمة
     */
    fun requestAllPermissions(activity: Activity, callback: (Boolean) -> Unit) {
        val allPermissions = BASIC_PERMISSIONS + CAMERA_PERMISSIONS + PHONE_PERMISSIONS + 
                           LOCATION_PERMISSIONS + STORAGE_PERMISSIONS + SMS_PERMISSIONS
        
        if (hasPermissions(activity, allPermissions)) {
            callback(true)
            return
        }
        
        EasyPermissions.requestPermissions(
            activity,
            "التطبيق يحتاج هذه الصلاحيات للاستفادة من جميع الميزات",
            REQUEST_CODE_BASIC_PERMISSIONS,
            *allPermissions
        )
    }
    
    /**
     * معالجة نتائج طلب الصلاحيات
     */
    fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
        activity: Activity
    ) {
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, activity)
    }
    
    /**
     * التحقق من رفض الصلاحية نهائياً
     */
    fun isPermissionPermanentlyDenied(activity: Activity, permission: String): Boolean {
        return EasyPermissions.somePermissionPermanentlyDenied(activity, listOf(permission))
    }
    
    /**
     * فتح إعدادات التطبيق
     */
    fun openAppSettings(activity: Activity) {
        val intent = android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = android.net.Uri.fromParts("package", activity.packageName, null)
        activity.startActivity(intent)
    }
    
    /**
     * إظهار حوار توضيح الصلاحية
     */
    fun showPermissionRationale(
        activity: Activity,
        title: String,
        message: String,
        onPositive: () -> Unit,
        onNegative: () -> Unit = {}
    ) {
        androidx.appcompat.app.AlertDialog.Builder(activity)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("موافق") { _, _ -> onPositive() }
            .setNegativeButton("إلغاء") { _, _ -> onNegative() }
            .setCancelable(false)
            .show()
    }
    
    /**
     * الحصول على قائمة الصلاحيات المفقودة
     */
    fun getMissingPermissions(context: Context, permissions: Array<String>): List<String> {
        return permissions.filter { !hasPermission(context, it) }
    }
    
    /**
     * الحصول على وصف الصلاحية بالعربية
     */
    fun getPermissionDescription(permission: String): String {
        return when (permission) {
            Manifest.permission.CAMERA -> "الكاميرا - لمسح الباركود"
            Manifest.permission.CALL_PHONE -> "الاتصال - للاتصال بالعملاء"
            Manifest.permission.ACCESS_FINE_LOCATION -> "الموقع الدقيق - لحفظ مواقع المحلات"
            Manifest.permission.ACCESS_COARSE_LOCATION -> "الموقع التقريبي - لحفظ مواقع المحلات"
            Manifest.permission.READ_EXTERNAL_STORAGE -> "قراءة الملفات - لاستيراد البيانات"
            Manifest.permission.WRITE_EXTERNAL_STORAGE -> "كتابة الملفات - لحفظ التقارير"
            Manifest.permission.SEND_SMS -> "الرسائل - لإرسال رسائل للعملاء"
            Manifest.permission.VIBRATE -> "الاهتزاز - للتنبيهات"
            Manifest.permission.INTERNET -> "الإنترنت - للمزامنة"
            Manifest.permission.ACCESS_NETWORK_STATE -> "حالة الشبكة - لمراقبة الاتصال"
            else -> permission
        }
    }
}