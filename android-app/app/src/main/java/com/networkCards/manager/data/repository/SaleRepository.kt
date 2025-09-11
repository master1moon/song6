package com.networkCards.manager.data.repository

import com.networkCards.manager.data.database.dao.SaleDao
import com.networkCards.manager.data.database.dao.StoreDao
import com.networkCards.manager.data.database.dao.PackageDao
import com.networkCards.manager.data.model.Sale
import com.networkCards.manager.data.model.SaleStatus
import com.networkCards.manager.data.model.PaymentStatus
import com.networkCards.manager.data.model.PriceType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مستودع المبيعات
 * يدير جميع عمليات البيانات المتعلقة بالمبيعات
 */
@Singleton
class SaleRepository @Inject constructor(
    private val saleDao: SaleDao,
    private val storeDao: StoreDao,
    private val packageDao: PackageDao,
    private val storeRepository: StoreRepository,
    private val packageRepository: PackageRepository
) {
    
    /**
     * الحصول على جميع المبيعات
     */
    fun getAllSales(): Flow<List<Sale>> = saleDao.getAllSales()
    
    /**
     * الحصول على جميع المبيعات كقائمة
     */
    suspend fun getAllSalesList(): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getAllSalesList()
    }
    
    /**
     * الحصول على بيع بالمعرف
     */
    suspend fun getSaleById(saleId: String): Sale? = withContext(Dispatchers.IO) {
        saleDao.getSaleById(saleId)
    }
    
    /**
     * الحصول على مبيعات محل معين
     */
    fun getSalesByStore(storeId: String): Flow<List<Sale>> = saleDao.getSalesByStore(storeId)
    
    /**
     * الحصول على مبيعات باقة معينة
     */
    suspend fun getSalesByPackage(packageId: String): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getSalesByPackage(packageId)
    }
    
    /**
     * الحصول على المبيعات في فترة معينة
     */
    suspend fun getSalesInPeriod(fromDate: Date, toDate: Date): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getSalesInPeriod(fromDate, toDate)
    }
    
    /**
     * الحصول على مبيعات اليوم
     */
    suspend fun getTodaySales(): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getTodaySales()
    }
    
    /**
     * الحصول على مبيعات هذا الأسبوع
     */
    suspend fun getThisWeekSales(): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getThisWeekSales()
    }
    
    /**
     * الحصول على مبيعات هذا الشهر
     */
    suspend fun getThisMonthSales(): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getThisMonthSales()
    }
    
    /**
     * الحصول على أحدث المبيعات
     */
    suspend fun getRecentSales(limit: Int = 10): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getRecentSales(limit)
    }
    
    /**
     * الحصول على المبيعات المخصصة
     */
    suspend fun getCustomSales(): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.getCustomSales()
    }
    
    /**
     * الحصول على إحصائيات المبيعات
     */
    suspend fun getSalesStatistics(): SalesStatistics = withContext(Dispatchers.IO) {
        saleDao.getSalesStatistics()
    }
    
    /**
     * الحصول على إحصائيات المبيعات لفترة
     */
    suspend fun getSalesStatisticsForPeriod(fromDate: Date, toDate: Date): SalesStatistics = withContext(Dispatchers.IO) {
        saleDao.getSalesStatisticsForPeriod(fromDate, toDate)
    }
    
    /**
     * حساب إجمالي مبيعات محل
     */
    suspend fun getTotalSalesForStore(storeId: String): Double = withContext(Dispatchers.IO) {
        saleDao.getTotalSalesForStore(storeId)
    }
    
    /**
     * حساب إجمالي مبيعات باقة
     */
    suspend fun getTotalSalesForPackage(packageId: String): Double = withContext(Dispatchers.IO) {
        saleDao.getTotalSalesForPackage(packageId)
    }
    
    /**
     * حساب إجمالي المبيعات لفترة
     */
    suspend fun getTotalSalesForPeriod(fromDate: Date, toDate: Date): Double = withContext(Dispatchers.IO) {
        val sales = saleDao.getSalesInPeriod(fromDate, toDate)
        sales.sumOf { it.total }
    }
    
    /**
     * حساب إجمالي المبيعات حسب نوع السعر
     */
    suspend fun getTotalSalesByPriceType(priceType: PriceType): Double = withContext(Dispatchers.IO) {
        val stores = storeDao.getStoresByPriceType(priceType)
        var total = 0.0
        
        stores.forEach { store ->
            total += saleDao.getTotalSalesForStore(store.id)
        }
        
        total
    }
    
    /**
     * إدراج بيع جديد
     */
    suspend fun insertSale(sale: Sale): Long = withContext(Dispatchers.IO) {
        val saleId = saleDao.insertSale(sale)
        
        // تحديث مخزون الباقة إذا لم يكن بيعاً مخصصاً
        if (!sale.isCustom && sale.packageId != null) {
            packageRepository.removeFromStock(
                sale.packageId, 
                sale.quantity, 
                "بيع للمحل",
                sale.id
            )
        }
        
        // تحديث إحصائيات المحل
        storeRepository.updateStoreBalance(sale.storeId)
        storeRepository.updateLastSaleDate(sale.storeId, sale.date)
        
        // تحديث إحصائيات الباقة
        if (!sale.isCustom && sale.packageId != null) {
            packageRepository.updatePackageSalesStats(sale.packageId, sale.quantity, sale.total)
        }
        
        saleId
    }
    
    /**
     * تحديث بيع
     */
    suspend fun updateSale(sale: Sale): Int = withContext(Dispatchers.IO) {
        val updatedSale = sale.copy(updatedAt = Date())
        val result = saleDao.updateSale(updatedSale)
        
        // إعادة حساب الأرصدة والإحصائيات
        storeRepository.updateStoreBalance(sale.storeId)
        
        if (!sale.isCustom && sale.packageId != null) {
            packageRepository.updatePackageStock(sale.packageId)
        }
        
        result
    }
    
    /**
     * حذف بيع
     */
    suspend fun deleteSale(sale: Sale): Int = withContext(Dispatchers.IO) {
        val result = saleDao.deleteSale(sale)
        
        // إعادة الكمية للمخزون إذا لم يكن بيعاً مخصصاً
        if (!sale.isCustom && sale.packageId != null) {
            packageRepository.addToStock(
                sale.packageId,
                sale.quantity,
                "إعادة من بيع محذوف"
            )
        }
        
        // إعادة حساب الأرصدة
        storeRepository.updateStoreBalance(sale.storeId)
        
        result
    }
    
    /**
     * تحديث حالة الدفع
     */
    suspend fun updatePaymentStatus(saleId: String, paymentStatus: PaymentStatus) = withContext(Dispatchers.IO) {
        saleDao.updatePaymentStatus(saleId, paymentStatus)
    }
    
    /**
     * تحديث حالة البيع
     */
    suspend fun updateSaleStatus(saleId: String, status: SaleStatus) = withContext(Dispatchers.IO) {
        saleDao.updateSaleStatus(saleId, status)
    }
    
    /**
     * عدد المبيعات
     */
    suspend fun getSalesCount(): Int = withContext(Dispatchers.IO) {
        saleDao.getSalesCount()
    }
    
    /**
     * عدد مبيعات اليوم
     */
    suspend fun getTodaySalesCount(): Int = withContext(Dispatchers.IO) {
        saleDao.getTodaySalesCount()
    }
    
    /**
     * البحث المتقدم
     */
    suspend fun searchSalesAdvanced(
        query: String? = null,
        storeId: String? = null,
        packageId: String? = null,
        isCustom: Boolean? = null,
        status: SaleStatus? = null,
        fromDate: Date? = null,
        toDate: Date? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.searchSalesAdvanced(
            query, storeId, packageId, isCustom, status, fromDate, toDate, limit, offset
        )
    }
    
    /**
     * إنشاء بيع جديد مع التحقق من المخزون
     */
    suspend fun createSale(
        storeId: String,
        packageId: String? = null,
        quantity: Int = 0,
        pricePerUnit: Double = 0.0,
        isCustom: Boolean = false,
        customReason: String? = null,
        customAmount: Double = 0.0,
        notes: String? = null,
        discount: Double = 0.0
    ): Result<Sale> = withContext(Dispatchers.IO) {
        try {
            // التحقق من صحة البيانات
            if (storeId.isBlank()) {
                return@withContext Result.failure(Exception("معرف المحل مطلوب"))
            }
            
            if (!isCustom) {
                if (packageId.isNullOrBlank()) {
                    return@withContext Result.failure(Exception("معرف الباقة مطلوب"))
                }
                
                if (quantity <= 0) {
                    return@withContext Result.failure(Exception("الكمية يجب أن تكون أكبر من صفر"))
                }
                
                // التحقق من توفر المخزون
                val availableStock = inventoryDao.getTotalStockForPackage(packageId)
                if (availableStock < quantity) {
                    return@withContext Result.failure(Exception("المخزون غير كافي. المتوفر: $availableStock"))
                }
            } else {
                if (customReason.isNullOrBlank()) {
                    return@withContext Result.failure(Exception("سبب البيع المخصص مطلوب"))
                }
                
                if (customAmount <= 0) {
                    return@withContext Result.failure(Exception("مبلغ البيع المخصص يجب أن يكون أكبر من صفر"))
                }
            }
            
            // إنشاء البيع
            val total = if (isCustom) customAmount else (quantity * pricePerUnit) - discount
            
            val sale = Sale(
                id = "sale_${System.currentTimeMillis()}",
                storeId = storeId,
                packageId = packageId,
                quantity = quantity,
                pricePerUnit = pricePerUnit,
                total = total,
                isCustom = isCustom,
                customReason = customReason,
                customAmount = customAmount,
                notes = notes,
                discount = discount,
                date = Date(),
                status = SaleStatus.COMPLETED,
                paymentStatus = PaymentStatus.PENDING
            )
            
            // حفظ البيع
            insertSale(sale)
            
            Result.success(sale)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * إلغاء بيع
     */
    suspend fun cancelSale(saleId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val sale = saleDao.getSaleById(saleId)
                ?: return@withContext Result.failure(Exception("البيع غير موجود"))
            
            if (sale.status == SaleStatus.CANCELLED) {
                return@withContext Result.failure(Exception("البيع ملغي مسبقاً"))
            }
            
            // تحديث حالة البيع
            saleDao.updateSaleStatus(saleId, SaleStatus.CANCELLED)
            
            // إعادة الكمية للمخزون
            if (!sale.isCustom && sale.packageId != null) {
                packageRepository.addToStock(
                    sale.packageId,
                    sale.quantity,
                    "إعادة من بيع ملغي"
                )
            }
            
            // إعادة حساب رصيد المحل
            storeRepository.updateStoreBalance(sale.storeId)
            
            Result.success(Unit)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * إرجاع بيع
     */
    suspend fun returnSale(saleId: String, returnQuantity: Int, returnReason: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val sale = saleDao.getSaleById(saleId)
                ?: return@withContext Result.failure(Exception("البيع غير موجود"))
            
            if (sale.isCustom) {
                return@withContext Result.failure(Exception("لا يمكن إرجاع البيع المخصص جزئياً"))
            }
            
            if (returnQuantity > sale.quantity) {
                return@withContext Result.failure(Exception("كمية الإرجاع أكبر من كمية البيع"))
            }
            
            if (returnQuantity == sale.quantity) {
                // إرجاع كامل - إلغاء البيع
                return@withContext cancelSale(saleId)
            }
            
            // إرجاع جزئي - إنشاء بيع جديد بكمية سالبة
            val returnSale = Sale(
                id = "return_${System.currentTimeMillis()}",
                storeId = sale.storeId,
                packageId = sale.packageId,
                quantity = -returnQuantity,
                pricePerUnit = sale.pricePerUnit,
                total = -(returnQuantity * sale.pricePerUnit),
                notes = "إرجاع جزئي: $returnReason",
                date = Date(),
                status = SaleStatus.RETURNED,
                paymentStatus = PaymentStatus.COMPLETED
            )
            
            insertSale(returnSale)
            
            Result.success(Unit)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * البحث المتقدم
     */
    suspend fun searchSalesAdvanced(
        query: String? = null,
        storeId: String? = null,
        packageId: String? = null,
        isCustom: Boolean? = null,
        status: SaleStatus? = null,
        fromDate: Date? = null,
        toDate: Date? = null,
        limit: Int = 50,
        offset: Int = 0
    ): List<Sale> = withContext(Dispatchers.IO) {
        saleDao.searchSalesAdvanced(
            query, storeId, packageId, isCustom, status, fromDate, toDate, limit, offset
        )
    }
    
    /**
     * الحصول على تحليل المبيعات حسب الفترة
     */
    suspend fun getSalesAnalysisByPeriod(
        fromDate: Date,
        toDate: Date
    ): SalesAnalysis = withContext(Dispatchers.IO) {
        val sales = saleDao.getSalesInPeriod(fromDate, toDate)
        
        val totalSales = sales.size
        val totalRevenue = sales.sumOf { it.total }
        val totalQuantity = sales.filter { !it.isCustom }.sumOf { it.quantity }
        val averageSaleValue = if (totalSales > 0) totalRevenue / totalSales else 0.0
        
        val salesByDay = sales.groupBy { sale ->
            val calendar = java.util.Calendar.getInstance()
            calendar.time = sale.date
            calendar.get(java.util.Calendar.DAY_OF_YEAR)
        }.mapValues { (_, dailySales) ->
            dailySales.sumOf { it.total }
        }
        
        val topSellingPackages = sales
            .filter { !it.isCustom && it.packageId != null }
            .groupBy { it.packageId!! }
            .mapValues { (_, packageSales) ->
                packageSales.sumOf { it.quantity }
            }
            .toList()
            .sortedByDescending { it.second }
            .take(5)
        
        SalesAnalysis(
            totalSales = totalSales,
            totalRevenue = totalRevenue,
            totalQuantity = totalQuantity,
            averageSaleValue = averageSaleValue,
            salesByDay = salesByDay,
            topSellingPackages = topSellingPackages
        )
    }
    
    /**
     * الحصول على تحليل أداء المحلات
     */
    suspend fun getStorePerformanceAnalysis(): List<StorePerformance> = withContext(Dispatchers.IO) {
        val stores = storeDao.getAllStoresList()
        
        stores.map { store ->
            val sales = saleDao.getSalesByStore(store.id)
            val totalSales = sales.sumOf { it.total }
            val salesCount = sales.size
            val averageSale = if (salesCount > 0) totalSales / salesCount else 0.0
            val lastSaleDate = sales.maxByOrNull { it.date }?.date
            
            StorePerformance(
                storeId = store.id,
                storeName = store.name,
                totalSales = totalSales,
                salesCount = salesCount,
                averageSaleValue = averageSale,
                lastSaleDate = lastSaleDate
            )
        }.sortedByDescending { it.totalSales }
    }
    
    /**
     * الحصول على تحليل أداء الباقات
     */
    suspend fun getPackagePerformanceAnalysis(): List<PackagePerformance> = withContext(Dispatchers.IO) {
        val packages = packageDao.getAllPackagesList()
        
        packages.map { pkg ->
            val sales = saleDao.getSalesByPackage(pkg.id)
            val totalSold = sales.sumOf { it.quantity }
            val totalRevenue = sales.sumOf { it.total }
            val salesCount = sales.size
            val averagePrice = if (totalSold > 0) totalRevenue / totalSold else 0.0
            
            PackagePerformance(
                packageId = pkg.id,
                packageName = pkg.name,
                totalSold = totalSold,
                totalRevenue = totalRevenue,
                salesCount = salesCount,
                averagePrice = averagePrice,
                currentStock = pkg.currentStock,
                stockStatus = pkg.getStockStatus()
            )
        }.sortedByDescending { it.totalRevenue }
    }
}

/**
 * تحليل المبيعات
 */
data class SalesAnalysis(
    val totalSales: Int,
    val totalRevenue: Double,
    val totalQuantity: Int,
    val averageSaleValue: Double,
    val salesByDay: Map<Int, Double>,
    val topSellingPackages: List<Pair<String, Int>>
)

/**
 * أداء المحل
 */
data class StorePerformance(
    val storeId: String,
    val storeName: String,
    val totalSales: Double,
    val salesCount: Int,
    val averageSaleValue: Double,
    val lastSaleDate: Date?
)

/**
 * أداء الباقة
 */
data class PackagePerformance(
    val packageId: String,
    val packageName: String,
    val totalSold: Int,
    val totalRevenue: Double,
    val salesCount: Int,
    val averagePrice: Double,
    val currentStock: Int,
    val stockStatus: com.networkCards.manager.data.model.StockStatus
)