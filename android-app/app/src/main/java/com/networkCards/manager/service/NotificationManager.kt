package com.networkCards.manager.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.networkCards.manager.R
import com.networkCards.manager.ui.main.MainActivity
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.util.CurrencyFormatter
import javax.inject.Inject
import javax.inject.Singleton

/**
 * مدير الإشعارات المحلية
 * يدير إرسال الإشعارات للمستخدم
 */
@Singleton
class NotificationManager @Inject constructor(
    private val context: Context
) {
    
    private val notificationManager = NotificationManagerCompat.from(context)
    
    companion object {
        // قنوات الإشعارات
        private const val CHANNEL_SALES = "sales_channel"
        private const val CHANNEL_PAYMENTS = "payments_channel"
        private const val CHANNEL_INVENTORY = "inventory_channel"
        private const val CHANNEL_REMINDERS = "reminders_channel"
        private const val CHANNEL_SYNC = "sync_channel"
        
        // معرفات الإشعارات
        private const val NOTIFICATION_ID_LOW_STOCK = 1001
        private const val NOTIFICATION_ID_OVERDUE_PAYMENT = 1002
        private const val NOTIFICATION_ID_DAILY_SUMMARY = 1003
        private const val NOTIFICATION_ID_SYNC_COMPLETE = 1004
        private const val NOTIFICATION_ID_BACKUP_REMINDER = 1005
    }
    
    init {
        createNotificationChannels()
    }
    
    /**
     * إنشاء قنوات الإشعارات
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_SALES,
                    "المبيعات والمدفوعات",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "إشعارات المبيعات والمدفوعات الجديدة"
                },
                
                NotificationChannel(
                    CHANNEL_PAYMENTS,
                    "المدفوعات المتأخرة",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "تذكير بالمدفوعات المتأخرة"
                },
                
                NotificationChannel(
                    CHANNEL_INVENTORY,
                    "المخزون",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "تنبيهات المخزون المنخفض"
                },
                
                NotificationChannel(
                    CHANNEL_REMINDERS,
                    "التذكيرات",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "التذكيرات العامة والمواعيد"
                },
                
                NotificationChannel(
                    CHANNEL_SYNC,
                    "المزامنة",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "حالة المزامنة والنسخ الاحتياطي"
                }
            )
            
            val systemNotificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            channels.forEach { channel ->
                systemNotificationManager.createNotificationChannel(channel)
            }
        }
    }
    
    /**
     * إشعار انخفاض المخزون
     */
    fun showLowStockNotification(packages: List<Package>) {
        if (packages.isEmpty()) return
        
        val title = "⚠️ تحذير: انخفاض المخزون"
        val content = if (packages.size == 1) {
            "الباقة \"${packages.first().name}\" وصلت للحد الأدنى (${packages.first().currentStock} كرت)"
        } else {
            "${packages.size} باقات وصلت للحد الأدنى من المخزون"
        }
        
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "packages")
            putExtra("highlight_low_stock", true)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_LOW_STOCK,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_INVENTORY)
            .setSmallIcon(R.drawable.ic_warning)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_inventory))
            .setContentTitle(title)
            .setContentText(content)
            .setStyle(createBigTextStyle(content, packages))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, R.color.warning))
            .addAction(
                R.drawable.ic_inventory,
                "عرض المخزون",
                pendingIntent
            )
            .build()
        
        notificationManager.notify(NOTIFICATION_ID_LOW_STOCK, notification)
    }
    
    /**
     * إشعار المدفوعات المتأخرة
     */
    fun showOverduePaymentsNotification(stores: List<Store>) {
        if (stores.isEmpty()) return
        
        val title = "💰 مدفوعات متأخرة"
        val totalDebt = stores.sumOf { it.balance }
        val content = if (stores.size == 1) {
            "المحل \"${stores.first().name}\" لديه مدفوعات متأخرة بقيمة ${CurrencyFormatter.format(stores.first().balance)}"
        } else {
            "${stores.size} محلات لديها مدفوعات متأخرة بإجمالي ${CurrencyFormatter.format(totalDebt)}"
        }
        
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "reports")
            putExtra("show_debt_report", true)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_OVERDUE_PAYMENT,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_PAYMENTS)
            .setSmallIcon(R.drawable.ic_payment_warning)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_money))
            .setContentTitle(title)
            .setContentText(content)
            .setStyle(createOverduePaymentsBigText(stores))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, R.color.error))
            .addAction(
                R.drawable.ic_report,
                "عرض التقرير",
                pendingIntent
            )
            .build()
        
        notificationManager.notify(NOTIFICATION_ID_OVERDUE_PAYMENT, notification)
    }
    
    /**
     * إشعار الملخص اليومي
     */
    fun showDailySummaryNotification(
        totalSales: Double,
        totalPayments: Double,
        newStores: Int
    ) {
        val title = "📊 ملخص اليوم"
        val netProfit = totalPayments - totalSales
        
        val content = """
            💰 إجمالي المبيعات: ${CurrencyFormatter.format(totalSales)}
            💳 إجمالي المدفوعات: ${CurrencyFormatter.format(totalPayments)}
            📈 صافي الربح: ${CurrencyFormatter.format(netProfit)}
            ${if (newStores > 0) "\n🏪 محلات جديدة: $newStores" else ""}
        """.trimIndent()
        
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "dashboard")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_DAILY_SUMMARY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_chart)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_dashboard))
            .setContentTitle(title)
            .setContentText("اضغط لعرض التفاصيل")
            .setStyle(NotificationCompat.BigTextStyle().bigText(content))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, R.color.primary))
            .build()
        
        notificationManager.notify(NOTIFICATION_ID_DAILY_SUMMARY, notification)
    }
    
    /**
     * إشعار اكتمال المزامنة
     */
    fun showSyncCompleteNotification(success: Boolean, message: String? = null) {
        val title = if (success) "✅ تمت المزامنة بنجاح" else "❌ فشلت المزامنة"
        val content = message ?: if (success) "تم تحديث جميع البيانات" else "تحقق من الاتصال بالإنترنت"
        
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_SYNC_COMPLETE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_SYNC)
            .setSmallIcon(if (success) R.drawable.ic_sync_success else R.drawable.ic_sync_error)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, if (success) R.color.success else R.color.error))
            .build()
        
        notificationManager.notify(NOTIFICATION_ID_SYNC_COMPLETE, notification)
    }
    
    /**
     * تذكير النسخة الاحتياطية
     */
    fun showBackupReminderNotification() {
        val title = "💾 تذكير: النسخة الاحتياطية"
        val content = "لم يتم إنشاء نسخة احتياطية منذ فترة. يُنصح بإنشاء نسخة احتياطية لحماية بياناتك."
        
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "settings")
            putExtra("show_backup_section", true)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_BACKUP_REMINDER,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // إضافة إجراء سريع للنسخ الاحتياطي
        val backupIntent = Intent(context, BackupService::class.java).apply {
            action = "CREATE_BACKUP"
        }
        val backupPendingIntent = PendingIntent.getService(
            context,
            0,
            backupIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_backup)
            .setLargeIcon(BitmapFactory.decodeResource(context.resources, R.drawable.ic_shield))
            .setContentTitle(title)
            .setContentText(content)
            .setStyle(NotificationCompat.BigTextStyle().bigText(content))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, R.color.info))
            .addAction(
                R.drawable.ic_backup,
                "نسخ احتياطي الآن",
                backupPendingIntent
            )
            .build()
        
        notificationManager.notify(NOTIFICATION_ID_BACKUP_REMINDER, notification)
    }
    
    /**
     * إشعار بيع جديد
     */
    fun showNewSaleNotification(storeName: String, amount: Double, packageName: String?) {
        val title = "💰 بيع جديد"
        val content = if (packageName != null) {
            "تم بيع \"$packageName\" للمحل \"$storeName\" بقيمة ${CurrencyFormatter.format(amount)}"
        } else {
            "تم تسجيل بيع للمحل \"$storeName\" بقيمة ${CurrencyFormatter.format(amount)}"
        }
        
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "stores")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_SALES)
            .setSmallIcon(R.drawable.ic_sale)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, R.color.success))
            .setTimeoutAfter(5000) // إخفاء تلقائي بعد 5 ثوانٍ
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    /**
     * إشعار دفعة جديدة
     */
    fun showNewPaymentNotification(storeName: String, amount: Double) {
        val title = "💳 دفعة جديدة"
        val content = "تم استلام دفعة من \"$storeName\" بقيمة ${CurrencyFormatter.format(amount)}"
        
        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("navigate_to", "stores")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_PAYMENTS)
            .setSmallIcon(R.drawable.ic_payment)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(ContextCompat.getColor(context, R.color.info))
            .setTimeoutAfter(5000)
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    /**
     * إنشاء نص كبير للمخزون المنخفض
     */
    private fun createBigTextStyle(content: String, packages: List<Package>): NotificationCompat.BigTextStyle {
        val bigText = StringBuilder(content)
        
        if (packages.size > 1) {
            bigText.append("\n\nالباقات المتأثرة:")
            packages.take(5).forEach { pkg ->
                bigText.append("\n• ${pkg.name}: ${pkg.currentStock} كرت")
            }
            
            if (packages.size > 5) {
                bigText.append("\n... و ${packages.size - 5} باقات أخرى")
            }
        }
        
        return NotificationCompat.BigTextStyle().bigText(bigText.toString())
    }
    
    /**
     * إنشاء نص كبير للمدفوعات المتأخرة
     */
    private fun createOverduePaymentsBigText(stores: List<Store>): NotificationCompat.BigTextStyle {
        val bigText = StringBuilder()
        
        stores.take(5).forEach { store ->
            bigText.append("• ${store.name}: ${CurrencyFormatter.format(store.balance)}\n")
        }
        
        if (stores.size > 5) {
            bigText.append("... و ${stores.size - 5} محلات أخرى")
        }
        
        return NotificationCompat.BigTextStyle().bigText(bigText.toString())
    }
    
    /**
     * إلغاء إشعار محدد
     */
    fun cancelNotification(notificationId: Int) {
        notificationManager.cancel(notificationId)
    }
    
    /**
     * إلغاء جميع الإشعارات
     */
    fun cancelAllNotifications() {
        notificationManager.cancelAll()
    }
    
    /**
     * التحقق من تمكين الإشعارات
     */
    fun areNotificationsEnabled(): Boolean {
        return notificationManager.areNotificationsEnabled()
    }
    
    /**
     * طلب تمكين الإشعارات
     */
    fun requestNotificationPermission(activity: androidx.fragment.app.FragmentActivity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    activity,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                androidx.core.app.ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),
                    REQUEST_CODE_NOTIFICATION_PERMISSION
                )
            }
        }
    }
    
    companion object {
        private const val REQUEST_CODE_NOTIFICATION_PERMISSION = 2001
    }
}