/**
 * نظام التخزين المؤقت الذكي
 * Smart Cache System for Performance Optimization
 * 
 * يحل مشكلة الحسابات المتكررة عن طريق:
 * 1. حفظ نتائج الحسابات المكلفة
 * 2. إعادة استخدامها عند الطلب
 * 3. تحديثها فقط عند تغيير البيانات
 * 4. حذفها تلقائياً بعد انتهاء صلاحيتها
 */

class SmartCache {
    /**
     * إنشاء نظام تخزين مؤقت جديد
     * @param {Object} options - خيارات التكوين
     * @param {number} options.ttl - مدة الصلاحية بالميلي ثانية (افتراضي: 5 دقائق)
     * @param {number} options.maxSize - الحد الأقصى لعدد العناصر (افتراضي: 100)
     * @param {boolean} options.autoClean - التنظيف التلقائي (افتراضي: true)
     */
    /**
     * ملاحظة: الدالة constructor — وصف تلقائي موجز لوظيفتها.
     * المدخلات: options = {}
     * المخرجات: راجع التنفيذ
     */
    constructor(options = {}) {
        this.cache = new Map();
        this.ttl = options.ttl || 5 * 60 * 1000; // 5 دقائق افتراضياً
        this.maxSize = options.maxSize || 100;
        this.autoClean = options.autoClean !== false;
        this.hits = 0; // عدد المرات التي تم فيها استخدام الكاش
        this.misses = 0; // عدد المرات التي لم يكن فيها كاش
        
        // بدء التنظيف التلقائي
        if (this.autoClean) {
            this.startAutoCleaning();
        }
    }
    
    /**
     * حفظ قيمة في التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     * @param {*} value - القيمة المراد حفظها
     * @param {number} customTTL - مدة صلاحية مخصصة (اختياري)
     */
    /**
     * ملاحظة: الدالة set — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key, value, customTTL = null
     * المخرجات: راجع التنفيذ
     */
    set(key, value, customTTL = null) {
        // إذا وصلنا للحد الأقصى، احذف الأقدم
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value: value,
            timestamp: Date.now(),
            ttl: customTTL || this.ttl,
            accessCount: 0
        });
    }
    
    /**
     * الحصول على قيمة من التخزين المؤقت
     * @param {string} key - مفتاح التخزين
     * @returns {*} القيمة المخزنة أو null
     */
    /**
     * ملاحظة: الدالة get — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key
     * المخرجات: راجع التنفيذ
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            this.misses++;
            return null;
        }
        
        // التحقق من انتهاء الصلاحية
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        
        // تحديث عدد مرات الوصول
        item.accessCount++;
        item.lastAccessed = Date.now();
        
        this.hits++;
        return item.value;
    }
    
    /**
     * الحصول على قيمة أو حسابها إذا لم تكن موجودة
     * @param {string} key - مفتاح التخزين
     * @param {Function} computeFn - دالة الحساب
     * @param {number} customTTL - مدة صلاحية مخصصة
     * @returns {Promise<*>} القيمة
     */
    /**
     * ملاحظة: الدالة getOrCompute — وصف تلقائي موجز لوظيفتها.
     * المدخلات: key, computeFn, customTTL = null
     * المخرجات: راجع التنفيذ
     */
    async getOrCompute(key, computeFn, customTTL = null) {
        // محاولة الحصول من الكاش
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        
        // حساب القيمة الجديدة
        const value = await computeFn();
        
        // حفظها في الكاش
        this.set(key, value, customTTL);
        
        return value;
    }
    
    /**
     * إبطال (حذف) مفتاح محدد أو مجموعة مفاتيح
     * @param {string|RegExp|Function} pattern - النمط للبحث
     */
    /**
     * ملاحظة: الدالة invalidate — وصف تلقائي موجز لوظيفتها.
     * المدخلات: pattern
     * المخرجات: راجع التنفيذ
     */
    invalidate(pattern) {
        if (typeof pattern === 'string') {
            // حذف مفتاح محدد
            this.cache.delete(pattern);
        } else if (pattern instanceof RegExp) {
            // حذف المفاتيح المطابقة للنمط
            for (const key of this.cache.keys()) {
                if (pattern.test(key)) {
                    this.cache.delete(key);
                }
            }
        } else if (typeof pattern === 'function') {
            // حذف المفاتيح التي تحقق الشرط
            for (const [key, value] of this.cache.entries()) {
                if (pattern(key, value)) {
                    this.cache.delete(key);
                }
            }
        }
    }
    
    /**
     * مسح كل التخزين المؤقت
     */
    /**
     * ملاحظة: الدالة clear — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    
    /**
     * التنظيف التلقائي للعناصر المنتهية
     */
    /**
     * ملاحظة: الدالة cleanup — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
    
    /**
     * بدء التنظيف التلقائي الدوري
     */
    /**
     * ملاحظة: الدالة startAutoCleaning — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    startAutoCleaning() {
        // تنظيف كل دقيقة
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 1000);
    }
    
    /**
     * إيقاف التنظيف التلقائي
     */
    /**
     * ملاحظة: الدالة stopAutoCleaning — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    stopAutoCleaning() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    
    /**
     * الحصول على إحصائيات الأداء
     * @returns {Object} إحصائيات الكاش
     */
    /**
     * ملاحظة: الدالة getStats — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    getStats() {
        const hitRate = this.hits + this.misses > 0 
            ? (this.hits / (this.hits + this.misses) * 100).toFixed(2) 
            : 0;
            
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: hitRate + '%',
            items: Array.from(this.cache.entries()).map(([key, item]) => ({
                key: key,
                age: Date.now() - item.timestamp,
                accessCount: item.accessCount,
                size: JSON.stringify(item.value).length
            }))
        };
    }
}

/**
 * نظام تخزين مؤقت متخصص لأرصدة المحلات
 * يستخدم SmartCache مع تحسينات خاصة بالمحلات
 */
class StoreBalanceCache extends SmartCache {
    /**
     * ملاحظة: الدالة constructor — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    constructor() {
        super({
            ttl: 10 * 60 * 1000, // 10 دقائق
            maxSize: 500 // عدد كبير من المحلات
        });
    }
    
    /**
     * حساب رصيد محل
     * @param {string} storeId - معرف المحل
     * @returns {number} الرصيد
     */
    /**
     * ملاحظة: الدالة calculateBalance — وصف تلقائي موجز لوظيفتها.
     * المدخلات: storeId
     * المخرجات: راجع التنفيذ
     */
    async calculateBalance(storeId) {
        return await this.getOrCompute(
            `balance_${storeId}`,
            () => {
                // الحساب الفعلي (المكلف)
                const sales = data.sales.filter(s => s.storeId === storeId);
                const payments = data.payments.filter(p => p.storeId === storeId);
                const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
                const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                return totalSales - totalPayments;
            }
        );
    }
    
    /**
     * إبطال رصيد محل عند تغيير بياناته
     * @param {string} storeId - معرف المحل
     */
    /**
     * ملاحظة: الدالة invalidateStore — وصف تلقائي موجز لوظيفتها.
     * المدخلات: storeId
     * المخرجات: راجع التنفيذ
     */
    invalidateStore(storeId) {
        this.invalidate(`balance_${storeId}`);
    }
    
    /**
     * إبطال جميع الأرصدة
     */
    /**
     * ملاحظة: الدالة invalidateAll — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    invalidateAll() {
        this.invalidate(/^balance_/);
    }
}

/**
 * نظام تخزين مؤقت للتقارير المعقدة
 */
class ReportCache extends SmartCache {
    /**
     * ملاحظة: الدالة constructor — وصف تلقائي موجز لوظيفتها.
     * المدخلات: بدون
     * المخرجات: راجع التنفيذ
     */
    constructor() {
        super({
            ttl: 15 * 60 * 1000, // 15 دقيقة
            maxSize: 50 // عدد أقل للتقارير الكبيرة
        });
    }
    
    /**
     * إنشاء مفتاح فريد للتقرير بناءً على المعاملات
     */
    /**
     * ملاحظة: الدالة generateKey — وصف تلقائي موجز لوظيفتها.
     * المدخلات: reportType, filters
     * المخرجات: راجع التنفيذ
     */
    generateKey(reportType, filters) {
        return `report_${reportType}_${JSON.stringify(filters)}`;
    }
    
    /**
     * الحصول على تقرير أو حسابه
     */
    /**
     * ملاحظة: الدالة getReport — وصف تلقائي موجز لوظيفتها.
     * المدخلات: reportType, filters, computeFn
     * المخرجات: راجع التنفيذ
     */
    async getReport(reportType, filters, computeFn) {
        const key = this.generateKey(reportType, filters);
        return await this.getOrCompute(key, computeFn);
    }
}

// إنشاء instances عامة للاستخدام في التطبيق
const balanceCache = new StoreBalanceCache();
const reportCache = new ReportCache();
const generalCache = new SmartCache();

// تصدير للاستخدام في ملفات أخرى
if (typeof window !== 'undefined') {
    window.SmartCache = SmartCache;
    window.balanceCache = balanceCache;
    window.reportCache = reportCache;
    window.generalCache = generalCache;
}

/**
 * مثال على كيفية دمج الكاش في الكود الحالي
 */

// قبل (الكود الحالي - بطيء):
/*
function renderStoresList() {
    filteredStores = filteredStores.map(store => {
        const sales = data.sales.filter(s => s.storeId === store.id);
        const payments = data.payments.filter(p => p.storeId === store.id);
        const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const balance = totalSales - totalPayments;
        return { ...store, balance };
    });
}
*/

// بعد (مع الكاش - سريع):
/*
async function renderStoresListOptimized() {
    filteredStores = await Promise.all(
        filteredStores.map(async store => {
            const balance = await balanceCache.calculateBalance(store.id);
            return { ...store, balance };
        })
    );
}
*/

/**
 * إبطال الكاش عند تغيير البيانات
 */

// عند إضافة بيع جديد
/*
function saveSale() {
    // ... كود حفظ البيع
    
    // إبطال كاش المحل المتأثر
    balanceCache.invalidateStore(storeId);
    
    // إبطال التقارير ذات الصلة
    reportCache.invalidate(/^report_profit/);
}
*/

// عند إضافة دفعة جديدة
/*
function savePayment() {
    // ... كود حفظ الدفعة
    
    // إبطال كاش المحل المتأثر
    balanceCache.invalidateStore(storeId);
    
    // إبطال التقارير ذات الصلة
    reportCache.invalidate(/^report_debt/);
}
*/

/**
 * مراقبة أداء الكاش
 */
/*
// عرض إحصائيات الكاش في وحدة التحكم
setInterval(() => {
    console.log('Balance Cache Stats:', balanceCache.getStats());
    console.log('Report Cache Stats:', reportCache.getStats());
}, 60000); // كل دقيقة
*/