package com.networkCards.manager.di

import android.content.Context
import androidx.room.Room
import com.networkCards.manager.data.database.NetworkCardsDatabase
import com.networkCards.manager.data.database.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Qualifier
import javax.inject.Singleton

/**
 * وحدة حقن التبعيات لقاعدة البيانات
 * تدير إنشاء وتوفير قاعدة البيانات والDAOs
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    /**
     * توفير CoroutineScope للتطبيق
     */
    @ApplicationScope
    @Provides
    @Singleton
    fun provideApplicationScope(): CoroutineScope = CoroutineScope(SupervisorJob())
    
    /**
     * توفير قاعدة البيانات
     */
    @Provides
    @Singleton
    fun provideNetworkCardsDatabase(
        @ApplicationContext context: Context,
        @ApplicationScope scope: CoroutineScope
    ): NetworkCardsDatabase {
        return Room.databaseBuilder(
            context.applicationContext,
            NetworkCardsDatabase::class.java,
            "network_cards_database"
        )
        .addCallback(NetworkCardsDatabase.NetworkCardsDatabaseCallback(scope))
        .fallbackToDestructiveMigration() // للتطوير فقط
        .build()
    }
    
    /**
     * توفير StoreDao
     */
    @Provides
    fun provideStoreDao(database: NetworkCardsDatabase): StoreDao = database.storeDao()
    
    /**
     * توفير PackageDao
     */
    @Provides
    fun providePackageDao(database: NetworkCardsDatabase): PackageDao = database.packageDao()
    
    /**
     * توفير SaleDao
     */
    @Provides
    fun provideSaleDao(database: NetworkCardsDatabase): SaleDao = database.saleDao()
    
    /**
     * توفير PaymentDao
     */
    @Provides
    fun providePaymentDao(database: NetworkCardsDatabase): PaymentDao = database.paymentDao()
    
    /**
     * توفير ExpenseDao
     */
    @Provides
    fun provideExpenseDao(database: NetworkCardsDatabase): ExpenseDao = database.expenseDao()
    
    /**
     * توفير InventoryDao
     */
    @Provides
    fun provideInventoryDao(database: NetworkCardsDatabase): InventoryDao = database.inventoryDao()
}

/**
 * مؤهل لنطاق التطبيق
 */
@Retention(AnnotationRetention.RUNTIME)
@Qualifier
annotation class ApplicationScope