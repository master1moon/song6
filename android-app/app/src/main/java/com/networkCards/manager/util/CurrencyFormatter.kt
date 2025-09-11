package com.networkCards.manager.util

import java.text.NumberFormat
import java.util.Locale

/**
 * منسق العملة
 * يوفر تنسيق موحد للمبالغ المالية
 */
object CurrencyFormatter {
    
    private val arabicLocale = Locale("ar", "SA")
    private val currencyFormatter = NumberFormat.getCurrencyInstance(arabicLocale)
    private val numberFormatter = NumberFormat.getNumberInstance(arabicLocale)
    
    /**
     * تنسيق المبلغ كعملة
     */
    fun format(amount: Double): String {
        return try {
            currencyFormatter.format(amount)
        } catch (e: Exception) {
            "${numberFormatter.format(amount)} ريال"
        }
    }
    
    /**
     * تنسيق المبلغ كرقم فقط
     */
    fun formatNumber(amount: Double): String {
        return numberFormatter.format(amount)
    }
    
    /**
     * تنسيق مختصر للمبالغ الكبيرة
     */
    fun formatShort(amount: Double): String {
        return when {
            amount >= 1_000_000 -> "${numberFormatter.format(amount / 1_000_000)} مليون"
            amount >= 1_000 -> "${numberFormatter.format(amount / 1_000)} ألف"
            else -> format(amount)
        }
    }
    
    /**
     * تحليل نص المبلغ إلى رقم
     */
    fun parse(amountText: String): Double? {
        return try {
            val cleanText = amountText
                .replace("ريال", "")
                .replace("،", ",")
                .replace(" ", "")
                .trim()
            
            numberFormatter.parse(cleanText)?.toDouble()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * التحقق من صحة المبلغ
     */
    fun isValidAmount(amountText: String): Boolean {
        return parse(amountText) != null
    }
    
    /**
     * تنسيق مع لون حسب القيمة
     */
    fun formatWithColor(amount: Double): Pair<String, Int> {
        val formattedAmount = format(amount)
        val color = when {
            amount > 0 -> android.graphics.Color.parseColor("#4CAF50") // أخضر
            amount < 0 -> android.graphics.Color.parseColor("#F44336") // أحمر
            else -> android.graphics.Color.parseColor("#757575") // رمادي
        }
        
        return Pair(formattedAmount, color)
    }
}