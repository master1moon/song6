package com.networkCards.manager.data.remote

import com.networkCards.manager.data.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * خدمة API للتواصل مع الخادم
 * تدير جميع عمليات الشبكة والمزامنة
 */
interface ApiService {
    
    // ================ المحلات ================
    
    /**
     * الحصول على جميع المحلات
     */
    @GET("stores")
    suspend fun getAllStores(): Response<List<Store>>
    
    /**
     * الحصول على محل بالمعرف
     */
    @GET("stores/{id}")
    suspend fun getStore(@Path("id") storeId: String): Response<Store>
    
    /**
     * إضافة محل جديد
     */
    @POST("stores")
    suspend fun createStore(@Body store: Store): Response<Store>
    
    /**
     * تحديث محل
     */
    @PUT("stores/{id}")
    suspend fun updateStore(@Path("id") storeId: String, @Body store: Store): Response<Store>
    
    /**
     * حذف محل
     */
    @DELETE("stores/{id}")
    suspend fun deleteStore(@Path("id") storeId: String): Response<Unit>
    
    /**
     * رفع عدة محلات
     */
    @POST("stores/bulk")
    suspend fun uploadStores(@Body stores: List<Store>): Response<List<Store>>
    
    /**
     * مزامنة المحلات
     */
    @POST("stores/sync")
    suspend fun syncStores(@Body stores: List<Store>): Response<List<Store>>
    
    /**
     * الحصول على المحلات المحدثة
     */
    @GET("stores/updated")
    suspend fun getUpdatedStores(@Query("since") timestamp: Long): Response<List<Store>>
    
    // ================ الباقات ================
    
    /**
     * الحصول على جميع الباقات
     */
    @GET("packages")
    suspend fun getAllPackages(): Response<List<Package>>
    
    /**
     * الحصول على باقة بالمعرف
     */
    @GET("packages/{id}")
    suspend fun getPackage(@Path("id") packageId: String): Response<Package>
    
    /**
     * البحث بالباركود
     */
    @GET("packages/barcode/{barcode}")
    suspend fun getPackageByBarcode(@Path("barcode") barcode: String): Response<Package>
    
    /**
     * إضافة باقة جديدة
     */
    @POST("packages")
    suspend fun createPackage(@Body package: Package): Response<Package>
    
    /**
     * تحديث باقة
     */
    @PUT("packages/{id}")
    suspend fun updatePackage(@Path("id") packageId: String, @Body package: Package): Response<Package>
    
    /**
     * حذف باقة
     */
    @DELETE("packages/{id}")
    suspend fun deletePackage(@Path("id") packageId: String): Response<Unit>
    
    /**
     * رفع عدة باقات
     */
    @POST("packages/bulk")
    suspend fun uploadPackages(@Body packages: List<Package>): Response<List<Package>>
    
    /**
     * مزامنة الباقات
     */
    @POST("packages/sync")
    suspend fun syncPackages(@Body packages: List<Package>): Response<List<Package>>
    
    /**
     * الحصول على الباقات المحدثة
     */
    @GET("packages/updated")
    suspend fun getUpdatedPackages(@Query("since") timestamp: Long): Response<List<Package>>
    
    // ================ المبيعات ================
    
    /**
     * الحصول على جميع المبيعات
     */
    @GET("sales")
    suspend fun getAllSales(): Response<List<Sale>>
    
    /**
     * الحصول على مبيعات محل معين
     */
    @GET("sales/store/{storeId}")
    suspend fun getSalesByStore(@Path("storeId") storeId: String): Response<List<Sale>>
    
    /**
     * الحصول على مبيعات فترة معينة
     */
    @GET("sales/period")
    suspend fun getSalesInPeriod(
        @Query("from") fromDate: String,
        @Query("to") toDate: String
    ): Response<List<Sale>>
    
    /**
     * إضافة بيع جديد
     */
    @POST("sales")
    suspend fun createSale(@Body sale: Sale): Response<Sale>
    
    /**
     * تحديث بيع
     */
    @PUT("sales/{id}")
    suspend fun updateSale(@Path("id") saleId: String, @Body sale: Sale): Response<Sale>
    
    /**
     * حذف بيع
     */
    @DELETE("sales/{id}")
    suspend fun deleteSale(@Path("id") saleId: String): Response<Unit>
    
    /**
     * رفع عدة مبيعات
     */
    @POST("sales/bulk")
    suspend fun uploadSales(@Body sales: List<Sale>): Response<List<Sale>>
    
    /**
     * مزامنة المبيعات
     */
    @POST("sales/sync")
    suspend fun syncSales(@Body sales: List<Sale>): Response<List<Sale>>
    
    /**
     * الحصول على المبيعات الجديدة
     */
    @GET("sales/new")
    suspend fun getNewSales(@Query("since") timestamp: Long): Response<List<Sale>>
    
    // ================ المدفوعات ================
    
    /**
     * الحصول على جميع المدفوعات
     */
    @GET("payments")
    suspend fun getAllPayments(): Response<List<Payment>>
    
    /**
     * الحصول على مدفوعات محل معين
     */
    @GET("payments/store/{storeId}")
    suspend fun getPaymentsByStore(@Path("storeId") storeId: String): Response<List<Payment>>
    
    /**
     * إضافة دفعة جديدة
     */
    @POST("payments")
    suspend fun createPayment(@Body payment: Payment): Response<Payment>
    
    /**
     * تحديث دفعة
     */
    @PUT("payments/{id}")
    suspend fun updatePayment(@Path("id") paymentId: String, @Body payment: Payment): Response<Payment>
    
    /**
     * حذف دفعة
     */
    @DELETE("payments/{id}")
    suspend fun deletePayment(@Path("id") paymentId: String): Response<Unit>
    
    /**
     * رفع عدة مدفوعات
     */
    @POST("payments/bulk")
    suspend fun uploadPayments(@Body payments: List<Payment>): Response<List<Payment>>
    
    /**
     * مزامنة المدفوعات
     */
    @POST("payments/sync")
    suspend fun syncPayments(@Body payments: List<Payment>): Response<List<Payment>>
    
    /**
     * الحصول على المدفوعات الجديدة
     */
    @GET("payments/new")
    suspend fun getNewPayments(@Query("since") timestamp: Long): Response<List<Payment>>
    
    // ================ المصروفات ================
    
    /**
     * الحصول على جميع المصروفات
     */
    @GET("expenses")
    suspend fun getAllExpenses(): Response<List<Expense>>
    
    /**
     * إضافة مصروف جديد
     */
    @POST("expenses")
    suspend fun createExpense(@Body expense: Expense): Response<Expense>
    
    /**
     * تحديث مصروف
     */
    @PUT("expenses/{id}")
    suspend fun updateExpense(@Path("id") expenseId: String, @Body expense: Expense): Response<Expense>
    
    /**
     * حذف مصروف
     */
    @DELETE("expenses/{id}")
    suspend fun deleteExpense(@Path("id") expenseId: String): Response<Unit>
    
    /**
     * مزامنة المصروفات
     */
    @POST("expenses/sync")
    suspend fun syncExpenses(@Body expenses: List<Expense>): Response<List<Expense>>
    
    // ================ المخزون ================
    
    /**
     * الحصول على حركات المخزون
     */
    @GET("inventory")
    suspend fun getAllInventoryMovements(): Response<List<Inventory>>
    
    /**
     * الحصول على حركات مخزون باقة معينة
     */
    @GET("inventory/package/{packageId}")
    suspend fun getInventoryMovementsByPackage(@Path("packageId") packageId: String): Response<List<Inventory>>
    
    /**
     * إضافة حركة مخزون
     */
    @POST("inventory")
    suspend fun createInventoryMovement(@Body inventory: Inventory): Response<Inventory>
    
    /**
     * مزامنة حركات المخزون
     */
    @POST("inventory/sync")
    suspend fun syncInventoryMovements(@Body movements: List<Inventory>): Response<List<Inventory>>
    
    // ================ التقارير ================
    
    /**
     * الحصول على تقرير الأرباح والخسائر
     */
    @GET("reports/profit-loss")
    suspend fun getProfitLossReport(
        @Query("from") fromDate: String,
        @Query("to") toDate: String
    ): Response<ProfitLossReport>
    
    /**
     * الحصول على تقرير الديون
     */
    @GET("reports/debt")
    suspend fun getDebtReport(): Response<DebtReport>
    
    /**
     * الحصول على تقرير المخزون
     */
    @GET("reports/inventory")
    suspend fun getInventoryReport(): Response<InventoryReport>
    
    /**
     * الحصول على إحصائيات عامة
     */
    @GET("reports/dashboard")
    suspend fun getDashboardStatistics(): Response<DashboardStatistics>
    
    // ================ المزامنة ================
    
    /**
     * مزامنة جميع البيانات
     */
    @POST("sync/all")
    suspend fun syncAllData(@Body syncRequest: SyncRequest): Response<SyncResponse>
    
    /**
     * التحقق من حالة الخادم
     */
    @GET("health")
    suspend fun checkServerHealth(): Response<HealthStatus>
    
    /**
     * الحصول على إصدار API
     */
    @GET("version")
    suspend fun getApiVersion(): Response<ApiVersion>
    
    // ================ النسخ الاحتياطي ================
    
    /**
     * رفع نسخة احتياطية
     */
    @POST("backup/upload")
    suspend fun uploadBackup(@Body backupData: BackupData): Response<BackupResponse>
    
    /**
     * تحميل نسخة احتياطية
     */
    @GET("backup/download")
    suspend fun downloadBackup(): Response<BackupData>
    
    /**
     * الحصول على قائمة النسخ الاحتياطية
     */
    @GET("backup/list")
    suspend fun getBackupList(): Response<List<BackupInfo>>
    
    // ================ المصادقة (اختيارية) ================
    
    /**
     * تسجيل الدخول
     */
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    /**
     * تسجيل الخروج
     */
    @POST("auth/logout")
    suspend fun logout(): Response<Unit>
    
    /**
     * تجديد التوكن
     */
    @POST("auth/refresh")
    suspend fun refreshToken(@Body refreshRequest: RefreshTokenRequest): Response<AuthResponse>
}

// ================ نماذج البيانات للAPI ================

/**
 * طلب المزامنة
 */
data class SyncRequest(
    val lastSyncTime: Long,
    val deviceId: String,
    val appVersion: String,
    val data: SyncData
)

/**
 * بيانات المزامنة
 */
data class SyncData(
    val stores: List<Store>,
    val packages: List<Package>,
    val sales: List<Sale>,
    val payments: List<Payment>,
    val expenses: List<Expense>,
    val inventory: List<Inventory>
)

/**
 * استجابة المزامنة
 */
data class SyncResponse(
    val success: Boolean,
    val message: String,
    val syncTime: Long,
    val data: SyncData?,
    val conflicts: List<ConflictInfo>?
)

/**
 * معلومات التضارب
 */
data class ConflictInfo(
    val entityType: String,
    val entityId: String,
    val localVersion: Long,
    val remoteVersion: Long,
    val resolution: String
)

/**
 * حالة الخادم
 */
data class HealthStatus(
    val status: String,
    val timestamp: Long,
    val version: String,
    val database: String
)

/**
 * إصدار API
 */
data class ApiVersion(
    val version: String,
    val buildNumber: Int,
    val releaseDate: String,
    val features: List<String>
)

/**
 * بيانات النسخة الاحتياطية
 */
data class BackupData(
    val version: String,
    val timestamp: Long,
    val deviceId: String,
    val data: SyncData,
    val checksum: String
)

/**
 * استجابة النسخة الاحتياطية
 */
data class BackupResponse(
    val success: Boolean,
    val message: String,
    val backupId: String,
    val timestamp: Long
)

/**
 * معلومات النسخة الاحتياطية
 */
data class BackupInfo(
    val id: String,
    val timestamp: Long,
    val size: Long,
    val deviceId: String,
    val version: String
)

/**
 * طلب تسجيل الدخول
 */
data class LoginRequest(
    val username: String,
    val password: String,
    val deviceId: String
)

/**
 * استجابة المصادقة
 */
data class AuthResponse(
    val success: Boolean,
    val token: String?,
    val refreshToken: String?,
    val expiresIn: Long,
    val user: User?
)

/**
 * طلب تجديد التوكن
 */
data class RefreshTokenRequest(
    val refreshToken: String
)

/**
 * المستخدم
 */
data class User(
    val id: String,
    val username: String,
    val email: String?,
    val role: String,
    val lastLogin: Date?
)

// ================ نماذج التقارير ================

/**
 * تقرير الأرباح والخسائر
 */
data class ProfitLossReport(
    val period: ReportPeriod,
    val totalSales: Double,
    val totalPayments: Double,
    val totalExpenses: Double,
    val grossProfit: Double,
    val netProfit: Double,
    val profitMargin: Double,
    val breakdown: ProfitBreakdown
)

/**
 * فترة التقرير
 */
data class ReportPeriod(
    val fromDate: Date,
    val toDate: Date,
    val description: String
)

/**
 * تفصيل الأرباح
 */
data class ProfitBreakdown(
    val salesByPriceType: Map<String, Double>,
    val expensesByCategory: Map<String, Double>,
    val topSellingPackages: List<PackageRevenue>,
    val topCustomers: List<CustomerRevenue>
)

/**
 * إيرادات الباقة
 */
data class PackageRevenue(
    val packageId: String,
    val packageName: String,
    val totalSold: Int,
    val totalRevenue: Double
)

/**
 * إيرادات العميل
 */
data class CustomerRevenue(
    val storeId: String,
    val storeName: String,
    val totalPurchases: Double,
    val totalPayments: Double,
    val balance: Double
)

/**
 * تقرير الديون
 */
data class DebtReport(
    val totalDebt: Double,
    val storesWithDebt: Int,
    val averageDebt: Double,
    val oldestDebt: Date?,
    val debtDetails: List<StoreDebt>
)

/**
 * دين المحل
 */
data class StoreDebt(
    val storeId: String,
    val storeName: String,
    val totalSales: Double,
    val totalPayments: Double,
    val balance: Double,
    val lastSaleDate: Date?,
    val lastPaymentDate: Date?,
    val daysSinceLastPayment: Int?
)

/**
 * تقرير المخزون
 */
data class InventoryReport(
    val totalStock: Int,
    val totalValue: Double,
    val lowStockItems: Int,
    val outOfStockItems: Int,
    val expiredItems: Int,
    val stockDetails: List<PackageStock>
)

/**
 * مخزون الباقة
 */
data class PackageStock(
    val packageId: String,
    val packageName: String,
    val currentStock: Int,
    val minStockLevel: Int,
    val stockValue: Double,
    val stockStatus: String,
    val lastRestockDate: Date?
)

/**
 * إحصائيات لوحة التحكم
 */
data class DashboardStatistics(
    val totalStores: Int,
    val totalPackages: Int,
    val totalSales: Double,
    val totalPayments: Double,
    val totalExpenses: Double,
    val netProfit: Double,
    val salesCount: Int,
    val paymentsCount: Int,
    val lowStockPackages: Int,
    val storesWithDebt: Int,
    val recentActivities: List<ActivitySummary>
)

/**
 * ملخص النشاط
 */
data class ActivitySummary(
    val type: String,
    val description: String,
    val timestamp: Date,
    val amount: Double?
)