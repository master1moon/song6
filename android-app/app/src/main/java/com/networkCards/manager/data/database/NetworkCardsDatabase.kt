package com.networkCards.manager.data.database

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import android.content.Context
import com.networkCards.manager.data.database.dao.*
import com.networkCards.manager.data.model.*
import com.networkCards.manager.data.database.converter.Converters
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Date

/**
 * قاعدة البيانات الرئيسية للتطبيق
 * تستخدم Room للتعامل مع SQLite
 */
@Database(
    entities = [
        Store::class,
        Package::class,
        Sale::class,
        Payment::class,
        Expense::class,
        Inventory::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class NetworkCardsDatabase : RoomDatabase() {
    
    // DAOs
    abstract fun storeDao(): StoreDao
    abstract fun packageDao(): PackageDao
    abstract fun saleDao(): SaleDao
    abstract fun paymentDao(): PaymentDao
    abstract fun expenseDao(): ExpenseDao
    abstract fun inventoryDao(): InventoryDao
    
    companion object {
        @Volatile
        private var INSTANCE: NetworkCardsDatabase? = null
        
        fun getDatabase(
            context: Context,
            scope: CoroutineScope
        ): NetworkCardsDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NetworkCardsDatabase::class.java,
                    "network_cards_database"
                )
                .addCallback(NetworkCardsDatabaseCallback(scope))
                .fallbackToDestructiveMigration() // للتطوير فقط
                .build()
                INSTANCE = instance
                instance
            }
        }
        
        /**
         * مستمع إنشاء قاعدة البيانات
         */
        private class NetworkCardsDatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateDatabase(database)
                    }
                }
            }
        }
        
        /**
         * ملء قاعدة البيانات بالبيانات الأولية
         */
        private suspend fun populateDatabase(db: NetworkCardsDatabase) {
            // مسح جميع البيانات أولاً
            db.storeDao().deleteAllStores()
            db.packageDao().deleteAllPackages()
            
            // إضافة باقات تجريبية
            val samplePackages = listOf(
                Package(
                    id = "pkg_1",
                    name = "باقة 50 جيجا",
                    description = "باقة إنترنت 50 جيجا شهرياً",
                    retailPrice = 100.0,
                    wholesalePrice = 85.0,
                    distributorPrice = 75.0,
                    currentStock = 500,
                    minStockLevel = 50,
                    category = "إنترنت منزلي",
                    barcode = "1234567890123"
                ),
                Package(
                    id = "pkg_2",
                    name = "باقة 100 جيجا",
                    description = "باقة إنترنت 100 جيجا شهرياً",
                    retailPrice = 150.0,
                    wholesalePrice = 130.0,
                    distributorPrice = 115.0,
                    currentStock = 300,
                    minStockLevel = 30,
                    category = "إنترنت منزلي",
                    barcode = "1234567890124"
                ),
                Package(
                    id = "pkg_3",
                    name = "باقة لامحدود",
                    description = "باقة إنترنت لامحدود شهرياً",
                    retailPrice = 200.0,
                    wholesalePrice = 180.0,
                    distributorPrice = 160.0,
                    currentStock = 200,
                    minStockLevel = 20,
                    category = "إنترنت منزلي",
                    barcode = "1234567890125",
                    isFeatured = true
                )
            )
            
            samplePackages.forEach { pkg ->
                db.packageDao().insertPackage(pkg)
            }
            
            // إضافة محلات تجريبية
            val sampleStores = listOf(
                Store(
                    id = "store_1",
                    name = "محل الشبكات الذهبية",
                    phone = "0501234567",
                    address = "الرياض - حي الملك فهد",
                    priceType = PriceType.RETAIL,
                    notes = "عميل مميز",
                    priority = 2,
                    creditLimit = 5000.0
                ),
                Store(
                    id = "store_2",
                    name = "مؤسسة الاتصالات المتقدمة",
                    phone = "0507654321",
                    address = "جدة - حي الصفا",
                    priceType = PriceType.WHOLESALE,
                    notes = "تاجر جملة",
                    priority = 1,
                    creditLimit = 10000.0
                ),
                Store(
                    id = "store_3",
                    name = "شركة التوزيع الشاملة",
                    phone = "0551112233",
                    address = "الدمام - الكورنيش",
                    priceType = PriceType.DISTRIBUTOR,
                    notes = "موزع رئيسي",
                    priority = 2,
                    creditLimit = 20000.0
                )
            )
            
            sampleStores.forEach { store ->
                db.storeDao().insertStore(store)
            }
            
            // إضافة مخزون تجريبي
            samplePackages.forEach { pkg ->
                db.inventoryDao().insertInventory(
                    Inventory(
                        id = "inv_${pkg.id}",
                        packageId = pkg.id,
                        quantity = pkg.currentStock,
                        notes = "مخزون أولي"
                    )
                )
            }
            
            println("✅ Database populated with sample data")
        }
    }
}