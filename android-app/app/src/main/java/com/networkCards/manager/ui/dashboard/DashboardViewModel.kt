package com.networkCards.manager.ui.dashboard

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.networkCards.manager.data.repository.*
import com.networkCards.manager.ui.dashboard.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.Date
import java.util.Calendar
import javax.inject.Inject

/**
 * ViewModel للوحة التحكم
 * يدير بيانات وحالة لوحة التحكم الرئيسية
 */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val storeRepository: StoreRepository,
    private val packageRepository: PackageRepository,
    private val saleRepository: SaleRepository,
    private val paymentRepository: PaymentRepository,
    private val inventoryRepository: InventoryRepository
) : ViewModel() {
    
    // الإحصائيات السريعة
    private val _quickStats = MutableLiveData<List<QuickStatItem>>()
    val quickStats: LiveData<List<QuickStatItem>> = _quickStats
    
    // الأنشطة الحديثة
    private val _recentActivities = MutableLiveData<List<RecentActivity>>()
    val recentActivities: LiveData<List<RecentActivity>> = _recentActivities
    
    // بيانات الرسوم البيانية
    private val _salesChartData = MutableLiveData<List<ChartEntry>>()
    val salesChartData: LiveData<List<ChartEntry>> = _salesChartData
    
    private val _paymentsChartData = MutableLiveData<List<ChartEntry>>()
    val paymentsChartData: LiveData<List<ChartEntry>> = _paymentsChartData
    
    private val _pieChartData = MutableLiveData<List<PieChartEntry>>()
    val pieChartData: LiveData<List<PieChartEntry>> = _pieChartData
    
    // حالة التحميل
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // الأخطاء
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    /**
     * تحميل بيانات لوحة التحكم
     */
    fun loadDashboardData() {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _error.value = null
                
                // تحميل البيانات بشكل متوازي لتحسين الأداء
                val quickStatsDeferred = async { loadQuickStatistics() }
                val activitiesDeferred = async { loadRecentActivities() }
                val chartsDeferred = async { loadChartData() }
                
                // انتظار اكتمال جميع العمليات
                quickStatsDeferred.await()
                activitiesDeferred.await()
                chartsDeferred.await()
                
                Timber.d("✅ Dashboard data loaded successfully")
                
            } catch (e: Exception) {
                Timber.e(e, "❌ Failed to load dashboard data")
                _error.value = "فشل في تحميل بيانات لوحة التحكم: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * تحميل الإحصائيات السريعة
     */
    private suspend fun loadQuickStatistics() {
        try {
            // الحصول على الإحصائيات من المستودعات
            val storeStats = storeRepository.getStoreStatistics()
            val packageStats = packageRepository.getPackageStatistics()
            val salesStats = saleRepository.getSalesStatistics()
            val paymentsStats = paymentRepository.getPaymentStatistics()
            
            // حساب صافي الربح
            val netProfit = paymentsStats.totalAmount - salesStats.totalRevenue
            
            // إنشاء قائمة الإحصائيات
            val statsList = listOf(
                QuickStatItem(
                    type = StatType.TOTAL_STORES,
                    title = "إجمالي المحلات",
                    value = storeStats.totalStores.toString(),
                    subtitle = "${storeStats.activeStores} نشط",
                    icon = R.drawable.ic_store,
                    color = android.graphics.Color.parseColor("#2196F3")
                ),
                QuickStatItem(
                    type = StatType.TOTAL_SALES,
                    title = "إجمالي المبيعات",
                    value = formatCurrency(salesStats.totalRevenue),
                    subtitle = "${salesStats.totalSales} عملية",
                    icon = R.drawable.ic_trending_up,
                    color = android.graphics.Color.parseColor("#4CAF50"),
                    trend = calculateSalesTrend()
                ),
                QuickStatItem(
                    type = StatType.TOTAL_DEBT,
                    title = "إجمالي الديون",
                    value = formatCurrency(storeStats.totalDebt),
                    subtitle = "${storeStats.storesWithDebt} محل مدين",
                    icon = R.drawable.ic_account_balance,
                    color = android.graphics.Color.parseColor("#FF9800")
                ),
                QuickStatItem(
                    type = StatType.NET_PROFIT,
                    title = "صافي الربح",
                    value = formatCurrency(netProfit),
                    subtitle = if (netProfit >= 0) "ربح" else "خسارة",
                    icon = R.drawable.ic_monetization,
                    color = if (netProfit >= 0) android.graphics.Color.parseColor("#4CAF50") else android.graphics.Color.parseColor("#F44336")
                ),
                QuickStatItem(
                    type = StatType.LOW_STOCK,
                    title = "مخزون منخفض",
                    value = packageStats.lowStockPackages.toString(),
                    subtitle = "باقة تحتاج تجديد",
                    icon = R.drawable.ic_inventory_warning,
                    color = android.graphics.Color.parseColor("#E91E63")
                ),
                QuickStatItem(
                    type = StatType.RECENT_SALES,
                    title = "مبيعات اليوم",
                    value = getTodaySalesCount().toString(),
                    subtitle = "عملية اليوم",
                    icon = R.drawable.ic_today,
                    color = android.graphics.Color.parseColor("#9C27B0")
                )
            )
            
            _quickStats.value = statsList
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to load quick statistics")
            throw e
        }
    }
    
    /**
     * تحميل الأنشطة الحديثة
     */
    private suspend fun loadRecentActivities() {
        try {
            val activities = mutableListOf<RecentActivity>()
            
            // أحدث المبيعات
            val recentSales = saleRepository.getRecentSales(5)
            recentSales.forEach { sale ->
                val store = storeRepository.getStoreById(sale.storeId)
                activities.add(
                    RecentActivity(
                        id = sale.id,
                        type = ActivityType.SALE,
                        title = "بيع جديد",
                        subtitle = "للمحل: ${store?.name ?: "غير معروف"}",
                        timestamp = formatRelativeTime(sale.date),
                        amount = formatCurrency(sale.total),
                        entityId = sale.id,
                        icon = R.drawable.ic_sale
                    )
                )
            }
            
            // أحدث المدفوعات
            val recentPayments = paymentRepository.getRecentPayments(5)
            recentPayments.forEach { payment ->
                val store = storeRepository.getStoreById(payment.storeId)
                activities.add(
                    RecentActivity(
                        id = payment.id,
                        type = ActivityType.PAYMENT,
                        title = "دفعة جديدة",
                        subtitle = "من المحل: ${store?.name ?: "غير معروف"}",
                        timestamp = formatRelativeTime(payment.date),
                        amount = formatCurrency(payment.amount),
                        entityId = payment.id,
                        icon = R.drawable.ic_payment
                    )
                )
            }
            
            // ترتيب حسب التاريخ
            activities.sortByDescending { it.timestamp }
            
            _recentActivities.value = activities.take(10)
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to load recent activities")
            throw e
        }
    }
    
    /**
     * تحميل بيانات الرسوم البيانية
     */
    private suspend fun loadChartData() {
        try {
            // بيانات المبيعات لآخر 7 أيام
            val salesData = getSalesChartData()
            _salesChartData.value = salesData
            
            // بيانات المدفوعات لآخر 7 أيام
            val paymentsData = getPaymentsChartData()
            _paymentsChartData.value = paymentsData
            
            // بيانات التوزيع الدائري
            val pieData = getPieChartData()
            _pieChartData.value = pieData
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to load chart data")
            throw e
        }
    }
    
    /**
     * الحصول على بيانات رسم المبيعات
     */
    private suspend fun getSalesChartData(): List<ChartEntry> {
        val chartData = mutableListOf<ChartEntry>()
        val calendar = Calendar.getInstance()
        
        // آخر 7 أيام
        for (i in 6 downTo 0) {
            calendar.time = Date()
            calendar.add(Calendar.DAY_OF_MONTH, -i)
            
            val dayStart = calendar.time
            calendar.add(Calendar.DAY_OF_MONTH, 1)
            val dayEnd = calendar.time
            
            val dayTotal = saleRepository.getTotalSalesForPeriod(dayStart, dayEnd)
            
            chartData.add(
                ChartEntry(
                    x = (6 - i).toFloat(),
                    y = dayTotal.toFloat(),
                    label = formatDayLabel(dayStart)
                )
            )
        }
        
        return chartData
    }
    
    /**
     * الحصول على بيانات رسم المدفوعات
     */
    private suspend fun getPaymentsChartData(): List<ChartEntry> {
        val chartData = mutableListOf<ChartEntry>()
        val calendar = Calendar.getInstance()
        
        // آخر 7 أيام
        for (i in 6 downTo 0) {
            calendar.time = Date()
            calendar.add(Calendar.DAY_OF_MONTH, -i)
            
            val dayStart = calendar.time
            calendar.add(Calendar.DAY_OF_MONTH, 1)
            val dayEnd = calendar.time
            
            val dayTotal = paymentRepository.getTotalPaymentsForPeriod(dayStart, dayEnd)
            
            chartData.add(
                ChartEntry(
                    x = (6 - i).toFloat(),
                    y = dayTotal.toFloat(),
                    label = formatDayLabel(dayStart)
                )
            )
        }
        
        return chartData
    }
    
    /**
     * الحصول على بيانات الرسم الدائري
     */
    private suspend fun getPieChartData(): List<PieChartEntry> {
        // توزيع المبيعات حسب نوع السعر
        val retailSales = saleRepository.getTotalSalesByPriceType(com.networkCards.manager.data.model.PriceType.RETAIL)
        val wholesaleSales = saleRepository.getTotalSalesByPriceType(com.networkCards.manager.data.model.PriceType.WHOLESALE)
        val distributorSales = saleRepository.getTotalSalesByPriceType(com.networkCards.manager.data.model.PriceType.DISTRIBUTOR)
        
        val total = retailSales + wholesaleSales + distributorSales
        
        return if (total > 0) {
            listOf(
                PieChartEntry(
                    value = (retailSales / total * 100).toFloat(),
                    label = "تجزئة"
                ),
                PieChartEntry(
                    value = (wholesaleSales / total * 100).toFloat(),
                    label = "جملة"
                ),
                PieChartEntry(
                    value = (distributorSales / total * 100).toFloat(),
                    label = "موزعين"
                )
            )
        } else {
            emptyList()
        }
    }
    
    /**
     * حساب اتجاه المبيعات
     */
    private suspend fun calculateSalesTrend(): StatTrend? {
        return try {
            val calendar = Calendar.getInstance()
            
            // هذا الأسبوع
            calendar.time = Date()
            calendar.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY) // بداية الأسبوع
            val thisWeekStart = calendar.time
            val thisWeekSales = saleRepository.getTotalSalesForPeriod(thisWeekStart, Date())
            
            // الأسبوع الماضي
            calendar.add(Calendar.WEEK_OF_YEAR, -1)
            val lastWeekStart = calendar.time
            calendar.add(Calendar.WEEK_OF_YEAR, 1)
            val lastWeekEnd = calendar.time
            val lastWeekSales = saleRepository.getTotalSalesForPeriod(lastWeekStart, lastWeekEnd)
            
            if (lastWeekSales > 0) {
                val percentage = ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100
                StatTrend(
                    percentage = Math.abs(percentage),
                    isPositive = percentage >= 0
                )
            } else {
                null
            }
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to calculate sales trend")
            null
        }
    }
    
    /**
     * الحصول على عدد مبيعات اليوم
     */
    private suspend fun getTodaySalesCount(): Int {
        return try {
            saleRepository.getTodaySalesCount()
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to get today's sales count")
            0
        }
    }
    
    /**
     * تنسيق العملة
     */
    private fun formatCurrency(amount: Double): String {
        val formatter = java.text.NumberFormat.getCurrencyInstance(java.util.Locale("ar", "SA"))
        return formatter.format(amount)
    }
    
    /**
     * تنسيق الوقت النسبي
     */
    private fun formatRelativeTime(date: Date): String {
        val now = Date()
        val diffInMillis = now.time - date.time
        val diffInHours = diffInMillis / (1000 * 60 * 60)
        val diffInDays = diffInHours / 24
        
        return when {
            diffInHours < 1 -> "منذ دقائق"
            diffInHours < 24 -> "منذ ${diffInHours} ساعة"
            diffInDays < 7 -> "منذ ${diffInDays} أيام"
            else -> {
                val formatter = java.text.SimpleDateFormat("dd/MM", java.util.Locale("ar"))
                formatter.format(date)
            }
        }
    }
    
    /**
     * تنسيق تسمية اليوم
     */
    private fun formatDayLabel(date: Date): String {
        val formatter = java.text.SimpleDateFormat("dd/MM", java.util.Locale("ar"))
        return formatter.format(date)
    }
    
    /**
     * تحديث البيانات
     */
    fun refreshData() {
        loadDashboardData()
    }
    
    /**
     * مسح رسالة الخطأ
     */
    fun clearError() {
        _error.value = null
    }
    
    override fun onCleared() {
        super.onCleared()
        Timber.d("🧹 DashboardViewModel cleared")
    }
}