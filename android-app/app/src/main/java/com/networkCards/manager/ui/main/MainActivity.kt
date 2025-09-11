package com.networkCards.manager.ui.main

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.navigation.NavigationBarView
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ActivityMainBinding
import com.networkCards.manager.ui.dashboard.DashboardFragment
import com.networkCards.manager.ui.stores.StoresFragment
import com.networkCards.manager.ui.packages.PackagesFragment
import com.networkCards.manager.ui.reports.ReportsFragment
import com.networkCards.manager.ui.settings.SettingsActivity
import com.networkCards.manager.ui.scanner.BarcodeScannerActivity
import com.networkCards.manager.util.NetworkUtil
import com.networkCards.manager.util.PermissionUtil
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * الشاشة الرئيسية للتطبيق
 * تحتوي على التنقل السفلي والأجزاء الرئيسية
 */
@AndroidEntryPoint
class MainActivity : AppCompatActivity(), NavigationBarView.OnItemSelectedListener {
    
    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()
    
    private var currentFragment: Fragment? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // إعداد View Binding
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // إعداد الشريط العلوي
        setSupportActionBar(binding.toolbar)
        
        // إعداد التنقل السفلي
        setupBottomNavigation()
        
        // تحميل الجزء الافتراضي
        if (savedInstanceState == null) {
            loadFragment(DashboardFragment(), getString(R.string.dashboard))
            binding.bottomNavigation.selectedItemId = R.id.nav_dashboard
        }
        
        // مراقبة حالة الشبكة
        observeNetworkStatus()
        
        // مراقبة حالة المزامنة
        observeSyncStatus()
        
        // طلب الصلاحيات المطلوبة
        requestNecessaryPermissions()
    }
    
    /**
     * إعداد التنقل السفلي
     */
    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener(this)
        
        // تخصيص ألوان التنقل
        binding.bottomNavigation.itemIconTintList = getColorStateList(R.color.bottom_nav_color)
        binding.bottomNavigation.itemTextColor = getColorStateList(R.color.bottom_nav_color)
    }
    
    /**
     * معالجة اختيار عناصر التنقل السفلي
     */
    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        val fragment: Fragment
        val title: String
        
        when (item.itemId) {
            R.id.nav_dashboard -> {
                fragment = DashboardFragment()
                title = getString(R.string.dashboard)
            }
            R.id.nav_stores -> {
                fragment = StoresFragment()
                title = getString(R.string.stores)
            }
            R.id.nav_packages -> {
                fragment = PackagesFragment()
                title = getString(R.string.packages)
            }
            R.id.nav_reports -> {
                fragment = ReportsFragment()
                title = getString(R.string.reports)
            }
            else -> return false
        }
        
        loadFragment(fragment, title)
        return true
    }
    
    /**
     * تحميل جزء جديد
     */
    private fun loadFragment(fragment: Fragment, title: String) {
        supportActionBar?.title = title
        
        // تأثير انتقال سلس
        supportFragmentManager.beginTransaction()
            .setCustomAnimations(
                R.anim.slide_in_right,
                R.anim.slide_out_left,
                R.anim.slide_in_left,
                R.anim.slide_out_right
            )
            .replace(R.id.fragment_container, fragment)
            .commit()
        
        currentFragment = fragment
    }
    
    /**
     * إنشاء قائمة الخيارات
     */
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        
        // إظهار/إخفاء عناصر القائمة حسب الجزء الحالي
        updateMenuVisibility(menu)
        
        return true
    }
    
    /**
     * تحديث رؤية عناصر القائمة
     */
    private fun updateMenuVisibility(menu: Menu) {
        val searchItem = menu.findItem(R.id.action_search)
        val syncItem = menu.findItem(R.id.action_sync)
        val scanItem = menu.findItem(R.id.action_scan)
        
        // إظهار البحث في صفحات المحلات والباقات
        searchItem.isVisible = currentFragment is StoresFragment || currentFragment is PackagesFragment
        
        // إظهار المسح الضوئي في صفحة الباقات
        scanItem.isVisible = currentFragment is PackagesFragment
        
        // إظهار المزامنة دائماً
        syncItem.isVisible = true
    }
    
    /**
     * معالجة اختيار عناصر القائمة
     */
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_search -> {
                handleSearchAction()
                true
            }
            R.id.action_sync -> {
                handleSyncAction()
                true
            }
            R.id.action_scan -> {
                handleScanAction()
                true
            }
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            R.id.action_backup -> {
                handleBackupAction()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    /**
     * معالجة البحث
     */
    private fun handleSearchAction() {
        when (currentFragment) {
            is StoresFragment -> {
                (currentFragment as StoresFragment).showSearchDialog()
            }
            is PackagesFragment -> {
                (currentFragment as PackagesFragment).showSearchDialog()
            }
        }
    }
    
    /**
     * معالجة المزامنة
     */
    private fun handleSyncAction() {
        lifecycleScope.launch {
            try {
                binding.progressBar.isVisible = true
                viewModel.syncData()
                Toast.makeText(this@MainActivity, "تمت المزامنة بنجاح", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "فشلت المزامنة: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                binding.progressBar.isVisible = false
            }
        }
    }
    
    /**
     * معالجة المسح الضوئي
     */
    private fun handleScanAction() {
        if (PermissionUtil.hasCameraPermission(this)) {
            val intent = Intent(this, BarcodeScannerActivity::class.java)
            startActivityForResult(intent, REQUEST_CODE_SCAN)
        } else {
            PermissionUtil.requestCameraPermission(this) { granted ->
                if (granted) {
                    handleScanAction()
                } else {
                    Toast.makeText(this, "صلاحية الكاميرا مطلوبة للمسح الضوئي", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
    
    /**
     * معالجة النسخ الاحتياطي
     */
    private fun handleBackupAction() {
        lifecycleScope.launch {
            try {
                binding.progressBar.isVisible = true
                val backupFile = viewModel.createBackup()
                
                // مشاركة ملف النسخة الاحتياطية
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/json"
                    putExtra(Intent.EXTRA_STREAM, backupFile)
                    putExtra(Intent.EXTRA_SUBJECT, "نسخة احتياطية - نظام كروت الشبكة")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                
                startActivity(Intent.createChooser(shareIntent, "مشاركة النسخة الاحتياطية"))
                
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "فشل في إنشاء النسخة الاحتياطية", Toast.LENGTH_LONG).show()
            } finally {
                binding.progressBar.isVisible = false
            }
        }
    }
    
    /**
     * مراقبة حالة الشبكة
     */
    private fun observeNetworkStatus() {
        lifecycleScope.launch {
            NetworkUtil.observeNetworkStatus(this@MainActivity).collect { isConnected ->
                binding.networkStatus.isVisible = !isConnected
                
                if (!isConnected) {
                    binding.networkStatus.text = "⚠️ لا يوجد اتصال إنترنت - العمل في الوضع المحلي"
                    binding.networkStatus.setBackgroundColor(getColor(R.color.warning))
                }
            }
        }
    }
    
    /**
     * مراقبة حالة المزامنة
     */
    private fun observeSyncStatus() {
        viewModel.syncStatus.observe(this) { status ->
            binding.syncStatus.isVisible = status != null
            
            when (status) {
                is SyncStatus.InProgress -> {
                    binding.syncStatus.text = "🔄 جاري المزامنة..."
                    binding.syncStatus.setBackgroundColor(getColor(R.color.info))
                }
                is SyncStatus.Success -> {
                    binding.syncStatus.text = "✅ تمت المزامنة"
                    binding.syncStatus.setBackgroundColor(getColor(R.color.success))
                    
                    // إخفاء الرسالة بعد 3 ثوانٍ
                    binding.syncStatus.postDelayed({
                        binding.syncStatus.isVisible = false
                    }, 3000)
                }
                is SyncStatus.Error -> {
                    binding.syncStatus.text = "❌ فشلت المزامنة: ${status.message}"
                    binding.syncStatus.setBackgroundColor(getColor(R.color.error))
                }
            }
        }
    }
    
    /**
     * طلب الصلاحيات الضرورية
     */
    private fun requestNecessaryPermissions() {
        PermissionUtil.requestBasicPermissions(this) { allGranted ->
            if (!allGranted) {
                Toast.makeText(
                    this,
                    "بعض الميزات قد لا تعمل بدون الصلاحيات المطلوبة",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    /**
     * معالجة نتائج الأنشطة
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            REQUEST_CODE_SCAN -> {
                if (resultCode == RESULT_OK) {
                    val scannedData = data?.getStringExtra("scanned_data")
                    scannedData?.let { handleScannedData(it) }
                }
            }
        }
    }
    
    /**
     * معالجة البيانات الممسوحة ضوئياً
     */
    private fun handleScannedData(data: String) {
        lifecycleScope.launch {
            try {
                // البحث عن الباقة بالباركود
                val package = viewModel.findPackageByBarcode(data)
                
                if (package != null) {
                    Toast.makeText(this@MainActivity, "تم العثور على: ${package.name}", Toast.LENGTH_SHORT).show()
                    
                    // الانتقال لصفحة الباقات وتمييز الباقة المطلوبة
                    binding.bottomNavigation.selectedItemId = R.id.nav_packages
                    
                    // إرسال البيانات للجزء
                    supportFragmentManager.setFragmentResult(
                        "barcode_scanned",
                        Bundle().apply {
                            putString("package_id", package.id)
                        }
                    )
                } else {
                    Toast.makeText(this@MainActivity, "لم يتم العثور على باقة بهذا الرمز", Toast.LENGTH_SHORT).show()
                }
                
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "خطأ في معالجة الرمز الممسوح", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    /**
     * معالجة زر الرجوع
     */
    override fun onBackPressed() {
        when {
            // إذا كان في غير لوحة التحكم، العودة للوحة التحكم
            binding.bottomNavigation.selectedItemId != R.id.nav_dashboard -> {
                binding.bottomNavigation.selectedItemId = R.id.nav_dashboard
            }
            // إذا كان في لوحة التحكم، إظهار تأكيد الخروج
            else -> {
                showExitConfirmation()
            }
        }
    }
    
    /**
     * إظهار تأكيد الخروج
     */
    private fun showExitConfirmation() {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("خروج من التطبيق")
            .setMessage("هل أنت متأكد من الخروج من التطبيق؟")
            .setPositiveButton("خروج") { _, _ ->
                finish()
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }
    
    /**
     * تحديث رؤية عناصر القائمة عند تغيير الجزء
     */
    override fun onPrepareOptionsMenu(menu: Menu): Boolean {
        updateMenuVisibility(menu)
        return super.onPrepareOptionsMenu(menu)
    }
    
    companion object {
        private const val REQUEST_CODE_SCAN = 1001
    }
}

/**
 * حالات المزامنة
 */
sealed class SyncStatus {
    object InProgress : SyncStatus()
    object Success : SyncStatus()
    data class Error(val message: String) : SyncStatus()
}