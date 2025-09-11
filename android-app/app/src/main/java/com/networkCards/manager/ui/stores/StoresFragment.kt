package com.networkCards.manager.ui.stores

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.*
import android.widget.Toast
import androidx.appcompat.widget.SearchView
import androidx.core.app.ActivityCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.networkCards.manager.R
import com.networkCards.manager.databinding.FragmentStoresBinding
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.PriceType
import com.networkCards.manager.ui.stores.adapter.StoresAdapter
import com.networkCards.manager.ui.store.AddEditStoreActivity
import com.networkCards.manager.ui.store.StoreDetailsActivity
import com.networkCards.manager.util.SwipeToDeleteCallback
import com.networkCards.manager.util.CurrencyFormatter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * جزء المحلات
 * يعرض قائمة المحلات مع ميزات البحث والفلترة
 */
@AndroidEntryPoint
class StoresFragment : Fragment() {
    
    private var _binding: FragmentStoresBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: StoresViewModel by viewModels()
    
    private lateinit var storesAdapter: StoresAdapter
    private var currentQuery: String = ""
    private var currentFilter: PriceType? = null
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStoresBinding.inflate(inflater, container, false)
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
        setupRecyclerView()
        setupSearchView()
        setupFilterChips()
        setupFAB()
        setupSwipeRefresh()
        setupSwipeToDelete()
    }
    
    /**
     * إعداد قائمة المحلات
     */
    private fun setupRecyclerView() {
        storesAdapter = StoresAdapter(
            onStoreClick = { store -> openStoreDetails(store) },
            onCallClick = { store -> callStore(store) },
            onLocationClick = { store -> openStoreLocation(store) },
            onEditClick = { store -> editStore(store) }
        )
        
        binding.recyclerViewStores.apply {
            adapter = storesAdapter
            layoutManager = LinearLayoutManager(requireContext())
            setHasFixedSize(true)
            
            // إضافة تأثيرات الحركة
            itemAnimator = androidx.recyclerview.widget.DefaultItemAnimator().apply {
                addDuration = 300
                removeDuration = 300
                moveDuration = 300
                changeDuration = 300
            }
        }
    }
    
    /**
     * إعداد البحث
     */
    private fun setupSearchView() {
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                searchStores(query ?: "")
                binding.searchView.clearFocus()
                return true
            }
            
            override fun onQueryTextChange(newText: String?): Boolean {
                currentQuery = newText ?: ""
                
                // بحث فوري بعد تأخير قصير
                binding.searchView.removeCallbacks(searchRunnable)
                binding.searchView.postDelayed(searchRunnable, 300)
                
                return true
            }
        })
        
        // إعداد أيقونة البحث
        binding.searchView.queryHint = "البحث في المحلات..."
    }
    
    private val searchRunnable = Runnable {
        searchStores(currentQuery)
    }
    
    /**
     * إعداد رقائق الفلترة
     */
    private fun setupFilterChips() {
        binding.chipGroupFilters.setOnCheckedStateChangeListener { group, checkedIds ->
            val selectedChipId = checkedIds.firstOrNull()
            
            currentFilter = when (selectedChipId) {
                R.id.chip_retail -> PriceType.RETAIL
                R.id.chip_wholesale -> PriceType.WHOLESALE
                R.id.chip_distributor -> PriceType.DISTRIBUTOR
                else -> null
            }
            
            applyFilters()
        }
    }
    
    /**
     * إعداد الزر العائم
     */
    private fun setupFAB() {
        binding.fabAddStore.setOnClickListener {
            val intent = Intent(requireContext(), AddEditStoreActivity::class.java)
            startActivity(intent)
        }
    }
    
    /**
     * إعداد Pull-to-Refresh
     */
    private fun setupSwipeRefresh() {
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
     * إعداد السحب للحذف
     */
    private fun setupSwipeToDelete() {
        val swipeToDeleteCallback = object : SwipeToDeleteCallback(requireContext()) {
            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val position = viewHolder.adapterPosition
                val store = storesAdapter.getStoreAt(position)
                
                deleteStore(store, position)
            }
        }
        
        val itemTouchHelper = ItemTouchHelper(swipeToDeleteCallback)
        itemTouchHelper.attachToRecyclerView(binding.recyclerViewStores)
    }
    
    /**
     * مراقبة البيانات
     */
    private fun observeData() {
        // مراقبة قائمة المحلات
        viewModel.stores.observe(viewLifecycleOwner) { stores ->
            storesAdapter.submitList(stores)
            
            // تحديث عدد النتائج
            binding.textResultsCount.text = getString(R.string.stores_count, stores.size)
            
            // إظهار/إخفاء رسالة عدم وجود بيانات
            binding.emptyStateLayout.visibility = 
                if (stores.isEmpty()) View.VISIBLE else View.GONE
        }
        
        // مراقبة حالة التحميل
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefreshLayout.isRefreshing = isLoading
            
            // إظهار skeleton loading للتحميل الأولي
            if (isLoading && storesAdapter.itemCount == 0) {
                binding.skeletonLayout.visibility = View.VISIBLE
                binding.recyclerViewStores.visibility = View.GONE
            } else {
                binding.skeletonLayout.visibility = View.GONE
                binding.recyclerViewStores.visibility = View.VISIBLE
            }
        }
        
        // مراقبة الأخطاء
        viewModel.error.observe(viewLifecycleOwner) { error ->
            if (error != null) {
                showError(error)
                viewModel.clearError()
            }
        }
        
        // مراقبة إحصائيات المحلات
        viewModel.storeStatistics.observe(viewLifecycleOwner) { stats ->
            updateStatistics(stats)
        }
    }
    
    /**
     * تحميل البيانات
     */
    private fun loadData() {
        lifecycleScope.launch {
            viewModel.loadStores()
        }
    }
    
    /**
     * البحث في المحلات
     */
    private fun searchStores(query: String) {
        lifecycleScope.launch {
            viewModel.searchStores(query, currentFilter)
        }
    }
    
    /**
     * تطبيق الفلاتر
     */
    private fun applyFilters() {
        lifecycleScope.launch {
            viewModel.searchStores(currentQuery, currentFilter)
        }
    }
    
    /**
     * فتح تفاصيل المحل
     */
    private fun openStoreDetails(store: Store) {
        val intent = Intent(requireContext(), StoreDetailsActivity::class.java).apply {
            putExtra("store_id", store.id)
            putExtra("store", store)
        }
        startActivity(intent)
    }
    
    /**
     * تعديل المحل
     */
    private fun editStore(store: Store) {
        val intent = Intent(requireContext(), AddEditStoreActivity::class.java).apply {
            putExtra("store_id", store.id)
            putExtra("store", store)
        }
        startActivity(intent)
    }
    
    /**
     * الاتصال بالمحل
     */
    private fun callStore(store: Store) {
        if (store.phone.isNullOrBlank()) {
            Toast.makeText(requireContext(), "رقم الهاتف غير متوفر", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (ActivityCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.CALL_PHONE
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:${store.phone}")
            }
            startActivity(intent)
        } else {
            // طلب صلاحية الاتصال
            ActivityCompat.requestPermissions(
                requireActivity(),
                arrayOf(Manifest.permission.CALL_PHONE),
                REQUEST_CODE_CALL_PERMISSION
            )
        }
    }
    
    /**
     * فتح موقع المحل
     */
    private fun openStoreLocation(store: Store) {
        if (store.latitude != null && store.longitude != null) {
            // فتح الموقع الدقيق
            val uri = Uri.parse("geo:${store.latitude},${store.longitude}?q=${store.latitude},${store.longitude}(${store.name})")
            val intent = Intent(Intent.ACTION_VIEW, uri)
            intent.setPackage("com.google.android.apps.maps")
            
            if (intent.resolveActivity(requireActivity().packageManager) != null) {
                startActivity(intent)
            } else {
                // فتح في متصفح الويب
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com/?q=${store.latitude},${store.longitude}"))
                startActivity(webIntent)
            }
        } else if (!store.address.isNullOrBlank()) {
            // البحث بالعنوان
            val uri = Uri.parse("geo:0,0?q=${Uri.encode(store.address)}")
            val intent = Intent(Intent.ACTION_VIEW, uri)
            startActivity(intent)
        } else {
            Toast.makeText(requireContext(), "الموقع غير متوفر", Toast.LENGTH_SHORT).show()
        }
    }
    
    /**
     * حذف محل
     */
    private fun deleteStore(store: Store, position: Int) {
        // إظهار Snackbar مع إمكانية التراجع
        val snackbar = Snackbar.make(
            binding.root,
            "تم حذف ${store.name}",
            Snackbar.LENGTH_LONG
        )
        
        snackbar.setAction("تراجع") {
            // إعادة المحل
            storesAdapter.restoreStore(store, position)
        }
        
        snackbar.addCallback(object : Snackbar.Callback() {
            override fun onDismissed(transientBottomBar: Snackbar?, event: Int) {
                if (event != DISMISS_EVENT_ACTION) {
                    // تأكيد الحذف
                    lifecycleScope.launch {
                        viewModel.deleteStore(store)
                    }
                }
            }
        })
        
        snackbar.show()
    }
    
    /**
     * إظهار نافذة البحث
     */
    fun showSearchDialog() {
        binding.searchView.requestFocus()
        binding.searchView.isIconified = false
    }
    
    /**
     * تحديث الإحصائيات
     */
    private fun updateStatistics(stats: StoreStatistics) {
        binding.apply {
            textTotalStores.text = stats.totalStores.toString()
            textActiveStores.text = stats.activeStores.toString()
            textStoresWithDebt.text = stats.storesWithDebt.toString()
            textTotalDebt.text = CurrencyFormatter.format(stats.totalDebt)
        }
    }
    
    /**
     * إظهار رسالة خطأ
     */
    private fun showError(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_LONG)
            .setAction("إعادة المحاولة") { loadData() }
            .show()
    }
    
    /**
     * إظهار خيارات الترتيب
     */
    private fun showSortOptions() {
        val options = arrayOf(
            "الاسم (أ-ي)",
            "الاسم (ي-أ)", 
            "الرصيد (الأعلى)",
            "الرصيد (الأقل)",
            "تاريخ الإضافة (الأحدث)",
            "تاريخ الإضافة (الأقدم)"
        )
        
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("ترتيب حسب")
            .setItems(options) { _, which ->
                val sortBy = when (which) {
                    0 -> "name_asc"
                    1 -> "name_desc"
                    2 -> "balance_desc"
                    3 -> "balance_asc"
                    4 -> "date_desc"
                    5 -> "date_asc"
                    else -> "name_asc"
                }
                
                lifecycleScope.launch {
                    viewModel.sortStores(sortBy)
                }
            }
            .show()
    }
    
    /**
     * إظهار خيارات المزيد
     */
    private fun showMoreOptions() {
        val options = arrayOf(
            "تصدير قائمة المحلات",
            "استيراد محلات",
            "إحصائيات مفصلة",
            "نسخة احتياطية"
        )
        
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("خيارات إضافية")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> exportStores()
                    1 -> importStores()
                    2 -> showDetailedStatistics()
                    3 -> createBackup()
                }
            }
            .show()
    }
    
    /**
     * تصدير المحلات
     */
    private fun exportStores() {
        lifecycleScope.launch {
            try {
                val file = viewModel.exportStores()
                
                // مشاركة الملف
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    putExtra(Intent.EXTRA_STREAM, file)
                    putExtra(Intent.EXTRA_SUBJECT, "قائمة المحلات")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                
                startActivity(Intent.createChooser(intent, "تصدير قائمة المحلات"))
                
            } catch (e: Exception) {
                showError("فشل في تصدير قائمة المحلات: ${e.message}")
            }
        }
    }
    
    /**
     * استيراد المحلات
     */
    private fun importStores() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "application/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }
        
        startActivityForResult(
            Intent.createChooser(intent, "اختيار ملف الاستيراد"),
            REQUEST_CODE_IMPORT
        )
    }
    
    /**
     * إظهار إحصائيات مفصلة
     */
    private fun showDetailedStatistics() {
        lifecycleScope.launch {
            val stats = viewModel.getDetailedStatistics()
            
            val message = """
                📊 إحصائيات مفصلة:
                
                إجمالي المحلات: ${stats.totalStores}
                المحلات النشطة: ${stats.activeStores}
                المحلات غير النشطة: ${stats.totalStores - stats.activeStores}
                
                المحلات المدينة: ${stats.storesWithDebt}
                إجمالي الديون: ${CurrencyFormatter.format(stats.totalDebt)}
                متوسط الرصيد: ${CurrencyFormatter.format(stats.averageBalance)}
                
                توزيع أنواع الأسعار:
                تجزئة: ${stats.retailStores}
                جملة: ${stats.wholesaleStores}
                موزعين: ${stats.distributorStores}
            """.trimIndent()
            
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("📊 إحصائيات المحلات")
                .setMessage(message)
                .setPositiveButton("إغلاق", null)
                .show()
        }
    }
    
    /**
     * إنشاء نسخة احتياطية
     */
    private fun createBackup() {
        lifecycleScope.launch {
            try {
                val backupFile = viewModel.createStoresBackup()
                
                Toast.makeText(
                    requireContext(),
                    "تم إنشاء النسخة الاحتياطية بنجاح",
                    Toast.LENGTH_SHORT
                ).show()
                
                // إمكانية مشاركة النسخة
                Snackbar.make(binding.root, "تم إنشاء النسخة الاحتياطية", Snackbar.LENGTH_LONG)
                    .setAction("مشاركة") {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "application/json"
                            putExtra(Intent.EXTRA_STREAM, backupFile)
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        startActivity(Intent.createChooser(shareIntent, "مشاركة النسخة الاحتياطية"))
                    }
                    .show()
                    
            } catch (e: Exception) {
                showError("فشل في إنشاء النسخة الاحتياطية: ${e.message}")
            }
        }
    }
    
    /**
     * معالجة نتائج الأنشطة
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            REQUEST_CODE_IMPORT -> {
                if (resultCode == android.app.Activity.RESULT_OK) {
                    data?.data?.let { uri ->
                        importStoresFromFile(uri)
                    }
                }
            }
        }
    }
    
    /**
     * استيراد المحلات من ملف
     */
    private fun importStoresFromFile(uri: Uri) {
        lifecycleScope.launch {
            try {
                val importedCount = viewModel.importStoresFromFile(uri)
                
                Toast.makeText(
                    requireContext(),
                    "تم استيراد $importedCount محل بنجاح",
                    Toast.LENGTH_SHORT
                ).show()
                
                loadData() // إعادة تحميل البيانات
                
            } catch (e: Exception) {
                showError("فشل في استيراد المحلات: ${e.message}")
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
    companion object {
        private const val REQUEST_CODE_CALL_PERMISSION = 1001
        private const val REQUEST_CODE_IMPORT = 1002
    }
}