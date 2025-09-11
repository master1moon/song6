package com.networkCards.manager.ui.packages

import android.content.Intent
import android.os.Bundle
import android.view.*
import android.widget.Toast
import androidx.appcompat.widget.SearchView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.networkCards.manager.R
import com.networkCards.manager.databinding.FragmentPackagesBinding
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.ui.packages.adapter.PackagesAdapter
import com.networkCards.manager.ui.package.AddEditPackageActivity
import com.networkCards.manager.ui.scanner.BarcodeScannerActivity
import com.networkCards.manager.util.SwipeToDeleteCallback
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * جزء الباقات
 * يعرض قائمة الباقات مع ميزات البحث والفلترة
 */
@AndroidEntryPoint
class PackagesFragment : Fragment() {
    
    private var _binding: FragmentPackagesBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: PackagesViewModel by viewModels()
    
    private lateinit var packagesAdapter: PackagesAdapter
    private var currentQuery: String = ""
    private var currentCategory: String? = null
    private var showOnlyFeatured: Boolean = false
    private var stockFilter: String? = null
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPackagesBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupUI()
        observeData()
        loadData()
        
        // معالجة نتائج مسح الباركود
        parentFragmentManager.setFragmentResultListener(
            "barcode_scanned",
            this
        ) { _, bundle ->
            val packageId = bundle.getString("package_id")
            packageId?.let { highlightPackage(it) }
        }
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
     * إعداد قائمة الباقات
     */
    private fun setupRecyclerView() {
        packagesAdapter = PackagesAdapter(
            onPackageClick = { package -> openPackageDetails(package) },
            onEditClick = { package -> editPackage(package) },
            onToggleFeaturedClick = { package -> togglePackageFeatured(package) },
            onStockClick = { package -> showStockDialog(package) }
        )
        
        binding.recyclerViewPackages.apply {
            adapter = packagesAdapter
            layoutManager = GridLayoutManager(requireContext(), 2)
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
                searchPackages(query ?: "")
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
        
        binding.searchView.queryHint = "البحث في الباقات..."
    }
    
    private val searchRunnable = Runnable {
        searchPackages(currentQuery)
    }
    
    /**
     * إعداد رقائق الفلترة
     */
    private fun setupFilterChips() {
        // فلتر المميزة
        binding.chipFeatured.setOnCheckedChangeListener { _, isChecked ->
            showOnlyFeatured = isChecked
            applyFilters()
        }
        
        // فلتر المخزون
        binding.chipGroupStockFilter.setOnCheckedStateChangeListener { _, checkedIds ->
            stockFilter = when (checkedIds.firstOrNull()) {
                R.id.chip_in_stock -> "NORMAL"
                R.id.chip_low_stock -> "LOW"
                R.id.chip_out_of_stock -> "OUT"
                else -> null
            }
            applyFilters()
        }
    }
    
    /**
     * إعداد الزر العائم
     */
    private fun setupFAB() {
        binding.fabAddPackage.setOnClickListener {
            val intent = Intent(requireContext(), AddEditPackageActivity::class.java)
            startActivity(intent)
        }
        
        // زر مسح الباركود
        binding.fabScanBarcode.setOnClickListener {
            val intent = Intent(requireContext(), BarcodeScannerActivity::class.java)
            startActivityForResult(intent, REQUEST_CODE_SCAN)
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
                val package = packagesAdapter.getPackageAt(position)
                
                deletePackage(package, position)
            }
        }
        
        val itemTouchHelper = ItemTouchHelper(swipeToDeleteCallback)
        itemTouchHelper.attachToRecyclerView(binding.recyclerViewPackages)
    }
    
    /**
     * مراقبة البيانات
     */
    private fun observeData() {
        // مراقبة قائمة الباقات
        viewModel.packages.observe(viewLifecycleOwner) { packages ->
            packagesAdapter.submitList(packages)
            
            // تحديث عدد النتائج
            binding.textResultsCount.text = getString(R.string.packages_count, packages.size)
            
            // إظهار/إخفاء رسالة عدم وجود بيانات
            binding.emptyStateLayout.visibility = 
                if (packages.isEmpty()) View.VISIBLE else View.GONE
        }
        
        // مراقبة الفئات المتاحة
        viewModel.availableCategories.observe(viewLifecycleOwner) { categories ->
            updateCategoryChips(categories)
        }
        
        // مراقبة إحصائيات الباقات
        viewModel.packageStatistics.observe(viewLifecycleOwner) { stats ->
            updateStatistics(stats)
        }
        
        // مراقبة حالة التحميل
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefreshLayout.isRefreshing = isLoading
            
            if (isLoading && packagesAdapter.itemCount == 0) {
                binding.skeletonLayout.visibility = View.VISIBLE
                binding.recyclerViewPackages.visibility = View.GONE
            } else {
                binding.skeletonLayout.visibility = View.GONE
                binding.recyclerViewPackages.visibility = View.VISIBLE
            }
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
            viewModel.loadPackages()
        }
    }
    
    /**
     * البحث في الباقات
     */
    private fun searchPackages(query: String) {
        lifecycleScope.launch {
            viewModel.searchPackages(query, currentCategory, showOnlyFeatured, stockFilter)
        }
    }
    
    /**
     * تطبيق الفلاتر
     */
    private fun applyFilters() {
        lifecycleScope.launch {
            viewModel.searchPackages(currentQuery, currentCategory, showOnlyFeatured, stockFilter)
        }
    }
    
    /**
     * تحديث رقائق الفئات
     */
    private fun updateCategoryChips(categories: List<String>) {
        binding.chipGroupCategories.removeAllViews()
        
        categories.forEach { category ->
            val chip = com.google.android.material.chip.Chip(requireContext())
            chip.text = category
            chip.isCheckable = true
            chip.setOnCheckedChangeListener { _, isChecked ->
                currentCategory = if (isChecked) category else null
                applyFilters()
            }
            
            binding.chipGroupCategories.addView(chip)
        }
    }
    
    /**
     * فتح تفاصيل الباقة
     */
    private fun openPackageDetails(package: Package) {
        val intent = Intent(requireContext(), PackageDetailsActivity::class.java).apply {
            putExtra("package_id", package.id)
            putExtra("package", package)
        }
        startActivity(intent)
    }
    
    /**
     * تعديل الباقة
     */
    private fun editPackage(package: Package) {
        val intent = Intent(requireContext(), AddEditPackageActivity::class.java).apply {
            putExtra("package_id", package.id)
            putExtra("package", package)
        }
        startActivity(intent)
    }
    
    /**
     * تبديل تمييز الباقة
     */
    private fun togglePackageFeatured(package: Package) {
        lifecycleScope.launch {
            try {
                viewModel.togglePackageFeatured(package.id, !package.isFeatured)
                
                val message = if (package.isFeatured) {
                    "تم إلغاء تمييز الباقة"
                } else {
                    "تم تمييز الباقة"
                }
                
                Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
                
            } catch (e: Exception) {
                showError("فشل في تحديث الباقة: ${e.message}")
            }
        }
    }
    
    /**
     * إظهار نافذة المخزون
     */
    private fun showStockDialog(package: Package) {
        val options = arrayOf(
            "إضافة للمخزون",
            "خصم من المخزون",
            "تسجيل تلف",
            "عرض حركة المخزون"
        )
        
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("إدارة المخزون: ${package.name}")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> showAddStockDialog(package)
                    1 -> showRemoveStockDialog(package)
                    2 -> showDamageDialog(package)
                    3 -> showInventoryMovements(package)
                }
            }
            .show()
    }
    
    /**
     * إظهار نافذة إضافة مخزون
     */
    private fun showAddStockDialog(package: Package) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_stock, null)
        val editTextQuantity = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.edit_text_quantity)
        val editTextNotes = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.edit_text_notes)
        val editTextUnitCost = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.edit_text_unit_cost)
        
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("إضافة للمخزون: ${package.name}")
            .setView(dialogView)
            .setPositiveButton("إضافة") { _, _ ->
                val quantity = editTextQuantity.text.toString().toIntOrNull()
                val notes = editTextNotes.text.toString().trim().takeIf { it.isNotEmpty() }
                val unitCost = editTextUnitCost.text.toString().toDoubleOrNull()
                
                if (quantity != null && quantity > 0) {
                    addToStock(package.id, quantity, notes, unitCost)
                } else {
                    Toast.makeText(requireContext(), "يرجى إدخال كمية صحيحة", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }
    
    /**
     * إظهار نافذة خصم مخزون
     */
    private fun showRemoveStockDialog(package: Package) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_remove_stock, null)
        val editTextQuantity = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.edit_text_quantity)
        val editTextReason = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.edit_text_reason)
        
        // إظهار المخزون المتاح
        val textAvailableStock = dialogView.findViewById<android.widget.TextView>(R.id.text_available_stock)
        textAvailableStock.text = "المخزون المتاح: ${package.currentStock} كرت"
        
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("خصم من المخزون: ${package.name}")
            .setView(dialogView)
            .setPositiveButton("خصم") { _, _ ->
                val quantity = editTextQuantity.text.toString().toIntOrNull()
                val reason = editTextReason.text.toString().trim().takeIf { it.isNotEmpty() }
                
                when {
                    quantity == null || quantity <= 0 -> {
                        Toast.makeText(requireContext(), "يرجى إدخال كمية صحيحة", Toast.LENGTH_SHORT).show()
                    }
                    quantity > package.currentStock -> {
                        Toast.makeText(requireContext(), "الكمية أكبر من المخزون المتاح", Toast.LENGTH_SHORT).show()
                    }
                    else -> {
                        removeFromStock(package.id, quantity, reason)
                    }
                }
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }
    
    /**
     * إضافة للمخزون
     */
    private fun addToStock(packageId: String, quantity: Int, notes: String?, unitCost: Double?) {
        lifecycleScope.launch {
            try {
                viewModel.addToStock(packageId, quantity, notes, unitCost)
                Toast.makeText(requireContext(), "تم إضافة $quantity كرت للمخزون", Toast.LENGTH_SHORT).show()
                
            } catch (e: Exception) {
                showError("فشل في إضافة المخزون: ${e.message}")
            }
        }
    }
    
    /**
     * خصم من المخزون
     */
    private fun removeFromStock(packageId: String, quantity: Int, reason: String?) {
        lifecycleScope.launch {
            try {
                val success = viewModel.removeFromStock(packageId, quantity, reason)
                
                if (success) {
                    Toast.makeText(requireContext(), "تم خصم $quantity كرت من المخزون", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(requireContext(), "فشل في خصم المخزون - تحقق من الكمية المتاحة", Toast.LENGTH_SHORT).show()
                }
                
            } catch (e: Exception) {
                showError("فشل في خصم المخزون: ${e.message}")
            }
        }
    }
    
    /**
     * حذف باقة
     */
    private fun deletePackage(package: Package, position: Int) {
        // التحقق من وجود مبيعات مرتبطة
        lifecycleScope.launch {
            val hasRelatedSales = viewModel.hasRelatedSales(package.id)
            
            if (hasRelatedSales) {
                MaterialAlertDialogBuilder(requireContext())
                    .setTitle("تحذير")
                    .setMessage("هذه الباقة لها مبيعات مرتبطة. حذفها سيؤثر على التقارير. هل تريد المتابعة؟")
                    .setPositiveButton("حذف مع ذلك") { _, _ ->
                        performDelete(package, position)
                    }
                    .setNegativeButton("إلغاء") { _, _ ->
                        packagesAdapter.notifyItemChanged(position)
                    }
                    .show()
            } else {
                performDelete(package, position)
            }
        }
    }
    
    /**
     * تنفيذ الحذف
     */
    private fun performDelete(package: Package, position: Int) {
        val snackbar = Snackbar.make(
            binding.root,
            "تم حذف ${package.name}",
            Snackbar.LENGTH_LONG
        )
        
        snackbar.setAction("تراجع") {
            packagesAdapter.restorePackage(package, position)
        }
        
        snackbar.addCallback(object : Snackbar.Callback() {
            override fun onDismissed(transientBottomBar: Snackbar?, event: Int) {
                if (event != DISMISS_EVENT_ACTION) {
                    lifecycleScope.launch {
                        viewModel.deletePackage(package)
                    }
                }
            }
        })
        
        snackbar.show()
    }
    
    /**
     * تمييز باقة محددة
     */
    private fun highlightPackage(packageId: String) {
        lifecycleScope.launch {
            val packages = viewModel.packages.value ?: return@launch
            val position = packages.indexOfFirst { it.id == packageId }
            
            if (position >= 0) {
                binding.recyclerViewPackages.scrollToPosition(position)
                
                // تأثير تمييز
                binding.recyclerViewPackages.postDelayed({
                    val viewHolder = binding.recyclerViewPackages.findViewHolderForAdapterPosition(position)
                    viewHolder?.itemView?.let { view ->
                        val originalBackground = view.background
                        view.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.accent_light))
                        
                        view.postDelayed({
                            view.background = originalBackground
                        }, 2000)
                    }
                }, 500)
                
                Toast.makeText(requireContext(), "تم العثور على الباقة", Toast.LENGTH_SHORT).show()
            }
        }
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
    private fun updateStatistics(stats: PackageStatistics) {
        binding.apply {
            textTotalPackages.text = stats.totalPackages.toString()
            textActivePackages.text = stats.activePackages.toString()
            textLowStockPackages.text = stats.lowStockPackages.toString()
            textOutOfStockPackages.text = stats.outOfStockPackages.toString()
            textTotalStock.text = "${stats.totalStock} كرت"
            textFeaturedPackages.text = stats.featuredPackages.toString()
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
     * معالجة نتائج الأنشطة
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            REQUEST_CODE_SCAN -> {
                if (resultCode == android.app.Activity.RESULT_OK) {
                    val scannedData = data?.getStringExtra("scanned_data")
                    scannedData?.let { handleScannedBarcode(it) }
                }
            }
        }
    }
    
    /**
     * معالجة الباركود الممسوح
     */
    private fun handleScannedBarcode(barcode: String) {
        lifecycleScope.launch {
            try {
                val package = viewModel.findPackageByBarcode(barcode)
                
                if (package != null) {
                    highlightPackage(package.id)
                } else {
                    // اقتراح إضافة باقة جديدة بهذا الباركود
                    MaterialAlertDialogBuilder(requireContext())
                        .setTitle("باقة غير موجودة")
                        .setMessage("لم يتم العثور على باقة بهذا الرمز. هل تريد إضافة باقة جديدة؟")
                        .setPositiveButton("إضافة") { _, _ ->
                            val intent = Intent(requireContext(), AddEditPackageActivity::class.java).apply {
                                putExtra("barcode", barcode)
                            }
                            startActivity(intent)
                        }
                        .setNegativeButton("إلغاء", null)
                        .show()
                }
                
            } catch (e: Exception) {
                showError("خطأ في معالجة الباركود: ${e.message}")
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
    companion object {
        private const val REQUEST_CODE_SCAN = 1001
    }
}