package com.networkCards.manager.util

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * أداة مراقبة الشبكة
 * تدير حالة الاتصال بالإنترنت
 */
@Singleton
class NetworkUtil @Inject constructor(
    private val context: Context
) {
    
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    
    /**
     * التحقق من توفر الاتصال بالإنترنت
     */
    fun isNetworkAvailable(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        
        return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
               capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
               capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
    }
    
    /**
     * التحقق من نوع الاتصال
     */
    fun getNetworkType(): NetworkType {
        if (!isNetworkAvailable()) return NetworkType.NONE
        
        val network = connectivityManager.activeNetwork ?: return NetworkType.NONE
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return NetworkType.NONE
        
        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> NetworkType.WIFI
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> NetworkType.CELLULAR
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> NetworkType.ETHERNET
            else -> NetworkType.OTHER
        }
    }
    
    /**
     * مراقبة حالة الشبكة
     */
    fun observeNetworkStatus(context: Context): Flow<Boolean> = callbackFlow {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(true)
            }
            
            override fun onLost(network: Network) {
                trySend(false)
            }
            
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                val hasInternet = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                                networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
                trySend(hasInternet)
            }
        }
        
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        
        connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
        
        // إرسال الحالة الحالية
        trySend(isNetworkAvailable())
        
        awaitClose {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        }
    }
    
    /**
     * التحقق من قوة الإشارة
     */
    fun getSignalStrength(): NetworkSignalStrength {
        if (!isNetworkAvailable()) return NetworkSignalStrength.NO_SIGNAL
        
        val network = connectivityManager.activeNetwork ?: return NetworkSignalStrength.NO_SIGNAL
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return NetworkSignalStrength.NO_SIGNAL
        
        // هذا تقدير تقريبي - قد يحتاج تحسين
        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> {
                // للـ WiFi، افتراض إشارة جيدة إذا كان متصل
                NetworkSignalStrength.EXCELLENT
            }
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                // للشبكة الخلوية، تحتاج API أكثر تفصيلاً
                NetworkSignalStrength.GOOD
            }
            else -> NetworkSignalStrength.WEAK
        }
    }
    
    /**
     * التحقق من سرعة الاتصال (تقديري)
     */
    fun getNetworkSpeed(): NetworkSpeed {
        if (!isNetworkAvailable()) return NetworkSpeed.NO_CONNECTION
        
        val networkType = getNetworkType()
        
        return when (networkType) {
            NetworkType.WIFI -> NetworkSpeed.FAST
            NetworkType.CELLULAR -> NetworkSpeed.MEDIUM
            NetworkType.ETHERNET -> NetworkSpeed.VERY_FAST
            else -> NetworkSpeed.SLOW
        }
    }
    
    /**
     * التحقق من إمكانية الوصول للخادم
     */
    suspend fun isServerReachable(serverUrl: String): Boolean {
        return try {
            val url = java.net.URL(serverUrl)
            val connection = url.openConnection()
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            connection.connect()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * تقدير استهلاك البيانات
     */
    fun estimateDataUsage(operationType: DataOperationType): Long {
        return when (operationType) {
            DataOperationType.SYNC_STORES -> 50 * 1024 // 50 KB تقريباً
            DataOperationType.SYNC_PACKAGES -> 30 * 1024 // 30 KB
            DataOperationType.SYNC_SALES -> 100 * 1024 // 100 KB
            DataOperationType.SYNC_PAYMENTS -> 50 * 1024 // 50 KB
            DataOperationType.UPLOAD_BACKUP -> 500 * 1024 // 500 KB
            DataOperationType.DOWNLOAD_BACKUP -> 500 * 1024 // 500 KB
            DataOperationType.SYNC_ALL -> 1024 * 1024 // 1 MB
        }
    }
    
    /**
     * التحقق من توفر البيانات للعملية
     */
    fun hasEnoughDataForOperation(operationType: DataOperationType): Boolean {
        // هذا يمكن تحسينه بمراقبة استهلاك البيانات الفعلي
        val networkType = getNetworkType()
        val estimatedUsage = estimateDataUsage(operationType)
        
        return when (networkType) {
            NetworkType.WIFI -> true // WiFi عادة لا محدود
            NetworkType.CELLULAR -> estimatedUsage < 10 * 1024 * 1024 // أقل من 10 MB
            NetworkType.ETHERNET -> true
            else -> false
        }
    }
}

/**
 * أنواع الشبكة
 */
enum class NetworkType {
    NONE,
    WIFI,
    CELLULAR,
    ETHERNET,
    OTHER
}

/**
 * قوة الإشارة
 */
enum class NetworkSignalStrength {
    NO_SIGNAL,
    WEAK,
    FAIR,
    GOOD,
    EXCELLENT
}

/**
 * سرعة الشبكة
 */
enum class NetworkSpeed {
    NO_CONNECTION,
    SLOW,
    MEDIUM,
    FAST,
    VERY_FAST
}

/**
 * أنواع عمليات البيانات
 */
enum class DataOperationType {
    SYNC_STORES,
    SYNC_PACKAGES,
    SYNC_SALES,
    SYNC_PAYMENTS,
    UPLOAD_BACKUP,
    DOWNLOAD_BACKUP,
    SYNC_ALL
}