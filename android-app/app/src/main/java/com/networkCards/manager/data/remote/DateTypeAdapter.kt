package com.networkCards.manager.data.remote

import com.google.gson.*
import java.lang.reflect.Type
import java.text.SimpleDateFormat
import java.util.*

/**
 * محول التواريخ لـ Gson
 * يدير تحويل التواريخ من وإلى JSON
 */
class DateTypeAdapter : JsonSerializer<Date>, JsonDeserializer<Date> {
    
    private val dateFormats = arrayOf(
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US),
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US),
        SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US),
        SimpleDateFormat("yyyy-MM-dd", Locale.US),
        SimpleDateFormat("dd/MM/yyyy", Locale.US),
        SimpleDateFormat("dd-MM-yyyy", Locale.US)
    )
    
    init {
        dateFormats.forEach { it.timeZone = TimeZone.getTimeZone("UTC") }
    }
    
    override fun serialize(src: Date?, typeOfSrc: Type?, context: JsonSerializationContext?): JsonElement {
        return if (src == null) {
            JsonNull.INSTANCE
        } else {
            JsonPrimitive(dateFormats[0].format(src))
        }
    }
    
    override fun deserialize(json: JsonElement?, typeOfT: Type?, context: JsonDeserializationContext?): Date? {
        if (json == null || json.isJsonNull) {
            return null
        }
        
        val dateString = json.asString
        
        // محاولة تحليل التاريخ بجميع التنسيقات المدعومة
        for (format in dateFormats) {
            try {
                return format.parse(dateString)
            } catch (e: Exception) {
                // تجربة التنسيق التالي
            }
        }
        
        // إذا فشل جميع التنسيقات، محاولة تحليل timestamp
        try {
            val timestamp = dateString.toLong()
            return Date(timestamp)
        } catch (e: Exception) {
            // إرجاع التاريخ الحالي كآخر محاولة
            return Date()
        }
    }
}