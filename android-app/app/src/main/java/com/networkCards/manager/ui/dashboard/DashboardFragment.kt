package com.networkCards.manager.ui.dashboard

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.github.mikephil.charting.animation.Easing
import com.github.mikephil.charting.components.Legend
import com.github.mikephil.charting.data.*
import com.github.mikephil.charting.formatter.ValueFormatter
import com.github.mikephil.charting.utils.ColorTemplate
import com.networkCards.manager.R
import com.networkCards.manager.databinding.FragmentDashboardBinding
import com.networkCards.manager.ui.dashboard.adapter.QuickStatsAdapter
import com.networkCards.manager.ui.dashboard.adapter.RecentActivitiesAdapter
import com.networkCards.manager.util.CurrencyFormatter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * جزء لوحة التحكم
 * يعرض الإحصائيات والأنشطة الحديثة
 */
@AndroidEntryPoint
class DashboardFragment : Fragment() {
    
    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: DashboardViewModel by viewModels()
    
    private lateinit var quickStatsAdapter: QuickStatsAdapter
    private lateinit var recentActivitiesAdapter: RecentActivitiesAdapter
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupUI()
        observeData()
        loadData()
    }
    
    /**
     * إعداد واجهة المستخدم
     */
    private fun setupUI() {
        setupQuickStats()
        setupRecentActivities()
        setupCharts()
        setupRefreshLayout()
    }
    
    /**
     * إعداد الإحصائيات السريعة
     */
    private fun setupQuickStats() {
        quickStatsAdapter = QuickStatsAdapter { statItem ->
            // معالجة النقر على إحصائية
            handleStatItemClick(statItem)
        }
        
        binding.recyclerViewQuickStats.apply {
            adapter = quickStatsAdapter
            layoutManager = GridLayoutManager(requireContext(), 2)
            setHasFixedSize(true)
        }
    }
    
    /**
     * إعداد الأنشطة الحديثة
     */
    private fun setupRecentActivities() {
        recentActivitiesAdapter = RecentActivitiesAdapter { activity ->
            // معالجة النقر على نشاط
            handleActivityClick(activity)
        }
        
        binding.recyclerViewRecentActivities.apply {
            adapter = recentActivitiesAdapter
            layoutManager = LinearLayoutManager(requireContext())
            setHasFixedSize(true)
        }
    }
    
    /**
     * إعداد الرسوم البيانية
     */
    private fun setupCharts() {
        setupSalesChart()
        setupPaymentsChart()
        setupPieChart()
    }
    
    /**
     * إعداد رسم المبيعات
     */
    private fun setupSalesChart() {
        binding.chartSales.apply {
            description.isEnabled = false
            setTouchEnabled(true)
            isDragEnabled = true
            setScaleEnabled(true)
            setPinchZoom(true)
            setDrawGridBackground(false)
            
            // تخصيص المحاور
            xAxis.apply {
                setDrawGridLines(false)
                position = com.github.mikephil.charting.components.XAxis.XAxisPosition.BOTTOM
                textColor = Color.GRAY
            }
            
            axisLeft.apply {
                setDrawGridLines(true)
                textColor = Color.GRAY
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float): String {
                        return CurrencyFormatter.format(value.toDouble())
                    }
                }
            }
            
            axisRight.isEnabled = false
            
            // إعداد الأسطورة
            legend.apply {
                isEnabled = true
                verticalAlignment = Legend.LegendVerticalAlignment.TOP
                horizontalAlignment = Legend.LegendHorizontalAlignment.RIGHT
                orientation = Legend.LegendOrientation.HORIZONTAL
                setDrawInside(false)
            }
        }
    }
    
    /**
     * إعداد رسم المدفوعات
     */
    private fun setupPaymentsChart() {
        binding.chartPayments.apply {
            description.isEnabled = false
            setTouchEnabled(true)
            setDrawGridBackground(false)
            
            xAxis.apply {
                setDrawGridLines(false)
                position = com.github.mikephil.charting.components.XAxis.XAxisPosition.BOTTOM
                textColor = Color.GRAY
            }
            
            axisLeft.apply {
                setDrawGridLines(true)
                textColor = Color.GRAY
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float): String {
                        return CurrencyFormatter.format(value.toDouble())
                    }
                }
            }
            
            axisRight.isEnabled = false
        }
    }
    
    /**
     * إعداد الرسم الدائري
     */
    private fun setupPieChart() {
        binding.chartPie.apply {
            setUsePercentValues(true)
            description.isEnabled = false
            setExtraOffsets(5f, 10f, 5f, 5f)
            
            dragDecelerationFrictionCoef = 0.95f
            
            setDrawHoleEnabled(true)
            setHoleColor(Color.WHITE)
            setHoleRadius(40f)
            setTransparentCircleRadius(45f)
            setTransparentCircleColor(Color.WHITE)
            setTransparentCircleAlpha(110)
            
            setDrawCenterText(true)
            centerText = "توزيع\nالمبيعات"
            setCenterTextSize(16f)
            setCenterTextColor(Color.GRAY)
            
            setDrawEntryLabels(false)
            
            // الأسطورة
            legend.apply {
                verticalAlignment = Legend.LegendVerticalAlignment.BOTTOM
                horizontalAlignment = Legend.LegendHorizontalAlignment.LEFT
                orientation = Legend.LegendOrientation.HORIZONTAL
                setDrawInside(false)
                xEntrySpace = 7f
                yEntrySpace = 0f
                yOffset = 0f
            }
        }
    }
    
    /**
     * إعداد Pull-to-Refresh
     */
    private fun setupRefreshLayout() {
        binding.swipeRefreshLayout.apply {
            setColorSchemeResources(
                R.color.primary,
                R.color.secondary,
                R.color.accent
            )
            
            setOnRefreshListener {
                loadData()
            }
        }
    }
    
    /**
     * مراقبة البيانات
     */
    private fun observeData() {
        // مراقبة الإحصائيات السريعة
        viewModel.quickStats.observe(viewLifecycleOwner) { stats ->
            quickStatsAdapter.submitList(stats)
            animateStatsCounters(stats)
        }
        
        // مراقبة الأنشطة الحديثة
        viewModel.recentActivities.observe(viewLifecycleOwner) { activities ->
            recentActivitiesAdapter.submitList(activities)
            
            // إظهار/إخفاء رسالة عدم وجود بيانات
            binding.emptyStateActivities.visibility = 
                if (activities.isEmpty()) View.VISIBLE else View.GONE
        }
        
        // مراقبة بيانات الرسوم البيانية
        viewModel.salesChartData.observe(viewLifecycleOwner) { data ->
            updateSalesChart(data)
        }
        
        viewModel.paymentsChartData.observe(viewLifecycleOwner) { data ->
            updatePaymentsChart(data)
        }
        
        viewModel.pieChartData.observe(viewLifecycleOwner) { data ->
            updatePieChart(data)
        }
        
        // مراقبة حالة التحميل
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefreshLayout.isRefreshing = isLoading
            
            // إظهار/إخفاء شاشة التحميل
            binding.loadingLayout.visibility = 
                if (isLoading && quickStatsAdapter.itemCount == 0) View.VISIBLE else View.GONE
        }
        
        // مراقبة الأخطاء
        viewModel.error.observe(viewLifecycleOwner) { error ->
            if (error != null) {
                showError(error)
                viewModel.clearError()
            }
        }
    }
    
    /**
     * تحميل البيانات
     */
    private fun loadData() {
        lifecycleScope.launch {
            viewModel.loadDashboardData()
        }
    }
    
    /**
     * تحديث رسم المبيعات
     */
    private fun updateSalesChart(data: List<ChartEntry>) {
        val entries = data.map { entry ->
            Entry(entry.x, entry.y)
        }
        
        val dataSet = LineDataSet(entries, "المبيعات").apply {
            color = Color.parseColor("#2196F3")
            setCircleColor(Color.parseColor("#2196F3"))
            lineWidth = 3f
            circleRadius = 5f
            setDrawCircleHole(false)
            setDrawValues(false)
            setDrawFilled(true)
            fillColor = Color.parseColor("#E3F2FD")
        }
        
        val lineData = LineData(dataSet)
        
        binding.chartSales.apply {
            data = lineData
            animateX(1000, Easing.EaseInOutCubic)
            invalidate()
        }
    }
    
    /**
     * تحديث رسم المدفوعات
     */
    private fun updatePaymentsChart(data: List<ChartEntry>) {
        val entries = data.map { entry ->
            BarEntry(entry.x, entry.y)
        }
        
        val dataSet = BarDataSet(entries, "المدفوعات").apply {
            color = Color.parseColor("#4CAF50")
            setDrawValues(false)
        }
        
        val barData = BarData(dataSet)
        barData.barWidth = 0.8f
        
        binding.chartPayments.apply {
            data = barData
            animateY(1000, Easing.EaseInOutCubic)
            invalidate()
        }
    }
    
    /**
     * تحديث الرسم الدائري
     */
    private fun updatePieChart(data: List<PieChartEntry>) {
        val entries = data.map { entry ->
            PieEntry(entry.value, entry.label)
        }
        
        val dataSet = PieDataSet(entries, "").apply {
            setDrawIcons(false)
            sliceSpace = 3f
            iconsOffset = com.github.mikephil.charting.utils.MPPointF(0f, 40f)
            selectionShift = 5f
            colors = ColorTemplate.MATERIAL_COLORS.toList()
        }
        
        val pieData = PieData(dataSet).apply {
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float): String {
                    return "${value.toInt()}%"
                }
            })
            setValueTextSize(12f)
            setValueTextColor(Color.WHITE)
        }
        
        binding.chartPie.apply {
            data = pieData
            highlightValues(null)
            animateY(1000, Easing.EaseInOutCubic)
            invalidate()
        }
    }
    
    /**
     * تحريك عدادات الإحصائيات
     */
    private fun animateStatsCounters(stats: List<QuickStatItem>) {
        stats.forEach { stat ->
            // يمكن إضافة تحريك العدادات هنا
            // باستخدام ValueAnimator أو CountUp animation
        }
    }
    
    /**
     * معالجة النقر على إحصائية
     */
    private fun handleStatItemClick(statItem: QuickStatItem) {
        when (statItem.type) {
            StatType.TOTAL_STORES -> {
                // الانتقال لصفحة المحلات
                (requireActivity() as? MainActivity)?.let { activity ->
                    activity.binding.bottomNavigation.selectedItemId = R.id.nav_stores
                }
            }
            StatType.TOTAL_SALES -> {
                // فتح تقرير المبيعات
                openSalesReport()
            }
            StatType.TOTAL_DEBT -> {
                // فتح تقرير الديون
                openDebtReport()
            }
            StatType.LOW_STOCK -> {
                // فتح تقرير المخزون المنخفض
                openLowStockReport()
            }
        }
    }
    
    /**
     * معالجة النقر على نشاط
     */
    private fun handleActivityClick(activity: RecentActivity) {
        when (activity.type) {
            ActivityType.SALE -> {
                // فتح تفاصيل البيع
                openSaleDetails(activity.entityId)
            }
            ActivityType.PAYMENT -> {
                // فتح تفاصيل الدفعة
                openPaymentDetails(activity.entityId)
            }
            ActivityType.NEW_STORE -> {
                // فتح تفاصيل المحل
                openStoreDetails(activity.entityId)
            }
        }
    }
    
    /**
     * فتح تقرير المبيعات
     */
    private fun openSalesReport() {
        // تنفيذ فتح تقرير المبيعات
    }
    
    /**
     * فتح تقرير الديون
     */
    private fun openDebtReport() {
        // تنفيذ فتح تقرير الديون
    }
    
    /**
     * فتح تقرير المخزون المنخفض
     */
    private fun openLowStockReport() {
        // تنفيذ فتح تقرير المخزون المنخفض
    }
    
    /**
     * فتح تفاصيل البيع
     */
    private fun openSaleDetails(saleId: String) {
        // تنفيذ فتح تفاصيل البيع
    }
    
    /**
     * فتح تفاصيل الدفعة
     */
    private fun openPaymentDetails(paymentId: String) {
        // تنفيذ فتح تفاصيل الدفعة
    }
    
    /**
     * فتح تفاصيل المحل
     */
    private fun openStoreDetails(storeId: String) {
        // تنفيذ فتح تفاصيل المحل
    }
    
    /**
     * إظهار رسالة خطأ
     */
    private fun showError(message: String) {
        com.google.android.material.snackbar.Snackbar.make(
            binding.root,
            message,
            com.google.android.material.snackbar.Snackbar.LENGTH_LONG
        ).setAction("إعادة المحاولة") {
            loadData()
        }.show()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

/**
 * أنواع الإحصائيات
 */
enum class StatType {
    TOTAL_STORES,
    TOTAL_PACKAGES,
    TOTAL_SALES,
    TOTAL_PAYMENTS,
    TOTAL_DEBT,
    NET_PROFIT,
    LOW_STOCK,
    RECENT_SALES
}

/**
 * عنصر إحصائية سريعة
 */
data class QuickStatItem(
    val type: StatType,
    val title: String,
    val value: String,
    val subtitle: String? = null,
    val icon: Int,
    val color: Int,
    val trend: StatTrend? = null
)

/**
 * اتجاه الإحصائية
 */
data class StatTrend(
    val percentage: Double,
    val isPositive: Boolean
)

/**
 * أنواع الأنشطة
 */
enum class ActivityType {
    SALE,
    PAYMENT,
    NEW_STORE,
    NEW_PACKAGE,
    EXPENSE
}

/**
 * نشاط حديث
 */
data class RecentActivity(
    val id: String,
    val type: ActivityType,
    val title: String,
    val subtitle: String,
    val timestamp: String,
    val amount: String? = null,
    val entityId: String,
    val icon: Int
)

/**
 * بيانات الرسم البياني
 */
data class ChartEntry(
    val x: Float,
    val y: Float,
    val label: String? = null
)

/**
 * بيانات الرسم الدائري
 */
data class PieChartEntry(
    val value: Float,
    val label: String
)