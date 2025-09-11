package com.networkCards.manager.util

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import com.networkCards.manager.data.model.*
import dagger.hilt.android.qualifiers.ApplicationContext
import org.apache.poi.ss.usermodel.*
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import timber.log.Timber
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مصدر Excel
 * يدير تصدير البيانات إلى ملفات Excel
 */
@Singleton
class ExcelExporter @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private val dateFormatter = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.getDefault())
    private val arabicDateFormatter = SimpleDateFormat("dd/MM/yyyy", Locale("ar"))
    
    /**
     * تصدير المحلات إلى Excel
     */
    suspend fun exportStores(stores: List<Store>): Uri {
        val workbook = XSSFWorkbook()
        
        try {
            // إنشاء ورقة المحلات
            val sheet = workbook.createSheet("المحلات")
            
            // إنشاء أنماط الخلايا
            val headerStyle = createHeaderStyle(workbook)
            val currencyStyle = createCurrencyStyle(workbook)
            val dateStyle = createDateStyle(workbook)
            
            // إنشاء رأس الجدول
            val headerRow = sheet.createRow(0)
            val headers = arrayOf(
                "المعرف", "اسم المحل", "رقم الهاتف", "العنوان", "نوع السعر",
                "الرصيد", "حد الائتمان", "الأولوية", "نشط", "تاريخ الإضافة",
                "آخر بيع", "آخر دفعة", "ملاحظات"
            )
            
            headers.forEachIndexed { index, header ->
                val cell = headerRow.createCell(index)
                cell.setCellValue(header)
                cell.cellStyle = headerStyle
            }
            
            // إضافة بيانات المحلات
            stores.forEachIndexed { index, store ->
                val row = sheet.createRow(index + 1)
                
                row.createCell(0).setCellValue(store.id)
                row.createCell(1).setCellValue(store.name)
                row.createCell(2).setCellValue(store.phone ?: "")
                row.createCell(3).setCellValue(store.address ?: "")
                row.createCell(4).setCellValue(store.priceType.arabicName)
                
                val balanceCell = row.createCell(5)
                balanceCell.setCellValue(store.balance)
                balanceCell.cellStyle = currencyStyle
                
                val creditLimitCell = row.createCell(6)
                creditLimitCell.setCellValue(store.creditLimit)
                creditLimitCell.cellStyle = currencyStyle
                
                row.createCell(7).setCellValue(getPriorityText(store.priority))
                row.createCell(8).setCellValue(if (store.isActive) "نعم" else "لا")
                
                val createdAtCell = row.createCell(9)
                createdAtCell.setCellValue(store.createdAt)
                createdAtCell.cellStyle = dateStyle
                
                val lastSaleCell = row.createCell(10)
                store.lastSaleDate?.let { 
                    lastSaleCell.setCellValue(it)
                    lastSaleCell.cellStyle = dateStyle
                }
                
                val lastPaymentCell = row.createCell(11)
                store.lastPaymentDate?.let { 
                    lastPaymentCell.setCellValue(it)
                    lastPaymentCell.cellStyle = dateStyle
                }
                
                row.createCell(12).setCellValue(store.notes ?: "")
            }
            
            // ضبط عرض الأعمدة
            for (i in headers.indices) {
                sheet.autoSizeColumn(i)
            }
            
            // حفظ الملف
            val fileName = "stores_export_${dateFormatter.format(Date())}.xlsx"
            val file = createFileInExternalStorage("exports", fileName)
            
            FileOutputStream(file).use { fos ->
                workbook.write(fos)
            }
            
            return FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            
        } finally {
            workbook.close()
        }
    }
    
    /**
     * تصدير بيانات محل معين
     */
    suspend fun exportStoreData(
        store: Store,
        sales: List<Sale>,
        payments: List<Payment>
    ): Uri {
        val workbook = XSSFWorkbook()
        
        try {
            // ورقة معلومات المحل
            createStoreInfoSheet(workbook, store)
            
            // ورقة المبيعات
            createSalesSheet(workbook, sales)
            
            // ورقة المدفوعات
            createPaymentsSheet(workbook, payments)
            
            // ورقة الملخص
            createSummarySheet(workbook, store, sales, payments)
            
            // حفظ الملف
            val fileName = "store_${store.name}_${dateFormatter.format(Date())}.xlsx"
            val file = createFileInExternalStorage("exports", fileName)
            
            FileOutputStream(file).use { fos ->
                workbook.write(fos)
            }
            
            return FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            
        } finally {
            workbook.close()
        }
    }
    
    /**
     * استيراد المحلات من Excel
     */
    suspend fun importStores(uri: Uri): List<Store> {
        val stores = mutableListOf<Store>()
        
        try {
            val inputStream = context.contentResolver.openInputStream(uri)
            val workbook = WorkbookFactory.create(inputStream)
            val sheet = workbook.getSheetAt(0)
            
            // تخطي رأس الجدول
            for (rowIndex in 1..sheet.lastRowNum) {
                val row = sheet.getRow(rowIndex) ?: continue
                
                try {
                    val store = Store(
                        id = getCellStringValue(row.getCell(0)) ?: "store_${System.currentTimeMillis()}_$rowIndex",
                        name = getCellStringValue(row.getCell(1)) ?: continue,
                        phone = getCellStringValue(row.getCell(2)),
                        address = getCellStringValue(row.getCell(3)),
                        priceType = parsePriceType(getCellStringValue(row.getCell(4))),
                        creditLimit = getCellNumericValue(row.getCell(6)),
                        priority = parsePriority(getCellStringValue(row.getCell(7))),
                        isActive = parseBoolean(getCellStringValue(row.getCell(8))),
                        notes = getCellStringValue(row.getCell(12)),
                        createdAt = Date(),
                        updatedAt = Date()
                    )
                    
                    stores.add(store)
                    
                } catch (e: Exception) {
                    Timber.w("⚠️ Failed to parse row $rowIndex: ${e.message}")
                }
            }
            
            workbook.close()
            inputStream?.close()
            
        } catch (e: Exception) {
            Timber.e(e, "❌ Failed to import stores from Excel")
            throw e
        }
        
        return stores
    }
    
    /**
     * إنشاء ورقة معلومات المحل
     */
    private fun createStoreInfoSheet(workbook: XSSFWorkbook, store: Store) {
        val sheet = workbook.createSheet("معلومات المحل")
        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)
        
        val data = listOf(
            "اسم المحل" to store.name,
            "رقم الهاتف" to (store.phone ?: ""),
            "العنوان" to (store.address ?: ""),
            "نوع السعر" to store.priceType.arabicName,
            "الرصيد" to CurrencyFormatter.format(store.balance),
            "حد الائتمان" to CurrencyFormatter.format(store.creditLimit),
            "الأولوية" to getPriorityText(store.priority),
            "الحالة" to (if (store.isActive) "نشط" else "غير نشط"),
            "تاريخ الإضافة" to arabicDateFormatter.format(store.createdAt),
            "آخر بيع" to (store.lastSaleDate?.let { arabicDateFormatter.format(it) } ?: "لا يوجد"),
            "آخر دفعة" to (store.lastPaymentDate?.let { arabicDateFormatter.format(it) } ?: "لا يوجد"),
            "ملاحظات" to (store.notes ?: "")
        )
        
        data.forEachIndexed { index, (label, value) ->
            val row = sheet.createRow(index)
            val labelCell = row.createCell(0)
            labelCell.setCellValue(label)
            labelCell.cellStyle = headerStyle
            
            row.createCell(1).setCellValue(value)
        }
        
        sheet.autoSizeColumn(0)
        sheet.autoSizeColumn(1)
    }
    
    /**
     * إنشاء ورقة المبيعات
     */
    private fun createSalesSheet(workbook: XSSFWorkbook, sales: List<Sale>) {
        val sheet = workbook.createSheet("المبيعات")
        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)
        val dateStyle = createDateStyle(workbook)
        
        // رأس الجدول
        val headerRow = sheet.createRow(0)
        val headers = arrayOf("التاريخ", "النوع", "الكمية", "السعر", "الإجمالي", "ملاحظات")
        
        headers.forEachIndexed { index, header ->
            val cell = headerRow.createCell(index)
            cell.setCellValue(header)
            cell.cellStyle = headerStyle
        }
        
        // البيانات
        sales.forEachIndexed { index, sale ->
            val row = sheet.createRow(index + 1)
            
            val dateCell = row.createCell(0)
            dateCell.setCellValue(sale.date)
            dateCell.cellStyle = dateStyle
            
            row.createCell(1).setCellValue(if (sale.isCustom) "مخصص" else "باقة")
            row.createCell(2).setCellValue(sale.quantity.toDouble())
            
            val priceCell = row.createCell(3)
            priceCell.setCellValue(sale.pricePerUnit)
            priceCell.cellStyle = currencyStyle
            
            val totalCell = row.createCell(4)
            totalCell.setCellValue(sale.total)
            totalCell.cellStyle = currencyStyle
            
            row.createCell(5).setCellValue(sale.notes ?: "")
        }
        
        // ضبط عرض الأعمدة
        for (i in headers.indices) {
            sheet.autoSizeColumn(i)
        }
    }
    
    /**
     * إنشاء ورقة المدفوعات
     */
    private fun createPaymentsSheet(workbook: XSSFWorkbook, payments: List<Payment>) {
        val sheet = workbook.createSheet("المدفوعات")
        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)
        val dateStyle = createDateStyle(workbook)
        
        // رأس الجدول
        val headerRow = sheet.createRow(0)
        val headers = arrayOf("التاريخ", "المبلغ", "طريقة الدفع", "الرقم المرجعي", "ملاحظات")
        
        headers.forEachIndexed { index, header ->
            val cell = headerRow.createCell(index)
            cell.setCellValue(header)
            cell.cellStyle = headerStyle
        }
        
        // البيانات
        payments.forEachIndexed { index, payment ->
            val row = sheet.createRow(index + 1)
            
            val dateCell = row.createCell(0)
            dateCell.setCellValue(payment.date)
            dateCell.cellStyle = dateStyle
            
            val amountCell = row.createCell(1)
            amountCell.setCellValue(payment.amount)
            amountCell.cellStyle = currencyStyle
            
            row.createCell(2).setCellValue(payment.paymentMethod.arabicName)
            row.createCell(3).setCellValue(payment.referenceNumber ?: "")
            row.createCell(4).setCellValue(payment.notes ?: "")
        }
        
        // ضبط عرض الأعمدة
        for (i in headers.indices) {
            sheet.autoSizeColumn(i)
        }
    }
    
    /**
     * إنشاء ورقة الملخص
     */
    private fun createSummarySheet(
        workbook: XSSFWorkbook,
        store: Store,
        sales: List<Sale>,
        payments: List<Payment>
    ) {
        val sheet = workbook.createSheet("الملخص")
        val headerStyle = createHeaderStyle(workbook)
        val currencyStyle = createCurrencyStyle(workbook)
        
        val totalSales = sales.sumOf { it.total }
        val totalPayments = payments.sumOf { it.amount }
        val balance = totalSales - totalPayments
        
        val summaryData = listOf(
            "اسم المحل" to store.name,
            "عدد المبيعات" to sales.size.toString(),
            "إجمالي المبيعات" to CurrencyFormatter.format(totalSales),
            "عدد المدفوعات" to payments.size.toString(),
            "إجمالي المدفوعات" to CurrencyFormatter.format(totalPayments),
            "الرصيد الحالي" to CurrencyFormatter.format(balance),
            "تاريخ التقرير" to arabicDateFormatter.format(Date())
        )
        
        summaryData.forEachIndexed { index, (label, value) ->
            val row = sheet.createRow(index)
            val labelCell = row.createCell(0)
            labelCell.setCellValue(label)
            labelCell.cellStyle = headerStyle
            
            row.createCell(1).setCellValue(value)
        }
        
        sheet.autoSizeColumn(0)
        sheet.autoSizeColumn(1)
    }
    
    /**
     * إنشاء نمط رأس الجدول
     */
    private fun createHeaderStyle(workbook: XSSFWorkbook): CellStyle {
        val style = workbook.createCellStyle()
        val font = workbook.createFont()
        
        font.bold = true
        font.color = IndexedColors.WHITE.getIndex()
        
        style.setFont(font)
        style.fillForegroundColor = IndexedColors.DARK_BLUE.getIndex()
        style.fillPattern = FillPatternType.SOLID_FOREGROUND
        style.alignment = HorizontalAlignment.CENTER
        style.verticalAlignment = VerticalAlignment.CENTER
        
        // إضافة حدود
        style.borderBottom = BorderStyle.THIN
        style.borderTop = BorderStyle.THIN
        style.borderRight = BorderStyle.THIN
        style.borderLeft = BorderStyle.THIN
        
        return style
    }
    
    /**
     * إنشاء نمط العملة
     */
    private fun createCurrencyStyle(workbook: XSSFWorkbook): CellStyle {
        val style = workbook.createCellStyle()
        style.dataFormat = workbook.createDataFormat().getFormat("#,##0.00 \"ريال\"")
        style.alignment = HorizontalAlignment.RIGHT
        
        return style
    }
    
    /**
     * إنشاء نمط التاريخ
     */
    private fun createDateStyle(workbook: XSSFWorkbook): CellStyle {
        val style = workbook.createCellStyle()
        style.dataFormat = workbook.createDataFormat().getFormat("dd/mm/yyyy")
        style.alignment = HorizontalAlignment.CENTER
        
        return style
    }
    
    /**
     * إنشاء ملف في التخزين الخارجي
     */
    private fun createFileInExternalStorage(directory: String, fileName: String): File {
        val dir = File(context.getExternalFilesDir(null), directory)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        
        return File(dir, fileName)
    }
    
    /**
     * الحصول على قيمة نصية من الخلية
     */
    private fun getCellStringValue(cell: Cell?): String? {
        return when (cell?.cellType) {
            CellType.STRING -> cell.stringCellValue
            CellType.NUMERIC -> cell.numericCellValue.toString()
            CellType.BOOLEAN -> cell.booleanCellValue.toString()
            else -> null
        }
    }
    
    /**
     * الحصول على قيمة رقمية من الخلية
     */
    private fun getCellNumericValue(cell: Cell?): Double {
        return when (cell?.cellType) {
            CellType.NUMERIC -> cell.numericCellValue
            CellType.STRING -> cell.stringCellValue.toDoubleOrNull() ?: 0.0
            else -> 0.0
        }
    }
    
    /**
     * تحليل نوع السعر
     */
    private fun parsePriceType(value: String?): PriceType {
        return when (value?.trim()) {
            "تجزئة" -> PriceType.RETAIL
            "جملة" -> PriceType.WHOLESALE
            "موزعين" -> PriceType.DISTRIBUTOR
            else -> PriceType.RETAIL
        }
    }
    
    /**
     * تحليل الأولوية
     */
    private fun parsePriority(value: String?): Int {
        return when (value?.trim()) {
            "عادي" -> 0
            "مهم" -> 1
            "VIP" -> 2
            else -> 0
        }
    }
    
    /**
     * تحليل القيمة المنطقية
     */
    private fun parseBoolean(value: String?): Boolean {
        return value?.trim()?.let {
            it.equals("نعم", ignoreCase = true) || 
            it.equals("true", ignoreCase = true) ||
            it == "1"
        } ?: true
    }
    
    /**
     * الحصول على نص الأولوية
     */
    private fun getPriorityText(priority: Int): String {
        return when (priority) {
            0 -> "عادي"
            1 -> "مهم"
            2 -> "VIP"
            else -> "عادي"
        }
    }
}