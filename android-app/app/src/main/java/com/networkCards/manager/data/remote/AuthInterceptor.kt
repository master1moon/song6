package com.networkCards.manager.data.remote

import android.content.Context
import android.content.SharedPreferences
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

/**
 * مُعترض المصادقة
 * يضيف رموز المصادقة للطلبات
 */
class AuthInterceptor @Inject constructor(
    private val context: Context
) : Interceptor {
    
    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
    }
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // الحصول على التوكن المحفوظ
        val token = prefs.getString("auth_token", null)
        
        // إضافة التوكن إذا كان متوفراً
        val newRequest = if (token != null) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .addHeader("X-App-Version", getAppVersion())
                .addHeader("X-Device-ID", getDeviceId())
                .build()
        } else {
            originalRequest.newBuilder()
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .addHeader("X-App-Version", getAppVersion())
                .addHeader("X-Device-ID", getDeviceId())
                .build()
        }
        
        val response = chain.proceed(newRequest)
        
        // معالجة انتهاء صلاحية التوكن
        if (response.code == 401 && token != null) {
            // حذف التوكن المنتهي الصلاحية
            prefs.edit().remove("auth_token").apply()
            
            // يمكن إضافة منطق تجديد التوكن هنا
        }
        
        return response
    }
    
    /**
     * حفظ التوكن
     */
    fun saveToken(token: String) {
        prefs.edit().putString("auth_token", token).apply()
    }
    
    /**
     * مسح التوكن
     */
    fun clearToken() {
        prefs.edit().remove("auth_token").apply()
    }
    
    /**
     * التحقق من وجود التوكن
     */
    fun hasToken(): Boolean {
        return prefs.getString("auth_token", null) != null
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
     * الحصول على معرف الجهاز
     */
    private fun getDeviceId(): String {
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ) ?: "unknown"
    }
}