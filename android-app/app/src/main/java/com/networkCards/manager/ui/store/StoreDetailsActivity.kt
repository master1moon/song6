package com.networkCards.manager.ui.store

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.tabs.TabLayoutMediator
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ActivityStoreDetailsBinding
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.ui.store.adapter.StorePagerAdapter
import com.networkCards.manager.util.CurrencyFormatter
import com.networkCards.manager.util.DateFormatter
import com.networkCards.manager.util.PermissionUtil
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * نشاط تفاصيل المحل
 * يعرض معلومات شاملة عن المحل مع تبويبات للمبيعات والمدفوعات
 */
@AndroidEntryPoint
class StoreDetailsActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityStoreDetailsBinding
    private val viewModel: StoreDetailsViewModel by viewModels()
    
    private lateinit var store: Store
    private lateinit var pagerAdapter: StorePagerAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityStoreDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // الحصول على معرف المحل
        val storeId = intent.getStringExtra("store_id") ?: run {
            Toast.makeText(this, "معرف المحل غير صحيح", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        
        setupUI()
        observeData()
        loadStoreDetails(storeId)
    }
    
    /**
     * إعداد واجهة المستخدم
     */
    private fun setupUI() {
        // إعداد الشريط العلوي
        setSupportActionBar(binding.toolbar)
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
        }
        
        // إعداد ViewPager مع التبويبات
        setupViewPager()
        
        // إعداد الأزرار العائمة
        setupFABs()
        
        // إعداد Pull-to-Refresh
        binding.swipeRefreshLayout.setOnRefreshListener {
            refreshData()
        }
    }
    
    /**
     * إعداد ViewPager والتبويبات
     */
    private fun setupViewPager() {
        pagerAdapter = StorePagerAdapter(this)
        binding.viewPager.adapter = pagerAdapter
        
        // ربط التبويبات مع ViewPager
        TabLayoutMediator(binding.tabLayout, binding.viewPager) { tab, position ->
            tab.text = when (position) {
                0 -> "المبيعات"
                1 -> "المدفوعات"
                2 -> "الإحصائيات"
                else -> "تبويب $position"
            }
            
            // إضافة أيقونات للتبويبات
            tab.icon = ContextCompat.getDrawable(this, when (position) {
                0 -> R.drawable.ic_trending_up
                1 -> R.drawable.ic_payment
                2 -> R.drawable.ic_analytics
                else -> R.drawable.ic_info
            })
        }.attach()
    }
    
    /**
     * إعداد الأزرار العائمة
     */
    private fun setupFABs() {
        // زر إضافة بيع
        binding.fabAddSale.setOnClickListener {
            addNewSale()
        }
        
        // زر إضافة دفعة
        binding.fabAddPayment.setOnClickListener {
            addNewPayment()
        }
        
        // تأثير إظهار/إخفاء الأزرار حسب التبويب
        binding.viewPager.registerOnPageChangeCallback(object : androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                
                when (position) {
                    0 -> { // تبويب المبيعات
                        binding.fabAddSale.show()
                        binding.fabAddPayment.hide()
                    }
                    1 -> { // تبويب المدفوعات
                        binding.fabAddSale.hide()
                        binding.fabAddPayment.show()
                    }
                    else -> { // تبويبات أخرى
                        binding.fabAddSale.hide()
                        binding.fabAddPayment.hide()
                    }
                }
            }
        })
    }
    
    /**
     * مراقبة البيانات
     */
    private fun observeData() {
        // مراقبة تفاصيل المحل
        viewModel.store.observe(this) { storeData ->
            if (storeData != null) {
                this.store = storeData
                updateStoreInfo(storeData)
            }
        }
        
        // مراقبة حالة التحميل
        viewModel.isLoading.observe(this) { isLoading ->
            binding.swipeRefreshLayout.isRefreshing = isLoading
        }
        
        // مراقبة الأخطاء
        viewModel.error.observe(this) { error ->
            if (error != null) {
                showError(error)
                viewModel.clearError()
            }
        }
        
        // مراقبة إحصائيات المحل
        viewModel.storeStatistics.observe(this) { stats ->
            updateStatistics(stats)
        }
    }
    
    /**
     * تحميل تفاصيل المحل
     */
    private fun loadStoreDetails(storeId: String) {
        lifecycleScope.launch {
            viewModel.loadStoreDetails(storeId)
        }
    }
    
    /**
     * تحديث معلومات المحل
     */
    private fun updateStoreInfo(store: Store) {
        binding.apply {
            // العنوان
            supportActionBar?.title = store.name
            
            // المعلومات الأساسية
            textStoreName.text = store.name
            textStorePhone.text = store.phone ?: "لا يوجد رقم"
            textStoreAddress.text = store.address ?: "لا يوجد عنوان"
            textStoreNotes.text = store.notes ?: "لا توجد ملاحظات"
            
            // نوع السعر
            chipPriceType.apply {
                text = store.priceType.arabicName
                setChipBackgroundColorResource(getPriceTypeColor(store.priceType))
            }
            
            // الرصيد
            val (balanceText, balanceColor) = CurrencyFormatter.formatWithColor(store.balance)
            textStoreBalance.text = balanceText
            textStoreBalance.setTextColor(balanceColor)
            
            // حالة المحل
            chipStoreStatus.apply {
                text = store.getStatus().arabicName
                setChipBackgroundColor(store.getStatusColor())
            }
            
            // أيقونة الأولوية
            iconPriority.apply {
                visibility = if (store.priority > 1) android.view.View.VISIBLE else android.view.View.GONE
                setImageResource(
                    when (store.priority) {
                        2 -> R.drawable.ic_vip
                        1 -> R.drawable.ic_important
                        else -> R.drawable.ic_normal
                    }
                )
            }
            
            // التواريخ
            textCreatedAt.text = "تاريخ الإضافة: ${DateFormatter.formatDate(store.createdAt)}"
            textLastSale.text = store.lastSaleDate?.let { 
                "آخر بيع: ${DateFormatter.formatRelative(it)}" 
            } ?: "لا يوجد مبيعات"
            textLastPayment.text = store.lastPaymentDate?.let { 
                "آخر دفعة: ${DateFormatter.formatRelative(it)}" 
            } ?: "لا توجد مدفوعات"
            
            // إعداد الأزرار
            buttonCall.apply {
                isEnabled = !store.phone.isNullOrBlank()
                setOnClickListener { callStore() }
            }
            
            buttonLocation.apply {
                isEnabled = !store.address.isNullOrBlank() || 
                           (store.latitude != null && store.longitude != null)
                setOnClickListener { openStoreLocation() }
            }
            
            buttonEdit.setOnClickListener { editStore() }
        }
    }
    
    /**
     * تحديث الإحصائيات
     */
    private fun updateStatistics(stats: StoreStatistics) {
        binding.apply {
            textTotalSales.text = CurrencyFormatter.format(stats.totalSales)
            textTotalPayments.text = CurrencyFormatter.format(stats.totalPayments)
            textSalesCount.text = "${stats.salesCount} عملية"
            textPaymentsCount.text = "${stats.paymentsCount} دفعة"
            
            // حساب معدل التحصيل
            val collectionRate = if (stats.totalSales > 0) {
                (stats.totalPayments / stats.totalSales * 100).toInt()
            } else 0
            
            textCollectionRate.text = "$collectionRate%"
            progressCollectionRate.progress = collectionRate
        }
    }
    
    /**
     * إنشاء قائمة الخيارات
     */
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.store_details_menu, menu)
        return true
    }
    
    /**
     * معالجة اختيار عناصر القائمة
     */
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                finish()
                true
            }
            R.id.action_edit -> {
                editStore()
                true
            }
            R.id.action_call -> {
                callStore()
                true
            }
            R.id.action_message -> {
                sendMessage()
                true
            }
            R.id.action_location -> {
                openStoreLocation()
                true
            }
            R.id.action_export -> {
                exportStoreData()
                true
            }
            R.id.action_delete -> {
                confirmDeleteStore()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    /**
     * إضافة بيع جديد
     */
    private fun addNewSale() {
        val intent = Intent(this, AddEditSaleActivity::class.java).apply {
            putExtra("store_id", store.id)
            putExtra("store_name", store.name)
            putExtra("price_type", store.priceType.name)
        }
        startActivityForResult(intent, REQUEST_CODE_ADD_SALE)
    }
    
    /**
     * إضافة دفعة جديدة
     */
    private fun addNewPayment() {
        val intent = Intent(this, AddEditPaymentActivity::class.java).apply {
            putExtra("store_id", store.id)
            putExtra("store_name", store.name)
            putExtra("current_balance", store.balance)
        }
        startActivityForResult(intent, REQUEST_CODE_ADD_PAYMENT)
    }
    
    /**
     * تعديل المحل
     */
    private fun editStore() {
        val intent = Intent(this, AddEditStoreActivity::class.java).apply {
            putExtra("store_id", store.id)
            putExtra("store", store)
        }
        startActivityForResult(intent, REQUEST_CODE_EDIT_STORE)
    }
    
    /**
     * الاتصال بالمحل
     */
    private fun callStore() {
        if (store.phone.isNullOrBlank()) {
            Toast.makeText(this, "رقم الهاتف غير متوفر", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (PermissionUtil.hasPhonePermission(this)) {
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:${store.phone}")
            }
            startActivity(intent)
        } else {
            PermissionUtil.requestPhonePermission(this) { granted ->
                if (granted) {
                    callStore()
                } else {
                    Toast.makeText(this, "صلاحية الاتصال مطلوبة", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
    
    /**
     * إرسال رسالة للمحل
     */
    private fun sendMessage() {
        if (store.phone.isNullOrBlank()) {
            Toast.makeText(this, "رقم الهاتف غير متوفر", Toast.LENGTH_SHORT).show()
            return
        }
        
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("smsto:${store.phone}")
            putExtra("sms_body", "مرحباً من تطبيق إدارة كروت الشبكة")
        }
        
        if (intent.resolveActivity(packageManager) != null) {
            startActivity(intent)
        } else {
            Toast.makeText(this, "تطبيق الرسائل غير متوفر", Toast.LENGTH_SHORT).show()
        }
    }
    
    /**
     * فتح موقع المحل
     */
    private fun openStoreLocation() {
        when {
            store.latitude != null && store.longitude != null -> {
                // فتح الموقع الدقيق
                val uri = Uri.parse("geo:${store.latitude},${store.longitude}?q=${store.latitude},${store.longitude}(${store.name})")
                val intent = Intent(Intent.ACTION_VIEW, uri)
                intent.setPackage("com.google.android.apps.maps")
                
                if (intent.resolveActivity(packageManager) != null) {
                    startActivity(intent)
                } else {
                    // فتح في متصفح الويب
                    val webIntent = Intent(Intent.ACTION_VIEW, 
                        Uri.parse("https://maps.google.com/?q=${store.latitude},${store.longitude}"))
                    startActivity(webIntent)
                }
            }
            !store.address.isNullOrBlank() -> {
                // البحث بالعنوان
                val uri = Uri.parse("geo:0,0?q=${Uri.encode(store.address)}")
                val intent = Intent(Intent.ACTION_VIEW, uri)
                startActivity(intent)
            }
            else -> {
                Toast.makeText(this, "الموقع غير متوفر", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    /**
     * تصدير بيانات المحل
     */
    private fun exportStoreData() {
        lifecycleScope.launch {
            try {
                val file = viewModel.exportStoreData(store.id)
                
                if (file != null) {
                    // مشاركة الملف
                    val intent = Intent(Intent.ACTION_SEND).apply {
                        type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        putExtra(Intent.EXTRA_STREAM, file)
                        putExtra(Intent.EXTRA_SUBJECT, "بيانات المحل: ${store.name}")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    
                    startActivity(Intent.createChooser(intent, "تصدير بيانات المحل"))
                } else {
                    Toast.makeText(this@StoreDetailsActivity, "فشل في تصدير البيانات", Toast.LENGTH_SHORT).show()
                }
                
            } catch (e: Exception) {
                Toast.makeText(this@StoreDetailsActivity, "خطأ في التصدير: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    /**
     * تأكيد حذف المحل
     */
    private fun confirmDeleteStore() {
        MaterialAlertDialogBuilder(this)
            .setTitle("حذف المحل")
            .setMessage("هل أنت متأكد من حذف المحل \"${store.name}\"؟\n\nسيتم حذف جميع المبيعات والمدفوعات المرتبطة به.")
            .setPositiveButton("حذف") { _, _ ->
                deleteStore()
            }
            .setNegativeButton("إلغاء", null)
            .setIcon(R.drawable.ic_warning)
            .show()
    }
    
    /**
     * حذف المحل
     */
    private fun deleteStore() {
        lifecycleScope.launch {
            try {
                viewModel.deleteStore(store)
                
                Toast.makeText(this@StoreDetailsActivity, "تم حذف المحل بنجاح", Toast.LENGTH_SHORT).show()
                setResult(RESULT_OK)
                finish()
                
            } catch (e: Exception) {
                Toast.makeText(this@StoreDetailsActivity, "فشل في حذف المحل: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    /**
     * تحديث البيانات
     */
    private fun refreshData() {
        lifecycleScope.launch {
            viewModel.refreshStoreData()
        }
    }
    
    /**
     * إظهار رسالة خطأ
     */
    private fun showError(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_LONG)
            .setAction("إعادة المحاولة") { refreshData() }
            .show()
    }
    
    /**
     * الحصول على لون نوع السعر
     */
    private fun getPriceTypeColor(priceType: com.networkCards.manager.data.model.PriceType): Int {
        return when (priceType) {
            com.networkCards.manager.data.model.PriceType.RETAIL -> R.color.price_retail
            com.networkCards.manager.data.model.PriceType.WHOLESALE -> R.color.price_wholesale
            com.networkCards.manager.data.model.PriceType.DISTRIBUTOR -> R.color.price_distributor
        }
    }
    
    /**
     * معالجة نتائج الأنشطة
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            REQUEST_CODE_ADD_SALE,
            REQUEST_CODE_ADD_PAYMENT,
            REQUEST_CODE_EDIT_STORE -> {
                if (resultCode == RESULT_OK) {
                    // إعادة تحميل البيانات
                    refreshData()
                }
            }
        }
    }
    
    companion object {
        private const val REQUEST_CODE_ADD_SALE = 1001
        private const val REQUEST_CODE_ADD_PAYMENT = 1002
        private const val REQUEST_CODE_EDIT_STORE = 1003
    }
}

/**
 * إحصائيات المحل
 */
data class StoreStatistics(
    val totalSales: Double,
    val totalPayments: Double,
    val salesCount: Int,
    val paymentsCount: Int,
    val averageSaleValue: Double,
    val averagePaymentValue: Double,
    val lastSaleDate: Date?,
    val lastPaymentDate: Date?
)