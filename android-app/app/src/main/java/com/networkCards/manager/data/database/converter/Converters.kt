package com.networkCards.manager.data.database.converter

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.networkCards.manager.data.model.*
import java.util.Date

/**
 * محولات أنواع البيانات لـ Room Database
 * تحول البيانات المعقدة لتخزينها في SQLite
 */
class Converters {
    
    private val gson = Gson()
    
    // ================ تحويل التواريخ ================
    
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
    
    // ================ تحويل Enums ================
    
    @TypeConverter
    fun fromPriceType(priceType: PriceType): String {
        return priceType.name
    }
    
    @TypeConverter
    fun toPriceType(priceType: String): PriceType {
        return PriceType.valueOf(priceType)
    }
    
    @TypeConverter
    fun fromStoreStatus(status: StoreStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toStoreStatus(status: String): StoreStatus {
        return StoreStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromStockStatus(status: StockStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toStockStatus(status: String): StockStatus {
        return StockStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromSaleStatus(status: SaleStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toSaleStatus(status: String): SaleStatus {
        return SaleStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromPaymentStatus(status: PaymentStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toPaymentStatus(status: String): PaymentStatus {
        return PaymentStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromPaymentMethod(method: PaymentMethod): String {
        return method.name
    }
    
    @TypeConverter
    fun toPaymentMethod(method: String): PaymentMethod {
        return PaymentMethod.valueOf(method)
    }
    
    @TypeConverter
    fun fromVerificationStatus(status: VerificationStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toVerificationStatus(status: String): VerificationStatus {
        return VerificationStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromSaleSource(source: SaleSource): String {
        return source.name
    }
    
    @TypeConverter
    fun toSaleSource(source: String): SaleSource {
        return SaleSource.valueOf(source)
    }
    
    @TypeConverter
    fun fromExpenseCategory(category: ExpenseCategory): String {
        return category.name
    }
    
    @TypeConverter
    fun toExpenseCategory(category: String): ExpenseCategory {
        return ExpenseCategory.valueOf(category)
    }
    
    @TypeConverter
    fun fromExpenseStatus(status: ExpenseStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toExpenseStatus(status: String): ExpenseStatus {
        return ExpenseStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromApprovalStatus(status: ApprovalStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toApprovalStatus(status: String): ApprovalStatus {
        return ApprovalStatus.valueOf(status)
    }
    
    @TypeConverter
    fun fromRecurringFrequency(frequency: RecurringFrequency?): String? {
        return frequency?.name
    }
    
    @TypeConverter
    fun toRecurringFrequency(frequency: String?): RecurringFrequency? {
        return frequency?.let { RecurringFrequency.valueOf(it) }
    }
    
    @TypeConverter
    fun fromInventoryOperationType(type: InventoryOperationType): String {
        return type.name
    }
    
    @TypeConverter
    fun toInventoryOperationType(type: String): InventoryOperationType {
        return InventoryOperationType.valueOf(type)
    }
    
    @TypeConverter
    fun fromInventoryStatus(status: InventoryStatus): String {
        return status.name
    }
    
    @TypeConverter
    fun toInventoryStatus(status: String): InventoryStatus {
        return InventoryStatus.valueOf(status)
    }
    
    // ================ تحويل القوائم والخرائط ================
    
    @TypeConverter
    fun fromStringList(value: List<String>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toStringList(value: String?): List<String>? {
        return value?.let {
            val listType = object : TypeToken<List<String>>() {}.type
            gson.fromJson(it, listType)
        }
    }
    
    @TypeConverter
    fun fromStringMap(value: Map<String, String>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toStringMap(value: String?): Map<String, String>? {
        return value?.let {
            val mapType = object : TypeToken<Map<String, String>>() {}.type
            gson.fromJson(it, mapType)
        }
    }
    
    // ================ تحويل البيانات المعقدة ================
    
    @TypeConverter
    fun fromDoubleList(value: List<Double>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toDoubleList(value: String?): List<Double>? {
        return value?.let {
            val listType = object : TypeToken<List<Double>>() {}.type
            gson.fromJson(it, listType)
        }
    }
    
    @TypeConverter
    fun fromIntList(value: List<Int>?): String? {
        return value?.let { gson.toJson(it) }
    }
    
    @TypeConverter
    fun toIntList(value: String?): List<Int>? {
        return value?.let {
            val listType = object : TypeToken<List<Int>>() {}.type
            gson.fromJson(it, listType)
        }
    }
}