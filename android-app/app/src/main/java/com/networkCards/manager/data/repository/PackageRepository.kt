package com.networkCards.manager.data.repository

import com.networkCards.manager.data.database.dao.PackageDao
import com.networkCards.manager.data.database.dao.SaleDao
import com.networkCards.manager.data.database.dao.InventoryDao
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.data.model.StockStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مستودع الباقات
 * يدير جميع عمليات البيانات المتعلقة بالباقات
 */
@Singleton
class PackageRepository @Inject constructor(
    private val packageDao: PackageDao,
    private val saleDao: SaleDao,
    private val inventoryDao: InventoryDao
) {
    
    /**
     * الحصول على جميع الباقات
     */
    fun getAllPackages(): Flow<List<Package>> = packageDao.getAllPackages().map { packages ->
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على جميع الباقات كقائمة
     */
    suspend fun getAllPackagesList(): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.getAllPackagesList()
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على باقة بالمعرف
     */
    suspend fun getPackageById(packageId: String): Package? = withContext(Dispatchers.IO) {
        packageDao.getPackageById(packageId)?.let { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * البحث في الباقات
     */
    suspend fun searchPackages(query: String): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.searchPackages("%$query%")
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * البحث بالباركود
     */
    suspend fun getPackageByBarcode(barcode: String): Package? = withContext(Dispatchers.IO) {
        packageDao.getPackageByBarcode(barcode)?.let { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على الباقات المميزة
     */
    suspend fun getFeaturedPackages(): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.getFeaturedPackages()
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على الباقات منخفضة المخزون
     */
    suspend fun getLowStockPackages(): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.getLowStockPackages()
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على الباقات نافدة المخزون
     */
    suspend fun getOutOfStockPackages(): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.getOutOfStockPackages()
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على الباقات حسب الفئة
     */
    suspend fun getPackagesByCategory(category: String): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.getPackagesByCategory(category)
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على أفضل الباقات مبيعاً
     */
    suspend fun getTopSellingPackages(limit: Int = 10): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.getTopSellingPackages(limit)
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * الحصول على إحصائيات الباقات
     */
    suspend fun getPackageStatistics(): PackageStatistics = withContext(Dispatchers.IO) {
        packageDao.getPackageStatistics()
    }
    
    /**
     * إدراج باقة جديدة
     */
    suspend fun insertPackage(package: Package): Long = withContext(Dispatchers.IO) {
        packageDao.insertPackage(package)
    }
    
    /**
     * تحديث باقة
     */
    suspend fun updatePackage(package: Package): Int = withContext(Dispatchers.IO) {
        val updatedPackage = package.copy(updatedAt = java.util.Date())
        packageDao.updatePackage(updatedPackage)
    }
    
    /**
     * حذف باقة
     */
    suspend fun deletePackage(package: Package): Int = withContext(Dispatchers.IO) {
        packageDao.deletePackage(package)
    }
    
    /**
     * تحديث مخزون الباقة
     */
    suspend fun updatePackageStock(packageId: String): Int = withContext(Dispatchers.IO) {
        val currentStock = inventoryDao.getTotalStockForPackage(packageId)
        packageDao.updateStock(packageId, currentStock)
        currentStock
    }
    
    /**
     * إضافة للمخزون
     */
    suspend fun addToStock(
        packageId: String, 
        quantity: Int, 
        notes: String? = null,
        unitCost: Double? = null,
        supplierName: String? = null
    ) = withContext(Dispatchers.IO) {
        // إضافة حركة مخزون
        inventoryDao.addToInventory(packageId, quantity, notes, unitCost, null, supplierName)
        
        // تحديث مخزون الباقة
        updatePackageStock(packageId)
    }
    
    /**
     * خصم من المخزون
     */
    suspend fun removeFromStock(
        packageId: String, 
        quantity: Int, 
        reason: String? = null,
        relatedSaleId: String? = null
    ): Boolean = withContext(Dispatchers.IO) {
        val currentStock = inventoryDao.getTotalStockForPackage(packageId)
        
        if (currentStock >= quantity) {
            inventoryDao.removeFromInventory(packageId, quantity, reason, relatedSaleId)
            updatePackageStock(packageId)
            true
        } else {
            false
        }
    }
    
    /**
     * تسجيل تلف
     */
    suspend fun recordDamage(
        packageId: String,
        quantity: Int,
        damageReport: String,
        photos: String? = null
    ) = withContext(Dispatchers.IO) {
        inventoryDao.recordDamage(packageId, quantity, damageReport, photos)
        updatePackageStock(packageId)
    }
    
    /**
     * تفعيل/تعطيل باقة
     */
    suspend fun togglePackageActive(packageId: String, isActive: Boolean) = withContext(Dispatchers.IO) {
        packageDao.togglePackageActive(packageId, isActive)
    }
    
    /**
     * تمييز/إلغاء تمييز باقة
     */
    suspend fun togglePackageFeatured(packageId: String, isFeatured: Boolean) = withContext(Dispatchers.IO) {
        packageDao.togglePackageFeatured(packageId, isFeatured)
    }
    
    /**
     * تحديث إحصائيات المبيعات للباقة
     */
    suspend fun updatePackageSalesStats(packageId: String, soldQuantity: Int, revenue: Double) = withContext(Dispatchers.IO) {
        packageDao.updateSalesStats(packageId, soldQuantity, revenue)
    }
    
    /**
     * البحث المتقدم
     */
    suspend fun searchPackagesAdvanced(
        query: String? = null,
        category: String? = null,
        isActive: Boolean? = null,
        isFeatured: Boolean? = null,
        stockStatus: String? = null,
        sortBy: String = "name",
        limit: Int = 50,
        offset: Int = 0
    ): List<Package> = withContext(Dispatchers.IO) {
        val packages = packageDao.searchPackagesAdvanced(
            query, category, isActive, isFeatured, stockStatus, sortBy, limit, offset
        )
        
        packages.map { pkg ->
            enhancePackageWithCalculatedFields(pkg)
        }
    }
    
    /**
     * تحسين الباقة بالحقول المحسوبة
     */
    private suspend fun enhancePackageWithCalculatedFields(package: Package): Package {
        return try {
            // الحصول على المخزون الحالي من حركات المخزون
            val actualStock = inventoryDao.getTotalStockForPackage(package.id)
            
            // الحصول على إحصائيات المبيعات
            val totalSalesRevenue = saleDao.getTotalSalesForPackage(package.id)
            val packageSales = saleDao.getSalesByPackage(package.id)
            val totalSold = packageSales.sumOf { it.quantity }
            val averagePrice = if (totalSold > 0) totalSalesRevenue / totalSold else 0.0
            
            package.copy(
                currentStock = actualStock,
                totalSold = totalSold,
                totalRevenue = totalSalesRevenue,
                averageSalePrice = averagePrice
            )
        } catch (e: Exception) {
            // في حالة الخطأ، إرجاع الباقة كما هي
            package
        }
    }
    
    /**
     * الحصول على فئات الباقات المتاحة
     */
    suspend fun getAvailableCategories(): List<String> = withContext(Dispatchers.IO) {
        packageDao.getAllPackagesList()
            .mapNotNull { it.category }
            .distinct()
            .sorted()
    }
    
    /**
     * الحصول على العلامات التجارية المتاحة
     */
    suspend fun getAvailableBrands(): List<String> = withContext(Dispatchers.IO) {
        packageDao.getAllPackagesList()
            .mapNotNull { it.brand }
            .distinct()
            .sorted()
    }
    
    /**
     * تحديث جميع أرصدة المخزون
     */
    suspend fun updateAllPackageStocks() = withContext(Dispatchers.IO) {
        val packages = packageDao.getAllPackagesList()
        
        packages.forEach { pkg ->
            updatePackageStock(pkg.id)
        }
    }
}