package com.networkCards.manager.ui.store

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ActivityAddEditStoreBinding
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.PriceType
import com.networkCards.manager.util.PermissionUtil
import com.networkCards.manager.util.ValidationUtil
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.util.Date

/**
 * نشاط إضافة/تعديل المحل
 * يوفر نموذج شامل لإدارة بيانات المحل
 */
@AndroidEntryPoint
class AddEditStoreActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityAddEditStoreBinding
    private val viewModel: AddEditStoreViewModel by viewModels()
    
    private var editingStore: Store? = null
    private var isEditMode = false
    
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var currentLocation: Location? = null
    
    // مطالب الصلاحيات
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
            getCurrentLocation()
        } else {
            Toast.makeText(this, "صلاحية الموقع مطلوبة لحفظ موقع المحل", Toast.LENGTH_LONG).show()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityAddEditStoreBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // تهيئة خدمة الموقع
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        // التحقق من وضع التعديل
        checkEditMode()
        
        setupUI()
        observeData()
        loadStoreData()
    }
    
    /**
     * التحقق من وضع التعديل
     */
    private fun checkEditMode() {
        editingStore = intent.getParcelableExtra("store")
        isEditMode = editingStore != null
        
        // تحديث العنوان
        title = if (isEditMode) "تعديل المحل" else "إضافة محل جديد"
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
            title = if (isEditMode) "تعديل المحل" else "إضافة محل جديد"
        }
        
        // إعداد قائمة أنواع الأسعار
        setupPriceTypeSpinner()
        
        // إعداد قائمة الأولوية
        setupPrioritySpinner()
        
        // إعداد الأزرار
        setupButtons()
        
        // إعداد التحقق من صحة البيانات
        setupValidation()
    }
    
    /**
     * إعداد قائمة أنواع الأسعار
     */
    private fun setupPriceTypeSpinner() {
        val priceTypes = PriceType.values().map { it.arabicName }
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, priceTypes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerPriceType.adapter = adapter
    }
    
    /**
     * إعداد قائمة الأولوية
     */
    private fun setupPrioritySpinner() {
        val priorities = listOf("عادي", "مهم", "VIP")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, priorities)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerPriority.adapter = adapter
    }
    
    /**
     * إعداد الأزرار
     */
    private fun setupButtons() {
        // زر الحفظ
        binding.buttonSave.setOnClickListener {
            saveStore()
        }
        
        // زر الإلغاء
        binding.buttonCancel.setOnClickListener {
            finish()
        }
        
        // زر الموقع الحالي
        binding.buttonCurrentLocation.setOnClickListener {
            requestCurrentLocation()
        }
        
        // زر مسح الموقع
        binding.buttonClearLocation.setOnClickListener {
            clearLocation()
        }
    }
    
    /**
     * إعداد التحقق من صحة البيانات
     */
    private fun setupValidation() {
        // التحقق من اسم المحل
        binding.editTextStoreName.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                validateStoreName()
            }
        }
        
        // التحقق من رقم الهاتف
        binding.editTextStorePhone.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                validatePhoneNumber()
            }
        }
        
        // التحقق من حد الائتمان
        binding.editTextCreditLimit.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                validateCreditLimit()
            }
        }
    }
    
    /**
     * مراقبة البيانات
     */
    private fun observeData() {
        // مراقبة حالة الحفظ
        viewModel.saveResult.observe(this) { result ->
            result.fold(
                onSuccess = { store ->
                    Toast.makeText(
                        this,
                        if (isEditMode) "تم تحديث المحل بنجاح" else "تم إضافة المحل بنجاح",
                        Toast.LENGTH_SHORT
                    ).show()
                    
                    setResult(RESULT_OK)
                    finish()
                },
                onFailure = { error ->
                    Toast.makeText(this, "فشل في الحفظ: ${error.message}", Toast.LENGTH_LONG).show()
                }
            )
        }
        
        // مراقبة حالة التحميل
        viewModel.isLoading.observe(this) { isLoading ->
            binding.buttonSave.isEnabled = !isLoading
            binding.progressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        }
        
        // مراقبة الأخطاء
        viewModel.error.observe(this) { error ->
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show()
                viewModel.clearError()
            }
        }
    }
    
    /**
     * تحميل بيانات المحل للتعديل
     */
    private fun loadStoreData() {
        editingStore?.let { store ->
            binding.apply {
                editTextStoreName.setText(store.name)
                editTextStorePhone.setText(store.phone ?: "")
                editTextStoreAddress.setText(store.address ?: "")
                editTextStoreNotes.setText(store.notes ?: "")
                editTextContactPerson.setText(store.contactPerson ?: "")
                editTextEmail.setText(store.email ?: "")
                editTextWebsite.setText(store.website ?: "")
                editTextCreditLimit.setText(if (store.creditLimit > 0) store.creditLimit.toString() else "")
                
                // نوع السعر
                spinnerPriceType.setSelection(store.priceType.ordinal)
                
                // الأولوية
                spinnerPriority.setSelection(store.priority)
                
                // الحالة النشطة
                switchActive.isChecked = store.isActive
                
                // الموقع
                if (store.latitude != null && store.longitude != null) {
                    textLocationInfo.text = "الموقع محفوظ: ${store.latitude}, ${store.longitude}"
                    buttonClearLocation.visibility = android.view.View.VISIBLE
                }
            }
        }
    }
    
    /**
     * حفظ المحل
     */
    private fun saveStore() {
        if (!validateAllFields()) {
            return
        }
        
        val store = createStoreFromForm()
        
        lifecycleScope.launch {
            if (isEditMode) {
                viewModel.updateStore(store)
            } else {
                viewModel.insertStore(store)
            }
        }
    }
    
    /**
     * إنشاء كائن المحل من النموذج
     */
    private fun createStoreFromForm(): Store {
        val name = binding.editTextStoreName.text.toString().trim()
        val phone = binding.editTextStorePhone.text.toString().trim().takeIf { it.isNotEmpty() }
        val address = binding.editTextStoreAddress.text.toString().trim().takeIf { it.isNotEmpty() }
        val notes = binding.editTextStoreNotes.text.toString().trim().takeIf { it.isNotEmpty() }
        val contactPerson = binding.editTextContactPerson.text.toString().trim().takeIf { it.isNotEmpty() }
        val email = binding.editTextEmail.text.toString().trim().takeIf { it.isNotEmpty() }
        val website = binding.editTextWebsite.text.toString().trim().takeIf { it.isNotEmpty() }
        val creditLimitText = binding.editTextCreditLimit.text.toString().trim()
        val creditLimit = if (creditLimitText.isNotEmpty()) creditLimitText.toDoubleOrNull() ?: 0.0 else 0.0
        
        val priceType = PriceType.values()[binding.spinnerPriceType.selectedItemPosition]
        val priority = binding.spinnerPriority.selectedItemPosition
        val isActive = binding.switchActive.isChecked
        
        return if (isEditMode && editingStore != null) {
            editingStore!!.copy(
                name = name,
                phone = phone,
                address = address,
                notes = notes,
                contactPerson = contactPerson,
                email = email,
                website = website,
                creditLimit = creditLimit,
                priceType = priceType,
                priority = priority,
                isActive = isActive,
                latitude = currentLocation?.latitude ?: editingStore!!.latitude,
                longitude = currentLocation?.longitude ?: editingStore!!.longitude,
                updatedAt = Date()
            )
        } else {
            Store(
                id = "store_${System.currentTimeMillis()}",
                name = name,
                phone = phone,
                address = address,
                notes = notes,
                contactPerson = contactPerson,
                email = email,
                website = website,
                creditLimit = creditLimit,
                priceType = priceType,
                priority = priority,
                isActive = isActive,
                latitude = currentLocation?.latitude,
                longitude = currentLocation?.longitude,
                createdAt = Date(),
                updatedAt = Date()
            )
        }
    }
    
    /**
     * التحقق من جميع الحقول
     */
    private fun validateAllFields(): Boolean {
        var isValid = true
        
        if (!validateStoreName()) isValid = false
        if (!validatePhoneNumber()) isValid = false
        if (!validateEmail()) isValid = false
        if (!validateWebsite()) isValid = false
        if (!validateCreditLimit()) isValid = false
        
        return isValid
    }
    
    /**
     * التحقق من اسم المحل
     */
    private fun validateStoreName(): Boolean {
        val name = binding.editTextStoreName.text.toString().trim()
        
        return when {
            name.isEmpty() -> {
                binding.textInputLayoutStoreName.error = "اسم المحل مطلوب"
                false
            }
            name.length < 2 -> {
                binding.textInputLayoutStoreName.error = "اسم المحل يجب أن يكون حرفين على الأقل"
                false
            }
            name.length > 100 -> {
                binding.textInputLayoutStoreName.error = "اسم المحل طويل جداً"
                false
            }
            else -> {
                binding.textInputLayoutStoreName.error = null
                true
            }
        }
    }
    
    /**
     * التحقق من رقم الهاتف
     */
    private fun validatePhoneNumber(): Boolean {
        val phone = binding.editTextStorePhone.text.toString().trim()
        
        if (phone.isEmpty()) {
            binding.textInputLayoutStorePhone.error = null
            return true // الهاتف اختياري
        }
        
        return if (ValidationUtil.isValidPhoneNumber(phone)) {
            binding.textInputLayoutStorePhone.error = null
            true
        } else {
            binding.textInputLayoutStorePhone.error = "رقم الهاتف غير صحيح"
            false
        }
    }
    
    /**
     * التحقق من البريد الإلكتروني
     */
    private fun validateEmail(): Boolean {
        val email = binding.editTextEmail.text.toString().trim()
        
        if (email.isEmpty()) {
            binding.textInputLayoutEmail.error = null
            return true // البريد اختياري
        }
        
        return if (ValidationUtil.isValidEmail(email)) {
            binding.textInputLayoutEmail.error = null
            true
        } else {
            binding.textInputLayoutEmail.error = "البريد الإلكتروني غير صحيح"
            false
        }
    }
    
    /**
     * التحقق من الموقع الإلكتروني
     */
    private fun validateWebsite(): Boolean {
        val website = binding.editTextWebsite.text.toString().trim()
        
        if (website.isEmpty()) {
            binding.textInputLayoutWebsite.error = null
            return true // الموقع اختياري
        }
        
        return if (ValidationUtil.isValidUrl(website)) {
            binding.textInputLayoutWebsite.error = null
            true
        } else {
            binding.textInputLayoutWebsite.error = "رابط الموقع غير صحيح"
            false
        }
    }
    
    /**
     * التحقق من حد الائتمان
     */
    private fun validateCreditLimit(): Boolean {
        val creditLimitText = binding.editTextCreditLimit.text.toString().trim()
        
        if (creditLimitText.isEmpty()) {
            binding.textInputLayoutCreditLimit.error = null
            return true // حد الائتمان اختياري
        }
        
        val creditLimit = creditLimitText.toDoubleOrNull()
        
        return when {
            creditLimit == null -> {
                binding.textInputLayoutCreditLimit.error = "حد الائتمان يجب أن يكون رقماً"
                false
            }
            creditLimit < 0 -> {
                binding.textInputLayoutCreditLimit.error = "حد الائتمان لا يمكن أن يكون سالباً"
                false
            }
            creditLimit > 1_000_000 -> {
                binding.textInputLayoutCreditLimit.error = "حد الائتمان كبير جداً"
                false
            }
            else -> {
                binding.textInputLayoutCreditLimit.error = null
                true
            }
        }
    }
    
    /**
     * طلب الموقع الحالي
     */
    private fun requestCurrentLocation() {
        if (PermissionUtil.hasLocationPermission(this)) {
            getCurrentLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }
    
    /**
     * الحصول على الموقع الحالي
     */
    private fun getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        
        binding.progressBarLocation.visibility = android.view.View.VISIBLE
        binding.buttonCurrentLocation.isEnabled = false
        
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                if (location != null) {
                    currentLocation = location
                    binding.textLocationInfo.text = 
                        "الموقع الحالي: ${location.latitude}, ${location.longitude}"
                    binding.buttonClearLocation.visibility = android.view.View.VISIBLE
                    
                    Toast.makeText(this, "تم حفظ الموقع الحالي", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "لم يتم العثور على الموقع الحالي", Toast.LENGTH_SHORT).show()
                }
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "فشل في الحصول على الموقع: ${e.message}", Toast.LENGTH_LONG).show()
            }
            .addOnCompleteListener {
                binding.progressBarLocation.visibility = android.view.View.GONE
                binding.buttonCurrentLocation.isEnabled = true
            }
    }
    
    /**
     * مسح الموقع
     */
    private fun clearLocation() {
        currentLocation = null
        binding.textLocationInfo.text = "لم يتم تحديد موقع"
        binding.buttonClearLocation.visibility = android.view.View.GONE
        
        Toast.makeText(this, "تم مسح الموقع", Toast.LENGTH_SHORT).show()
    }
    
    /**
     * إنشاء قائمة الخيارات
     */
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.add_edit_store_menu, menu)
        
        // إظهار زر الحذف فقط في وضع التعديل
        menu.findItem(R.id.action_delete)?.isVisible = isEditMode
        
        return true
    }
    
    /**
     * معالجة اختيار عناصر القائمة
     */
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                true
            }
            R.id.action_save -> {
                saveStore()
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
     * تأكيد حذف المحل
     */
    private fun confirmDeleteStore() {
        if (!isEditMode || editingStore == null) return
        
        MaterialAlertDialogBuilder(this)
            .setTitle("حذف المحل")
            .setMessage("هل أنت متأكد من حذف المحل \"${editingStore!!.name}\"؟")
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
        editingStore?.let { store ->
            lifecycleScope.launch {
                viewModel.deleteStore(store)
                
                Toast.makeText(this@AddEditStoreActivity, "تم حذف المحل بنجاح", Toast.LENGTH_SHORT).show()
                setResult(RESULT_OK)
                finish()
            }
        }
    }
    
    /**
     * معالجة زر الرجوع
     */
    override fun onBackPressed() {
        if (hasUnsavedChanges()) {
            MaterialAlertDialogBuilder(this)
                .setTitle("تغييرات غير محفوظة")
                .setMessage("لديك تغييرات غير محفوظة. هل تريد الخروج بدون حفظ؟")
                .setPositiveButton("خروج بدون حفظ") { _, _ ->
                    super.onBackPressed()
                }
                .setNegativeButton("البقاء", null)
                .setNeutralButton("حفظ والخروج") { _, _ ->
                    saveStore()
                }
                .show()
        } else {
            super.onBackPressed()
        }
    }
    
    /**
     * التحقق من وجود تغييرات غير محفوظة
     */
    private fun hasUnsavedChanges(): Boolean {
        if (!isEditMode) {
            // في وضع الإضافة، أي نص يعتبر تغيير
            return binding.editTextStoreName.text.toString().trim().isNotEmpty() ||
                   binding.editTextStorePhone.text.toString().trim().isNotEmpty() ||
                   binding.editTextStoreAddress.text.toString().trim().isNotEmpty()
        }
        
        // في وضع التعديل، مقارنة مع البيانات الأصلية
        editingStore?.let { original ->
            return binding.editTextStoreName.text.toString().trim() != original.name ||
                   binding.editTextStorePhone.text.toString().trim() != (original.phone ?: "") ||
                   binding.editTextStoreAddress.text.toString().trim() != (original.address ?: "") ||
                   binding.editTextStoreNotes.text.toString().trim() != (original.notes ?: "") ||
                   binding.switchActive.isChecked != original.isActive ||
                   binding.spinnerPriceType.selectedItemPosition != original.priceType.ordinal
        }
        
        return false
    }
}