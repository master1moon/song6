package com.networkCards.manager.ui.scanner

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Vibrator
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.zxing.ResultPoint
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.journeyapps.barcodescanner.DecoratedBarcodeView
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ActivityBarcodeScannerBinding

/**
 * نشاط مسح الباركود
 * يستخدم الكاميرا لمسح أكواد الباقات والمنتجات
 */
class BarcodeScannerActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityBarcodeScannerBinding
    private lateinit var barcodeView: DecoratedBarcodeView
    private var isScanning = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityBarcodeScannerBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
        checkCameraPermission()
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
            title = "مسح الباركود"
        }
        
        // إعداد ماسح الباركود
        barcodeView = binding.barcodeScanner
        barcodeView.setStatusText("وجه الكاميرا نحو الباركود")
        
        // إعداد الأزرار
        binding.buttonFlashlight.setOnClickListener {
            toggleFlashlight()
        }
        
        binding.buttonManualEntry.setOnClickListener {
            showManualEntryDialog()
        }
        
        binding.buttonClose.setOnClickListener {
            finish()
        }
        
        // إعداد معالج المسح
        setupBarcodeCallback()
    }
    
    /**
     * التحقق من صلاحية الكاميرا
     */
    private fun checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            startScanning()
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                REQUEST_CODE_CAMERA
            )
        }
    }
    
    /**
     * بدء المسح
     */
    private fun startScanning() {
        isScanning = true
        barcodeView.resume()
    }
    
    /**
     * إيقاف المسح
     */
    private fun stopScanning() {
        isScanning = false
        barcodeView.pause()
    }
    
    /**
     * إعداد معالج نتائج المسح
     */
    private fun setupBarcodeCallback() {
        val callback = object : BarcodeCallback {
            override fun barcodeResult(result: BarcodeResult?) {
                if (result != null && isScanning) {
                    handleBarcodeResult(result.text)
                }
            }
            
            override fun possibleResultPoints(resultPoints: List<ResultPoint>) {
                // يمكن إضافة تأثيرات بصرية هنا
            }
        }
        
        barcodeView.decodeContinuous(callback)
    }
    
    /**
     * معالجة نتيجة المسح
     */
    private fun handleBarcodeResult(barcode: String) {
        stopScanning()
        
        // اهتزاز تأكيد
        val vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator
        if (vibrator.hasVibrator()) {
            vibrator.vibrate(100)
        }
        
        // عرض النتيجة
        binding.textScanResult.text = "تم مسح: $barcode"
        
        // تأثير صوتي (اختياري)
        try {
            val mediaPlayer = android.media.MediaPlayer.create(this, R.raw.beep_sound)
            mediaPlayer?.start()
            mediaPlayer?.setOnCompletionListener { mp -> mp.release() }
        } catch (e: Exception) {
            // تجاهل الخطأ إذا لم يكن الملف الصوتي موجود
        }
        
        // إرسال النتيجة والعودة
        val resultIntent = Intent().apply {
            putExtra("scanned_data", barcode)
            putExtra("scan_timestamp", System.currentTimeMillis())
        }
        
        setResult(RESULT_OK, resultIntent)
        
        // تأخير قصير قبل الإغلاق لإظهار النتيجة
        binding.root.postDelayed({
            finish()
        }, 1000)
    }
    
    /**
     * تبديل الفلاش
     */
    private fun toggleFlashlight() {
        if (barcodeView.torchOn) {
            barcodeView.setTorchOff()
            binding.buttonFlashlight.setIconResource(R.drawable.ic_flashlight_off)
            binding.buttonFlashlight.text = "تشغيل الفلاش"
        } else {
            barcodeView.setTorchOn()
            binding.buttonFlashlight.setIconResource(R.drawable.ic_flashlight_on)
            binding.buttonFlashlight.text = "إطفاء الفلاش"
        }
    }
    
    /**
     * إظهار نافذة الإدخال اليدوي
     */
    private fun showManualEntryDialog() {
        val editText = android.widget.EditText(this).apply {
            hint = "أدخل رقم الباركود"
            inputType = android.text.InputType.TYPE_CLASS_TEXT
        }
        
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("إدخال الباركود يدوياً")
            .setView(editText)
            .setPositiveButton("موافق") { _, _ ->
                val manualCode = editText.text.toString().trim()
                if (manualCode.isNotEmpty()) {
                    handleBarcodeResult(manualCode)
                } else {
                    Toast.makeText(this, "يرجى إدخال رقم الباركود", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }
    
    /**
     * معالجة نتائج طلب الصلاحيات
     */
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        when (requestCode) {
            REQUEST_CODE_CAMERA -> {
                if (grantResults.isNotEmpty() && 
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    startScanning()
                } else {
                    Toast.makeText(
                        this,
                        "صلاحية الكاميرا مطلوبة لمسح الباركود",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                }
            }
        }
    }
    
    /**
     * معالجة زر الرجوع
     */
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
    
    override fun onResume() {
        super.onResume()
        if (isScanning) {
            barcodeView.resume()
        }
    }
    
    override fun onPause() {
        super.onPause()
        barcodeView.pause()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        barcodeView.pause()
    }
    
    companion object {
        private const val REQUEST_CODE_CAMERA = 1001
    }
}